import { PartAnimator, Solution, Trace, utils } from "./common";

const MUL_REGEX = [
    {kind: "char", value: "m"},
    {kind: "char", value: "u"},
    {kind: "char", value: "l"},
    {kind: "char", value: "("},
    {kind: "digit"},
    {kind: "digit", optional: true},
    {kind: "digit", optional: true},
    {kind: "char", value: ","},
    {kind: "digit"},
    {kind: "digit", optional: true},
    {kind: "digit", optional: true},
    {kind: "char", value: ")"},
];

type Part1TraceItemInput = { kind: "input", memory: string };
type Part1TraceItemIndexSelect = { kind: "index-select", index: number };
type Part1TraceItemIndexMatch = { kind: "index-match", index: number, match: boolean };
type Part1TraceItemRangeMatch = { kind: "range-match", start: number, end: number, match: boolean };
type Part1TraceItemSelect = { kind: "select", lhs: number, rhs: number };
type Part1TraceItemMultiply = { kind: "multiply", result: number };
type Part1TraceItemTotal = { kind: "total", total: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemIndexSelect | Part1TraceItemIndexMatch | Part1TraceItemRangeMatch | Part1TraceItemSelect | Part1TraceItemMultiply | Part1TraceItemTotal;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): string {
        return input.trim().split("\n").join("");
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const memory = this.parseInput(this.input);
        trace.push({kind: "input", memory});

        let index = 0;
        let total = 0;
        while (index < memory.length) {
            const start = index;
            let match = true;
            for (const token of MUL_REGEX) {
                if (index >= memory.length) {
                    if (token.optional === true) {
                        continue;
                    }
                    match = false;
                    break;
                }

                const char = memory[index];
                if (token.kind === "char") {
                    if (char !== token.value) {
                        match = false;
                    }
                } else if (token.kind === "digit") {
                    const isDigit = char.match(/[0-9]/);
                    const isOptional = token.optional === true;
                    if (!isDigit && isOptional) {
                        continue;
                    }
                    if (!isDigit && !isOptional) {
                        match = false;
                    }
                }

                trace.push({kind: "index-select", index});
                trace.push({kind: "index-match", index, match});

                if (!match) {
                    break;
                }

                index++;
            }

            const end = Math.min(index, memory.length - 1);
            trace.push({kind: "range-match", start, end, match});

            if (match) {
                const mul_slice = memory.slice(start + 4, end - 1);
                const [lhs, rhs] = mul_slice.split(",").map(n => parseInt(n));
                trace.push({kind: "select", lhs, rhs});
                const result = lhs * rhs;
                trace.push({kind: "multiply", result});
                total += result;
                trace.push({kind: "total", total});
            } else {
                index++;
            }
        }

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private lhsItem?: HTMLSpanElement;
    private rhsItem?: HTMLSpanElement;
    private resultItem?: HTMLSpanElement;
    private memoryRow?: HTMLUListElement;

    constructor(inputDiv: HTMLDivElement, solutionDiv: HTMLDivElement) {
        this.inputDiv = inputDiv;
        this.solutionDiv = solutionDiv;

        this.reset();
    }

    reset(): void {
        this.inputDiv.classList.remove("hidden");
        this.solutionDiv.classList.add("hidden");
        this.solutionDiv.innerHTML = "";
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
        case "index-select":
            return this.indexSelect(step);
        case "index-match":
            return this.indexMatch(step);
        case "range-match":
            return this.rangeMatch(step);
        case "select":
            return this.select(step);
        case "multiply":
            return this.multiply(step);
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        this.memoryRow!.innerHTML = "";

        const memory = step.memory;
        for (let i = 0; i < memory.length; i++) {
            const char = memory[i];

            const item = utils.createCharItem(char);
            this.memoryRow!.appendChild(item.item);
        }

        return 1000;
    }

    private indexSelect(step: Part1TraceItemIndexSelect): number {
        const item = this.memoryRow!.children[step.index];
        item.classList.remove("bg-neutral-800");
        item.classList.add("bg-yellow-500");

        this.memoryRow!.children[step.index].scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

        return 1000;
    }

    private indexMatch(step: Part1TraceItemIndexMatch): number {
        const item = this.memoryRow!.children[step.index];
        item.classList.remove("bg-yellow-500");
        if (step.match) {
            item.classList.add("bg-green-500");
        } else {
            item.classList.add("bg-red-500");
        }

        return 1000;
    }

    private rangeMatch(step: Part1TraceItemRangeMatch): number {
        for (let i = step.start; i <= step.end; i++) {
            const item = this.memoryRow!.children[i];
            if (!step.match) {
                item.classList.remove("bg-red-500");
                item.classList.add("bg-neutral-800");
            }
        }

        return 1000;
    }

    private select(step: Part1TraceItemSelect): number {
        this.lhsItem!.textContent = step.lhs.toString();
        this.rhsItem!.textContent = step.rhs.toString();

        return 1000;
    }

    private multiply(step: Part1TraceItemMultiply): number {
        this.resultItem!.textContent = step.result.toString();

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
            "flex-col",        // Arrange children in a row
            "justify-start",   // Start items horizontally
            "items-center",    // Center items vertically
            "space-y-4",       // Horizontal space between children
            "w-full",          // Full width
            "h-full",          // Full height
            "grow",            // Allow the container to grow
            "py-4",            // Vertical padding
            "overflow-y-auto"  // Allow vertical scrolling
        );
        this.solutionDiv.appendChild(puzzleDiv);

        // Create the middle pad container
        const middlePad = document.createElement("div");
        middlePad.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
            "p-4",             // Padding inside the container
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
        );
        puzzleDiv.appendChild(middlePad);

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

        // Create the answer text inside the answer container
        const answerText = document.createElement("span");
        answerText.textContent = "Answer: ";
        answerDiv.appendChild(answerText);

        // Create the answer number inside the answer container
        this.answerNumber = document.createElement("span");
        this.answerNumber.classList.add(
            "transition-all",  // Smooth transition
            "ease-in-out",     // Ease-in-out timing function
            "duration-300",    // 300ms transition duration
        );
        this.answerNumber.textContent = "0";
        answerDiv.appendChild(this.answerNumber);

        // Create the top row of the middle pad
        const middleRow1 = document.createElement("ul");
        middleRow1.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mb-4"             // Margin bottom
        );
        middlePad.appendChild(middleRow1);

        // Create left-hand side number item in the top row
        const lhsItem = utils.createNumberItem("");
        this.lhsItem = lhsItem.text;
        middleRow1.appendChild(lhsItem.item);

        // Create mult sign item in the top row
        const multItem = document.createElement("li");
        multItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-red-500"     // Red color for minus sign
        );
        multItem.textContent = "*";
        middleRow1.appendChild(multItem);

        // Create right-hand side number item in the top row
        const rhsItem = utils.createNumberItem("");
        this.rhsItem = rhsItem.text;
        middleRow1.appendChild(rhsItem.item);

        // Create the middle row of the middle pad (2nd row with = and result)
        const middleRow2 = document.createElement("ul");
        middleRow2.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mt-4"             // Margin top
        );
        middlePad.appendChild(middleRow2);

        // Create equal sign item
        const equalItem = document.createElement("li");
        equalItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-yellow-500"  // Yellow color for equal sign
        );
        equalItem.textContent = "=";
        middleRow2.appendChild(equalItem);

        // Create L1 distance item
        const resultItem = utils.createNumberItem("");
        this.resultItem = resultItem.text;
        middleRow2.appendChild(resultItem.item);

        // Create the memory row that will contain div's for each character in the memory
        // If it overflows then continue on next line
        this.memoryRow = document.createElement("ul");
        this.memoryRow.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-start",   // Start items horizontally
            "items-center",    // Center items vertically
            "flex-wrap",       // Wrap items when they overflow
            "mt-4"             // Margin top
        );
        puzzleDiv.appendChild(this.memoryRow);
    }
}

