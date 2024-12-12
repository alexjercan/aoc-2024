import { PartAnimator, Solution, Trace, utils } from "./common";

enum StoneKind {
    Zero = 0,
    Even = 1,
    Odd = 2,
}

type Part1TraceItemInput = { kind: "input", stones: Map<number, number>, indices: Map<number, number> };
type Part1TraceItemSelect = { kind: "select", index: number };
type Part1TraceItemSelectOut = { kind: "select-out", index: number };
type Part1TraceItemKind = { kind: "kind", index: number, stoneKind: StoneKind };
type Part1TraceItemBecomes = { kind: "becomes", result1: number, result2?: number };
type Part1TraceItemUpdate = { kind: "update", index: number, count: number };
type Part1TraceItemInsert = { kind: "insert", stone: number, count: number };
type Part1TraceItemTotal = { kind: "total", total: number };


type Part1TraceItem = Part1TraceItemInput | Part1TraceItemSelect | Part1TraceItemSelectOut | Part1TraceItemKind | Part1TraceItemBecomes | Part1TraceItemUpdate | Part1TraceItemInsert | Part1TraceItemTotal;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): Map<number, number> {
        const parts = input.split(" ");
        const stones = new Map<number, number>();
        for (const part of parts) {
            const stone = parseInt(part);
            const count = stones.get(stone);
            if (count === undefined) {
                stones.set(stone, 1);
            } else {
                stones.set(stone, count + 1);
            }
        }

        return stones;
    }

    private step(stones: Map<number, number>, indices: Map<number, number>, trace: Trace<Part1TraceItem>) {
        const newStones = new Map<number, number>();

        for (const [stone, count] of stones) {
            const index = indices.get(stone)!;
            trace.push({ kind: "select", index });

            if (stone === 0) {
                trace.push({ kind: "kind", index, stoneKind: StoneKind.Zero });

                const newStone = 1;
                const newCount = (newStones.get(newStone) ?? 0) + count;
                newStones.set(newStone, newCount);

                trace.push({ kind: "becomes", result1: newStone, result2: undefined });
                trace.push({ kind: "update", index, count: 0 });

                if (indices.has(newStone)) {
                    const newIndex = indices.get(newStone)!;
                    trace.push({ kind: "update", index: newIndex, count: newCount });
                } else {
                    indices.set(newStone, indices.size);
                    trace.push({ kind: "insert", stone: newStone, count: newCount });
                }

            } else {
                const digitsLen = stone.toString().length;
                if (digitsLen % 2 === 0) {
                    trace.push({ kind: "kind", index, stoneKind: StoneKind.Even });

                    const lower = parseInt(stone.toString().substring(0, digitsLen / 2));
                    const upper = parseInt(stone.toString().substring(digitsLen / 2));

                    trace.push({ kind: "becomes", result1: lower, result2: upper });
                    trace.push({ kind: "update", index, count: 0 });

                    const lowerCount = (newStones.get(lower) ?? 0) + count;
                    newStones.set(lower, lowerCount);

                    if (indices.has(lower)) {
                        const lowerIndex = indices.get(lower)!;
                        trace.push({ kind: "update", index: lowerIndex, count: lowerCount });
                    } else {
                        indices.set(lower, indices.size);
                        trace.push({ kind: "insert", stone: lower, count: lowerCount });
                    }

                    const upperCount = (newStones.get(upper) ?? 0) + count;
                    newStones.set(upper, upperCount);

                    if (indices.has(upper)) {
                        const upperIndex = indices.get(upper)!;
                        trace.push({ kind: "update", index: upperIndex, count: upperCount });
                    } else {
                        indices.set(upper, indices.size);
                        trace.push({ kind: "insert", stone: upper, count: upperCount });
                    }
                } else {
                    trace.push({ kind: "kind", index, stoneKind: StoneKind.Odd });

                    const newStone = 2024 * stone;
                    const newCount = (newStones.get(newStone) ?? 0) + count;
                    newStones.set(newStone, newCount);

                    trace.push({ kind: "becomes", result1: newStone, result2: undefined });
                    trace.push({ kind: "update", index, count: 0 });

                    if (indices.has(newStone)) {
                        const newIndex = indices.get(newStone)!;
                        trace.push({ kind: "update", index: newIndex, count: newCount });
                    } else {
                        indices.set(newStone, indices.size);
                        trace.push({ kind: "insert", stone: newStone, count: newCount });
                    }
                }
            }

            trace.push({ kind: "select-out", index });
        }

        return newStones;
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        let stones = this.parseInput(this.input);
        const indices = new Map<number, number>();
        let index = 0;
        for (const stone of stones.keys()) {
            indices.set(stone, index);
            index++;
        }

        trace.push({ kind: "input", stones: structuredClone(stones), indices: structuredClone(indices) });

        for (let i = 0; i < 25; i++) {
            stones = this.step(stones, indices, trace);
            const total = Array.from(stones.values()).reduce((acc, count) => acc + count, 0);
            trace.push({ kind: "total", total });
        }

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private lhsItem?: HTMLSpanElement;
    private rhsItem?: HTMLLIElement;
    private resultItem1?: { item: HTMLLIElement, text: HTMLSpanElement };
    private resultItem2?: { item: HTMLLIElement, text: HTMLSpanElement };
    private stonesRow?: HTMLUListElement;
    private stoneElements: { item: HTMLLIElement, text: HTMLSpanElement, count: HTMLSpanElement }[] = [];

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
        case "select":
            return this.select(step);
        case "select-out":
            return this.selectOut(step);
        case "kind":
            return this.kind(step);
        case "becomes":
            return this.becomes(step);
        case "update":
            return this.update(step);
        case "insert":
            return this.insert(step);
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        this.stonesRow!.innerHTML = "";

        const max = Math.max(...Array.from(step.stones.keys()));
        const bestWidth = 4 * (max.toString().length + 2);
        const bestWidthStr = "w-" + bestWidth.toString();

        for (let i = 0; i < step.stones.size; i++) {
            const item = utils.createNumberItem("", { ratio: "aspect-none" });
            item.item.classList.add(
                "flex",
                "flex-row",
                "justify-center", // Center items vertically
                bestWidthStr, // Fixed width
                "h-8", // Fixed height
                "m-1" // Add margin to the item
            );

            const xtimes = document.createElement("span");
            xtimes.classList.add(
                "text-sm", // Small text size
                "font-semibold", // Semi-bold text
                "mr-1", // Margin right
                "text-white" // White text color
            );
            xtimes.textContent = "x";
            item.item.appendChild(xtimes);

            const count = document.createElement("span");
            count.classList.add(
                "text-sm", // Small text size
                "font-semibold" // Semi-bold text
            );
            count.textContent = "";
            item.item.appendChild(count);

            this.stoneElements.push({ ...item, count });
            this.stonesRow!.appendChild(item.item);
        }

        for (const [stone, index] of step.indices) {
            this.stoneElements[index].text.textContent = stone.toString();
            this.stoneElements[index].count.textContent = step.stones.get(stone)!.toString();
        }

        return 1000;
    }

    private select(step: Part1TraceItemSelect): number {
        this.stoneElements[step.index].item.classList.add("bg-yellow-500");
        this.stoneElements[step.index].item.classList.remove("bg-neutral-700");

        this.lhsItem!.textContent = this.stoneElements[step.index].text.textContent!;

        return 1000;
    }

    private selectOut(step: Part1TraceItemSelectOut): number {
        this.stoneElements[step.index].item.classList.remove("bg-yellow-500");
        this.stoneElements[step.index].item.classList.add("bg-neutral-700");

        this.rhsItem!.textContent = "?";
        this.resultItem1!.text.textContent = "";
        this.resultItem2!.text.textContent = "";
        this.resultItem2!.item.classList.add("hidden");
        this.lhsItem!.textContent = "";

        return 1000;
    }

    private kind(step: Part1TraceItemKind): number {
        const stoneKindString = step.stoneKind === StoneKind.Zero ? "zero" : step.stoneKind === StoneKind.Even ? "even" : "odd";
        this.rhsItem!.textContent = stoneKindString;
        return 1000;
    }

    private becomes(step: Part1TraceItemBecomes): number {
        this.resultItem1!.text.textContent = step.result1.toString();
        if (step.result2 !== undefined) {
            this.resultItem2!.text.textContent = step.result2.toString();
            this.resultItem2!.item.classList.remove("hidden");
        }

        return 1000;
    }

    private update(step: Part1TraceItemUpdate): number {
        this.stoneElements[step.index].count.textContent = step.count.toString();

        if (step.count === 0) {
            this.stoneElements[step.index].item.classList.add("hidden");
        } else {
            this.stoneElements[step.index].item.classList.remove("hidden");
        }

        return 1000;
    }

    private insert(step: Part1TraceItemInsert): number {
        const bestWidth = 4 * (step.stone.toString().length + 2);
        const bestWidthStr = "w-" + bestWidth.toString();

        const item = utils.createNumberItem(step.stone.toString(), { ratio: "aspect-none" });
        item.item.classList.add(
            "flex",
            "flex-row",
            "justify-center", // Center items vertically
            bestWidthStr, // Fixed width
            "h-8", // Fixed height
            "m-1" // Add margin to the item
        );

        const xtimes = document.createElement("span");
        xtimes.classList.add(
            "text-sm", // Small text size
            "font-semibold", // Semi-bold text
            "mr-1", // Margin right
            "text-white" // White text color
        );
        xtimes.textContent = "x";
        item.item.appendChild(xtimes);

        const count = document.createElement("span");
        count.classList.add(
            "text-sm", // Small text size
            "font-semibold" // Semi-bold text
        );
        count.textContent = step.count.toString();
        item.item.appendChild(count);

        this.stoneElements.push({ ...item, count });
        this.stonesRow!.appendChild(item.item);

        return 1000;
    }

    private total(step: Part1TraceItemTotal): number {
        if (this.answerNumber) {
            this.answerNumber.textContent = step.total.toString();
        }

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
            "min-w-1/3",           // Width is 1/3 of the parent container
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
        const lhsItem = utils.createNumberItem("", { ratio: "aspect-none" });
        this.lhsItem = lhsItem.text;
        middleRow1.appendChild(lhsItem.item);

        // Create mult sign item in the top row
        const multItem = document.createElement("li");
        multItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-red-500"     // Red color for minus sign
        );
        multItem.textContent = "is";
        middleRow1.appendChild(multItem);

        // Create right-hand side number item in the top row
        const rhsItem = document.createElement("li");
        rhsItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-yellow-500"    // Blue color for right-hand side
        );
        rhsItem.textContent = "?";
        this.rhsItem = rhsItem;
        middleRow1.appendChild(rhsItem);

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
        equalItem.textContent = "becomes";
        middleRow2.appendChild(equalItem);

        // Create L1 distance item
        const resultItem1 = utils.createNumberItem("", { ratio: "aspect-none" });
        this.resultItem1 = resultItem1;
        middleRow2.appendChild(resultItem1.item);

        const resultItem2 = utils.createNumberItem("", { ratio: "aspect-none" });
        resultItem2.item.classList.add("hidden");
        this.resultItem2 = resultItem2;
        middleRow2.appendChild(resultItem2.item);

        // Create the memory row that will contain div's for each character in the memory
        // If it overflows then continue on next line
        this.stonesRow = document.createElement("ul");
        this.stonesRow.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-start",   // Start items horizontally
            "items-center",    // Center items vertically
            "flex-wrap",       // Wrap items when they overflow
            "mt-4",             // Margin top
            "overflow-y-auto"  // Allow vertical scrolling
        );
        puzzleDiv.appendChild(this.stonesRow);

        this.stoneElements = [];
    }
}

