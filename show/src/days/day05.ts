import { PartAnimator, Solution, Trace, utils } from "./common";

type Part1TraceItemInput = { kind: "input", before: [string, string][], updates: string[][] };
type Part1TraceItemIndex = { kind: "index", index: number };
type Part1TraceItemIndexOut = { kind: "index-out", index: number };
type Part1TraceItemCheckSelect = { kind: "check-select", index: number, pageIndex: number };
type Part1TraceItemCheckSelectOut = { kind: "check-select-out", index: number, pageIndex: number };
type Part1TraceItemCheckSelectAgainst = { kind: "check-select-against", index: number, pageIndex: number };
type Part1TraceItemCheckSelectAgainstOut = { kind: "check-select-against-out", index: number, pageIndex: number };
type Part1TraceItemCheckSelectRuleBad = { kind: "check-select-rule-bad", ruleIndex: number };
type Part1TraceItemCheckSelectRuleGood = { kind: "check-select-rule-good" };
type Part1TraceItemCheckSelectRuleOut = { kind: "check-select-rule-out", ruleIndex?: number };
type Part1TraceItemCheckSafe = { kind: "check-safe", index: number, isSafe: boolean };
type Part1TraceItemTotal = { kind: "total", total: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemIndex | Part1TraceItemIndexOut | Part1TraceItemCheckSelect | Part1TraceItemCheckSelectOut | Part1TraceItemCheckSelectAgainst | Part1TraceItemCheckSelectAgainstOut | Part1TraceItemCheckSelectRuleBad | Part1TraceItemCheckSelectRuleGood | Part1TraceItemCheckSelectRuleOut | Part1TraceItemCheckSafe | Part1TraceItemTotal;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): [ [string, string][], string[][] ] {
        const [before, updates] = input.trim().split("\n\n");

        return [
            before.split("\n").map(line => {
                const [a, b] = line.split("|");
                return [a, b];
            }),
            updates.split("\n").map(line => line.split(",")),
        ];
    }

    private hasRule(before: [string, string][], a: string, b: string): number | undefined {
        for (let index = 0; index < before.length; index++) {
            const [lhs, rhs] = before[index];

            if (lhs === a && rhs === b) {
                return index;
            }
        }

        return undefined;
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const [before, updates] = this.parseInput(this.input);
        trace.push({ kind: "input", before, updates });

        let total = 0;
        for (let index = 0; index < updates.length; index++) {
            // Select the first update to check the pages order
            trace.push({ kind: "index", index });
            const update = updates[index];

            let isSafe = true;
            for (let pageIndex = 0; pageIndex < update.length; pageIndex++) {
                trace.push({ kind: "check-select", index, pageIndex });
                const page = update[pageIndex];

                for (let pageIndex2 = pageIndex + 1; pageIndex2 < update.length; pageIndex2++) {
                    trace.push({ kind: "check-select-against", index, pageIndex: pageIndex2 });
                    const page2 = update[pageIndex2];

                    const ruleIndex = this.hasRule(before, page2, page);
                    if (ruleIndex !== undefined) {
                        trace.push({ kind: "check-select-rule-bad", ruleIndex });
                        isSafe = false;
                    } else {
                        trace.push({ kind: "check-select-rule-good" });
                    }

                    trace.push({ kind: "check-select-rule-out", ruleIndex });
                    trace.push({ kind: "check-select-against-out", index, pageIndex: pageIndex2 });
                    if (!isSafe) {
                        break;
                    }
                }

                trace.push({ kind: "check-select-out", index, pageIndex });
                if (!isSafe) {
                    break;
                }
            }

            trace.push({ kind: "index-out", index });
            trace.push({ kind: "check-safe", index, isSafe });

            if (isSafe) {
                const middleIndex = Math.floor(update.length / 2);
                const middleItem = update[middleIndex];
                total += parseInt(middleItem, 10);
                trace.push({ kind: "total", total });
            }
        }

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private beforeColumn?: HTMLUListElement;
    private beforeRules?: { lhs: HTMLLIElement, arrow: HTMLLIElement, rhs: HTMLLIElement }[];
    private answerNumber?: HTMLSpanElement;
    private lhsItem?: HTMLSpanElement;
    private rhsItem?: HTMLSpanElement;
    private orderItem?: HTMLLIElement;
    private pagesColumn?: HTMLUListElement;
    private pages?: { item: HTMLLIElement, text: HTMLSpanElement }[][];

    constructor(inputDiv: HTMLDivElement, solutionDiv: HTMLDivElement) {
        this.inputDiv = inputDiv;
        this.solutionDiv = solutionDiv;

        this.reset();
    }

    reset(): void {
        this.inputDiv.classList.remove("hidden");
        this.solutionDiv.classList.add("hidden");
        this.solutionDiv.innerHTML = "";

        this.beforeColumn = undefined;
        this.beforeRules = undefined;
        this.answerNumber = undefined;
        this.lhsItem = undefined;
        this.rhsItem = undefined;
        this.orderItem = undefined;
        this.pagesColumn = undefined;
        this.pages = undefined;
    }

    begin(): void {
        this.reset();

        this.create();

        this.inputDiv.classList.add("hidden");
        this.solutionDiv.classList.remove("hidden");
    }

    step(step: Part1TraceItem): number {
        switch (step.kind) {
        case "input":
            return this.createInput(step);
        case "index":
            return this.index(step);
        case "index-out":
            return this.indexOut(step);
        case "check-select":
            return this.checkSelect(step);
        case "check-select-out":
            return this.checkSelectOut(step);
        case "check-select-against":
            return this.checkSelectAgainst(step);
        case "check-select-against-out":
            return this.checkSelectAgainstOut(step);
        case "check-select-rule-bad":
            return this.checkSelectRuleBad(step);
        case "check-select-rule-good":
            return this.checkSelectRuleGood(step);
        case "check-select-rule-out":
            return this.checkSelectRuleOut(step);
        case "check-safe":
            return this.checkSafe(step);
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        const { before, updates } = step;

        for (const [a, b] of before) {
            const li = document.createElement("li");
            li.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items horizontally
                "w-full",          // Full width
            );

            const ul = document.createElement("ul");
            ul.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
                "space-x-2",       // Horizontal space between items
                "mb-4"             // Margin bottom
            );
            li.appendChild(ul);

            const aItem = utils.createNumberItem(a);
            ul.appendChild(aItem.item);

            const arrow = document.createElement("li");
            arrow.classList.add(
                "min-h-16",        // Fixed height
                "w-1",             // Fixed width
                "bg-white",        // White background
            );
            ul.appendChild(arrow);

            const bItem = utils.createNumberItem(b);
            ul.appendChild(bItem.item);

            this.beforeRules!.push({ lhs: aItem.item, arrow, rhs: bItem.item });
            this.beforeColumn!.appendChild(li);
        }

        for (const update of updates) {
            const pageRow = document.createElement("li");
            pageRow.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
                "rounded-lg",      // Rounded corners
                "transition-all", // Smooth transition effect
                "duration-500",   // 500ms duration for transitions
                "ease-in-out",   // Timing function for transition
                "p-2",            // Padding inside the container
            );
            this.pagesColumn!.appendChild(pageRow);

            const pageRowList = document.createElement("ul");
            pageRowList.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
            );
            pageRow.appendChild(pageRowList);

            const pageItems = utils.createRowItems(pageRowList, update);
            this.pages!.push(pageItems);
        }

        return 1000;
    }

    private index(step: Part1TraceItemIndex): number {
        this.pagesColumn!.children[step.index].classList.add("origin-left", "scale-110");

        return 1000;
    }

    private indexOut(step: Part1TraceItemIndexOut): number {
        this.pagesColumn!.children[step.index].classList.remove("origin-left", "scale-110");

        return 1000;
    }

    private checkSelect(step: Part1TraceItemCheckSelect): number {
        this.pages![step.index][step.pageIndex].item.classList.add("bg-yellow-500");
        this.lhsItem!.textContent = this.pages![step.index][step.pageIndex].text.textContent!;

        return 1000;
    }

    private checkSelectOut(step: Part1TraceItemCheckSelectOut): number {
        this.pages![step.index][step.pageIndex].item.classList.remove("bg-yellow-500");
        this.lhsItem!.textContent = "";

        return 1000;
    }

    private checkSelectAgainst(step: Part1TraceItemCheckSelectAgainst): number {
        this.pages![step.index][step.pageIndex].item.classList.add("bg-yellow-500");
        this.rhsItem!.textContent = this.pages![step.index][step.pageIndex].text.textContent!;

        return 1000;
    }

    private checkSelectAgainstOut(step: Part1TraceItemCheckSelectAgainstOut): number {
        this.pages![step.index][step.pageIndex].item.classList.remove("bg-yellow-500");
        this.rhsItem!.textContent = "";

        return 1000;
    }

    private checkSelectRuleBad(step: Part1TraceItemCheckSelectRuleBad): number {
        const beforeRule = this.beforeRules![step.ruleIndex];
        beforeRule.lhs.classList.add("bg-red-500");
        beforeRule.rhs.classList.add("bg-red-500");

        beforeRule.arrow.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

        this.orderItem!.classList.remove("text-gray-500");
        this.orderItem!.classList.add("text-red-500");

        return 1000;
    }

    private checkSelectRuleGood(step: Part1TraceItemCheckSelectRuleGood): number {
        this.orderItem!.classList.remove("text-gray-500");
        this.orderItem!.classList.add("text-green-500");

        return 1000;
    }

    private checkSelectRuleOut(step: Part1TraceItemCheckSelectRuleOut): number {
        this.orderItem!.classList.remove("text-red-500", "text-green-500");
        this.orderItem!.classList.add("text-gray-500");
        if (step.ruleIndex !== undefined) {
            const beforeRule = this.beforeRules![step.ruleIndex];
            beforeRule.lhs.classList.remove("bg-red-500");
            beforeRule.rhs.classList.remove("bg-red-500");
        }

        return 1000;
    }

    private checkSafe(step: Part1TraceItemCheckSafe): number {
        const pageRow = this.pagesColumn!.children[step.index];
        if (step.isSafe) {
            pageRow.classList.add("bg-green-500");
        } else {
            pageRow.classList.add("bg-red-500");
        }

        pageRow.classList.add("opacity-0", "scale-0");

        setTimeout(() => {
            pageRow.classList.add("hidden");
        }, 500);

        return 1000;
    }

    private total(step: Part1TraceItemTotal): number {
        this.answerNumber!.textContent = step.total.toString();

        return 1000;
    }

    private create() {
        // Create the main puzzle container
        const puzzleDiv = document.createElement("div");
        puzzleDiv.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-between", // Space between the columns
            "items-start",     // Align items to the start (top)
            "space-x-4",       // Horizontal space between children
            "w-full",          // Full width
            "h-full",          // Full height
            "grow",            // Allow the container to grow
            "py-4",            // Vertical padding
        );
        this.solutionDiv.appendChild(puzzleDiv);

        // Create a container for the befores list and the page order title
        const beforeContainer = document.createElement("div");
        beforeContainer.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
            "h-full",          // Full height
            "grow",            // Allow the container to grow
            "justify-start",   // Center items horizontally
        );
        puzzleDiv.appendChild(beforeContainer);

        // Add a container with background for the title
        const beforeTitleBackground = document.createElement("div");
        beforeTitleBackground.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "w-full",          // Full width
            "items-center",    // Center items horizontally
            "justify-center",  // Center items vertically
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
            "mb-4",            // Margin bottom
            "p-4",             // Padding inside the container
            "sticky",          // Stick to the top
            "top-0",           // Stick to the top
        );
        beforeContainer.appendChild(beforeTitleBackground);

        // Add the title with the "Before Rules" text
        const beforeTitle = document.createElement("h2");
        beforeTitle.textContent = "Pages Order";
        beforeTitle.classList.add(
            "text-2xl",        // Large text size
            "font-semibold",   // Semi-bold text
            "text-white",      // White text color
            "mb-4",             // Margin bottom
        );
        beforeTitleBackground.appendChild(beforeTitle);

        // Create the left column container for the befores list
        this.beforeColumn = document.createElement("ul");
        this.beforeColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "space-y-2",       // Vertical space between items
            "items-center",    // Center items horizontally
            "max-h-full",      // Maximum height
            "w-full",          // Full width
            "p-4",             // Padding inside the column
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
            "transition-all",  // Smooth transition effect
            "ease-in-out",     // Timing function for transition
            "duration-300",    // 300ms duration for transitions
            "overflow-y-auto"  // Allow vertical scrolling
        );
        beforeContainer.appendChild(this.beforeColumn);

        this.beforeRules = [];

        // Create the middle pad container
        const middlePadContainer = document.createElement("div");
        middlePadContainer.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "h-full",          // Full height
            "w-2/3",           // Width is 2/3 of the parent container
            "grow",            // Allow the container to grow
            "justify-start",   // Center items horizontally
            "items-center",    // Center items horizontally
        );
        puzzleDiv.appendChild(middlePadContainer);

        // Create the middle pad background div
        const middlePadBackground = document.createElement("div");
        middlePadBackground.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "w-full",          // Full width
            "items-center",    // Center items horizontally
            "justify-center",  // Center items vertically
        );
        middlePadContainer.appendChild(middlePadBackground);

        // Create the middle pad
        const middlePad = document.createElement("div");
        middlePad.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-1/2",           // Width is 1/2 of the parent container
            "mb-4",            // Margin bottom
            "p-2",             // Padding inside the container
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
        );
        middlePadBackground.appendChild(middlePad);

        // Create the answer container
        const answerDiv = document.createElement("div");
        answerDiv.classList.add(
            "text-2xl",       // Large text size
            "font-semibold",  // Semi-bold text
            "text-center",    // Centered text
            "mb-4",           // Margin bottom
            "text-green-500"  // Green text color
        );
        middlePad.appendChild(answerDiv);

        const answerText = document.createElement("span");
        answerText.textContent = "Answer: ";
        answerDiv.appendChild(answerText);

        this.answerNumber = document.createElement("span");
        this.answerNumber.textContent = "0";
        answerDiv.appendChild(this.answerNumber);

        // Create the top row of the middle pad
        const middleTopRow = document.createElement("ul");
        middleTopRow.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mb-4"             // Margin bottom
        );
        middlePad.appendChild(middleTopRow);

        // Create left-hand side number item
        const lhsItem = utils.createNumberItem("");
        this.lhsItem = lhsItem.text;
        middleTopRow.appendChild(lhsItem.item);

        // Create LT sign item
        const minusItem = document.createElement("li");
        minusItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-red-500"     // Red color for minus sign
        );
        minusItem.textContent = "<";
        middleTopRow.appendChild(minusItem);

        // Create right-hand side number item
        const rhsItem = utils.createNumberItem("");
        this.rhsItem = rhsItem.text;
        middleTopRow.appendChild(rhsItem.item);

        // Create the bottom row of the middle pad
        const middleBottomRow = document.createElement("ul");
        middleBottomRow.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mt-4"             // Margin top
        );
        middlePad.appendChild(middleBottomRow);

        // Create equal sign item
        const equalItem = document.createElement("li");
        equalItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-yellow-500"  // Yellow color for equal sign
        );
        equalItem.textContent = "is";
        middleBottomRow.appendChild(equalItem);

        // Create ordered item
        this.orderItem = document.createElement("li");
        this.orderItem.classList.add(
            "text-3xl",         // Medium text size
            "font-extrabold",  // Extra bold text
            "text-gray-500"    // Gray text color
        );
        this.orderItem.textContent = "ordered";
        middleBottomRow.appendChild(this.orderItem);

        // Create the right column container for the after list inside of the pad container
        this.pagesColumn = document.createElement("ul");
        this.pagesColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "space-y-2",       // Vertical space between items
            "items-start",    // Center items horizontally
            "max-h-full",      // Maximum height
            "max-w-full",       // Maximum width
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
            "transition-all",  // Smooth transition effect
            "ease-in-out",     // Timing function for transition
            "duration-300",    // 300ms duration for transitions
            "overflow-auto", // Allow vertical scrolling
            "p-4",             // Padding inside the column
        );
        middlePadContainer.appendChild(this.pagesColumn);

        this.pages = [];
    }
}