const DO_REGEX = [
    {kind: "char", value: "d"},
    {kind: "char", value: "o"},
    {kind: "char", value: "("},
    {kind: "char", value: ")"},
];

const DONT_REGEX = [
    {kind: "char", value: "d"},
    {kind: "char", value: "o"},
    {kind: "char", value: "n"},
    {kind: "char", value: "'"},
    {kind: "char", value: "t"},
    {kind: "char", value: "("},
    {kind: "char", value: ")"},
];

type Part2TraceDoMatch = { kind: "do-match" };
type Part2TraceDontMatch = { kind: "dont-match" };

type Part2TraceItem = Part1TraceItemInput | Part1TraceItemIndexSelect | Part1TraceItemIndexMatch | Part1TraceItemRangeMatch | Part1TraceItemSelect | Part1TraceItemMultiply | Part1TraceItemTotal | Part2TraceDoMatch | Part2TraceDontMatch;

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): string {
        return input.trim().split("\n").join("");
    }

    solve(): Trace<Part2TraceItem> {
        const trace: Trace<Part2TraceItem> = [];

        const memory = this.parseInput(this.input);
        trace.push({kind: "input", memory});

        let index = 0;
        let total = 0;
        let do_block = true;
        while (index < memory.length) {
            if (DO_REGEX[0].value === memory[index] && !do_block) {
                const start = index;
                let match = true;
                for (const token of DO_REGEX) {
                    if (index >= memory.length) {
                        match = false;
                        break;
                    }

                    const char = memory[index];
                    if (token.kind === "char") {
                        if (char !== token.value) {
                            match = false;
                        }
                    }

                    trace.push({kind: "index-select", index});
                    trace.push({kind: "index-match", index, match});

                    if (!match) {
                        break;
                    }

                    index++;
                }

                const end = Math.min(index, memory.length - 1);
                trace.push({kind: "range-match", start, end, match});

                if (match) {
                    trace.push({kind: "do-match"});
                    do_block = true;
                } else {
                    index = start;
                }
            }

            if (DONT_REGEX[0].value === memory[index] && do_block) {
                const start = index;
                let match = true;
                for (const token of DONT_REGEX) {
                    if (index >= memory.length) {
                        match = false;
                        break;
                    }

                    const char = memory[index];
                    if (token.kind === "char") {
                        if (char !== token.value) {
                            match = false;
                        }
                    }

                    trace.push({kind: "index-select", index});
                    trace.push({kind: "index-match", index, match});

                    if (!match) {
                        break;
                    }

                    index++;
                }

                const end = Math.min(index, memory.length - 1);
                trace.push({kind: "range-match", start, end, match});

                if (match) {
                    trace.push({kind: "dont-match"});
                    do_block = false;
                } else {
                    index = start;
                }
            }

            if (do_block) {
                const start = index;
                let match = true;
                for (const token of MUL_REGEX) {
                    if (index >= memory.length) {
                        if (token.optional === true) {
                            continue;
                        }
                        match = false;
                        break;
                    }

                    const char = memory[index];
                    if (token.kind === "char") {
                        if (char !== token.value) {
                            match = false;
                        }
                    } else if (token.kind === "digit") {
                        const isDigit = char.match(/[0-9]/);
                        const isOptional = token.optional === true;
                        if (!isDigit && isOptional) {
                            continue;
                        }
                        if (!isDigit && !isOptional) {
                            match = false;
                        }
                    }

                    trace.push({kind: "index-select", index});
                    trace.push({kind: "index-match", index, match});

                    if (!match) {
                        break;
                    }

                    index++;
                }

                const end = Math.min(index, memory.length - 1);
                trace.push({kind: "range-match", start, end, match});

                if (match) {
                    const mul_slice = memory.slice(start + 4, end - 1);
                    const [lhs, rhs] = mul_slice.split(",").map(n => parseInt(n));
                    trace.push({kind: "select", lhs, rhs});
                    const result = lhs * rhs;
                    trace.push({kind: "multiply", result});
                    total += result;
                    trace.push({kind: "total", total});
                } else {
                    index++;
                }
            } else {
                trace.push({kind: "index-select", index});
                trace.push({kind: "index-match", index, match: false});
                trace.push({kind: "range-match", start: index, end: index, match: false});
                index++;
            }
        }

        return trace;
    }
}