type Part2TraceItem = Part1TraceItem;

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): Map<number, number> {
        const parts = input.split(" ");
        const stones = new Map<number, number>();
        for (const part of parts) {
            const stone = parseInt(part);
            const count = stones.get(stone);
            if (count === undefined) {
                stones.set(stone, 1);
            } else {
                stones.set(stone, count + 1);
            }
        }

        return stones;
    }

    private step(stones: Map<number, number>, indices: Map<number, number>, trace: Trace<Part1TraceItem>) {
        const newStones = new Map<number, number>();

        for (const [stone, count] of stones) {
            const index = indices.get(stone)!;
            trace.push({ kind: "select", index });

            if (stone === 0) {
                trace.push({ kind: "kind", index, stoneKind: StoneKind.Zero });

                const newStone = 1;
                const newCount = (newStones.get(newStone) ?? 0) + count;
                newStones.set(newStone, newCount);

                trace.push({ kind: "becomes", result1: newStone, result2: undefined });
                trace.push({ kind: "update", index, count: 0 });

                if (indices.has(newStone)) {
                    const newIndex = indices.get(newStone)!;
                    trace.push({ kind: "update", index: newIndex, count: newCount });
                } else {
                    indices.set(newStone, indices.size);
                    trace.push({ kind: "insert", stone: newStone, count: newCount });
                }

            } else {
                const digitsLen = stone.toString().length;
                if (digitsLen % 2 === 0) {
                    trace.push({ kind: "kind", index, stoneKind: StoneKind.Even });

                    const lower = parseInt(stone.toString().substring(0, digitsLen / 2));
                    const upper = parseInt(stone.toString().substring(digitsLen / 2));

                    trace.push({ kind: "becomes", result1: lower, result2: upper });
                    trace.push({ kind: "update", index, count: 0 });

                    const lowerCount = (newStones.get(lower) ?? 0) + count;
                    newStones.set(lower, lowerCount);

                    if (indices.has(lower)) {
                        const lowerIndex = indices.get(lower)!;
                        trace.push({ kind: "update", index: lowerIndex, count: lowerCount });
                    } else {
                        indices.set(lower, indices.size);
                        trace.push({ kind: "insert", stone: lower, count: lowerCount });
                    }

                    const upperCount = (newStones.get(upper) ?? 0) + count;
                    newStones.set(upper, upperCount);

                    if (indices.has(upper)) {
                        const upperIndex = indices.get(upper)!;
                        trace.push({ kind: "update", index: upperIndex, count: upperCount });
                    } else {
                        indices.set(upper, indices.size);
                        trace.push({ kind: "insert", stone: upper, count: upperCount });
                    }
                } else {
                    trace.push({ kind: "kind", index, stoneKind: StoneKind.Odd });

                    const newStone = 2024 * stone;
                    const newCount = (newStones.get(newStone) ?? 0) + count;
                    newStones.set(newStone, newCount);

                    trace.push({ kind: "becomes", result1: newStone, result2: undefined });
                    trace.push({ kind: "update", index, count: 0 });

                    if (indices.has(newStone)) {
                        const newIndex = indices.get(newStone)!;
                        trace.push({ kind: "update", index: newIndex, count: newCount });
                    } else {
                        indices.set(newStone, indices.size);
                        trace.push({ kind: "insert", stone: newStone, count: newCount });
                    }
                }
            }

            trace.push({ kind: "select-out", index });
        }

        return newStones;
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        let stones = this.parseInput(this.input);
        const indices = new Map<number, number>();
        let index = 0;
        for (const stone of stones.keys()) {
            indices.set(stone, index);
            index++;
        }

        trace.push({ kind: "input", stones: structuredClone(stones), indices: structuredClone(indices) });

        for (let i = 0; i < 75; i++) {
            stones = this.step(stones, indices, trace);
            const total = Array.from(stones.values()).reduce((acc, count) => acc + count, 0);
            trace.push({ kind: "total", total });
        }

        return trace;
    }
}

class Part2Animator extends Part1Animator {
}

const DESCRIPTION_PART1 = [
    utils.createParagraph("TODO"),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("TODO"),
];

const DEFAULT_INPUT_PART1 = "125 17";
const DEFAULT_INPUT_PART2 = "125 17";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