type Part2TraceItem = never;

class Part2Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    solve(): Trace<Part2TraceItem> {
        return [];
    }
}

class Part2Animator implements PartAnimator<Part1TraceItem> {
    reset(): void {
    }

    begin(): void {
    }

    step(step: Part2TraceItem): number {
        return 0;
    }
}

const DESCRIPTION_PART1 = [
    utils.createParagraph("TODO"),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("TODO"),
];

const DEFAULT_INPUT_PART1 = "47|53\n97|13\n97|61\n97|47\n75|29\n61|13\n75|53\n29|13\n97|29\n53|29\n61|53\n97|53\n61|29\n47|13\n75|47\n97|75\n47|61\n75|61\n47|29\n75|13\n53|13\n\n75,47,61,53,29\n97,61,53,29,13\n75,29,13\n75,97,47,61,53\n61,13,29\n97,13,75,29,47";
const DEFAULT_INPUT_PART2 = "47|53\n97|13\n97|61\n97|47\n75|29\n61|13\n75|53\n29|13\n97|29\n53|29\n61|53\n97|53\n61|29\n47|13\n75|47\n97|75\n47|61\n75|61\n47|29\n75|13\n53|13\n\n75,47,61,53,29\n97,61,53,29,13\n75,29,13\n75,97,47,61,53\n61,13,29\n97,13,75,29,47";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