class Part2Animator implements PartAnimator<Part2TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private lhsItem?: HTMLSpanElement;
    private rhsItem?: HTMLSpanElement;
    private resultItem?: HTMLSpanElement;
    private memoryRow?: HTMLUListElement;
    private doBlock?: HTMLDivElement;

    constructor(inputDiv: HTMLDivElement, solutionDiv: HTMLDivElement) {
        this.inputDiv = inputDiv;
        this.solutionDiv = solutionDiv;

        this.reset();
    }

    reset(): void {
        this.inputDiv.classList.remove("hidden");
        this.solutionDiv.classList.add("hidden");
        this.solutionDiv.innerHTML = "";
    }

    begin(): void {
        this.reset();

        this.create();

        this.inputDiv.classList.add("hidden");
        this.solutionDiv.classList.remove("hidden");
    }

    step(step: Part2TraceItem): number {
        switch (step.kind) {
        case "input":
            return this.createInput(step);
        case "index-select":
            return this.indexSelect(step);
        case "index-match":
            return this.indexMatch(step);
        case "range-match":
            return this.rangeMatch(step);
        case "select":
            return this.select(step);
        case "multiply":
            return this.multiply(step);
        case "total":
            return this.total(step);
        case "do-match":
            return this.doMatch(step);
        case "dont-match":
            return this.dontMatch(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part2TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        this.memoryRow!.innerHTML = "";

        const memory = step.memory;
        for (let i = 0; i < memory.length; i++) {
            const char = memory[i];

            const item = utils.createCharItem(char);
            this.memoryRow!.appendChild(item.item);
        }

        return 1000;
    }

    private indexSelect(step: Part1TraceItemIndexSelect): number {
        const item = this.memoryRow!.children[step.index];
        item.classList.remove("bg-neutral-800");
        item.classList.add("bg-yellow-500");

        this.memoryRow!.children[step.index].scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

        return 1000;
    }

    private indexMatch(step: Part1TraceItemIndexMatch): number {
        const item = this.memoryRow!.children[step.index];
        item.classList.remove("bg-yellow-500");
        if (step.match) {
            item.classList.add("bg-green-500");
        } else {
            item.classList.add("bg-red-500");
        }

        return 1000;
    }

    private rangeMatch(step: Part1TraceItemRangeMatch): number {
        for (let i = step.start; i <= step.end; i++) {
            const item = this.memoryRow!.children[i];
            if (!step.match) {
                item.classList.remove("bg-red-500");
                item.classList.add("bg-neutral-800");
            }
        }

        return 1000;
    }

    private select(step: Part1TraceItemSelect): number {
        this.lhsItem!.textContent = step.lhs.toString();
        this.rhsItem!.textContent = step.rhs.toString();

        return 1000;
    }

    private multiply(step: Part1TraceItemMultiply): number {
        this.resultItem!.textContent = step.result.toString();

        return 1000;
    }

    private total(step: Part1TraceItemTotal): number {
        this.answerNumber!.textContent = step.total.toString();

        return 1000;
    }

    private doMatch(_step: Part2TraceDoMatch): number {
        this.doBlock!.classList.remove("text-red-500");
        this.doBlock!.classList.add("text-green-500");
        return 1000;
    }

    private dontMatch(_step: Part2TraceDontMatch): number {
        this.doBlock!.classList.remove("text-green-500");
        this.doBlock!.classList.add("text-red-500");
        return 1000;
    }

    private create() {
        // Create the main puzzle container
        const puzzleDiv = document.createElement("div");
        puzzleDiv.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a row
            "justify-start",   // Start items horizontally
            "items-center",    // Center items vertically
            "space-y-4",       // Horizontal space between children
            "w-full",          // Full width
            "h-full",          // Full height
            "grow",            // Allow the container to grow
            "py-4",            // Vertical padding
            "overflow-y-auto"  // Allow vertical scrolling
        );
        this.solutionDiv.appendChild(puzzleDiv);

        // Create the middle pad container
        const middlePad = document.createElement("div");
        middlePad.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
            "p-4",             // Padding inside the container
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
        );
        puzzleDiv.appendChild(middlePad);

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

        // Create the answer text inside the answer container
        const answerText = document.createElement("span");
        answerText.textContent = "Answer: ";
        answerDiv.appendChild(answerText);

        // Create the answer number inside the answer container
        this.answerNumber = document.createElement("span");
        this.answerNumber.classList.add(
            "transition-all",  // Smooth transition
            "ease-in-out",     // Ease-in-out timing function
            "duration-300",    // 300ms transition duration
        );
        this.answerNumber.textContent = "0";
        answerDiv.appendChild(this.answerNumber);

        // Create the top row of the middle pad
        const middleRow1 = document.createElement("ul");
        middleRow1.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mb-4"             // Margin bottom
        );
        middlePad.appendChild(middleRow1);

        // Create left-hand side number item in the top row
        const lhsItem = utils.createNumberItem("");
        this.lhsItem = lhsItem.text;
        middleRow1.appendChild(lhsItem.item);

        // Create mult sign item in the top row
        const multItem = document.createElement("li");
        multItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-red-500"     // Red color for minus sign
        );
        multItem.textContent = "*";
        middleRow1.appendChild(multItem);

        // Create right-hand side number item in the top row
        const rhsItem = utils.createNumberItem("");
        this.rhsItem = rhsItem.text;
        middleRow1.appendChild(rhsItem.item);

        // Create the middle row of the middle pad (2nd row with = and result)
        const middleRow2 = document.createElement("ul");
        middleRow2.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mt-4"             // Margin top
        );
        middlePad.appendChild(middleRow2);

        // Create equal sign item
        const equalItem = document.createElement("li");
        equalItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-yellow-500"  // Yellow color for equal sign
        );
        equalItem.textContent = "=";
        middleRow2.appendChild(equalItem);

        // Create L1 distance item
        const resultItem = utils.createNumberItem("");
        this.resultItem = resultItem.text;
        middleRow2.appendChild(resultItem.item);

        // Create the do block container that will display a "do" or "don't" toggle message inside of the middle pad
        const doBlock = document.createElement("div");
        doBlock.textContent = "enabled";
        doBlock.classList.add(
            "text-2xl",        // Large text size
            "font-semibold",   // Semi-bold text
            "text-center",     // Centered text
            "mt-4",            // Margin bottom
            "text-green-500"   // Green text color
        );
        this.doBlock = doBlock;
        middlePad.appendChild(doBlock);

        // Create the memory row that will contain div's for each character in the memory
        // If it overflows then continue on next line
        this.memoryRow = document.createElement("ul");
        this.memoryRow.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-start",   // Start items horizontally
            "items-center",    // Center items vertically
            "flex-wrap",       // Wrap items when they overflow
            "mt-4"             // Margin top
        );
        puzzleDiv.appendChild(this.memoryRow);
    }
}

const DESCRIPTION_PART1 = [
    utils.createParagraph("TODO"),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("TODO"),
];

const DEFAULT_INPUT_PART1 = "xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))";
const DEFAULT_INPUT_PART2 = "xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
