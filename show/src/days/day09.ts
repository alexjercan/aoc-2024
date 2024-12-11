import { PartAnimator, Solution, Trace, utils } from "./common";

type Part1TraceItemInput = { kind: "input", disk: (number | null)[] };
type Part1TraceItemSelect = { kind: "select", index: number };
type Part1TraceItemSelectOut = { kind: "select-out", index: number };
type Part1TraceItemMove = { kind: "move", fromIndex: number, toIndex: number };
type Part1TraceItemMultiply = { kind: "multiply", lhs: number, rhs: number, result: number };
type Part1TraceItemChecksum = { kind: "checksum", checksum: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemSelect | Part1TraceItemSelectOut | Part1TraceItemMove | Part1TraceItemMultiply | Part1TraceItemChecksum;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): number[] {
        return input.split("").map(x => parseInt(x));
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const disk = this.parseInput(this.input);

        const memory: (number | null)[] = [];

        let fileId = 0;
        for (let i = 0; i < disk.length; i++) {
            const size = disk[i];
            if (i % 2 === 0) {
                for (let _ = 0; _ < size; _++) {
                    memory.push(fileId);
                }
                fileId++;
            } else {
                for (let _ = 0; _ < size; _++) {
                    memory.push(null);
                }
            }
        }
        trace.push({ kind: "input", disk: memory.slice() });

        let index = 0;
        while (index < memory.length) {
            if (memory[index] === null) {
                let fileId = memory.pop();
                while (fileId === null) {
                    fileId = memory.pop();
                }

                const selectIndex = memory.length;
                trace.push({ kind: "select", index: selectIndex });
                trace.push({ kind: "select", index });

                memory[index] = fileId!;
                trace.push({ kind: "move", fromIndex: selectIndex, toIndex: index });

                trace.push({ kind: "select-out", index: selectIndex });
                trace.push({ kind: "select-out", index });
            }

            index++;
        }

        let total = 0;
        for (let i = 0; i < memory.length; i++) {
            const fileId = memory[i];
            if (fileId !== null) {
                const result = i * fileId;
                trace.push({ kind: "select", index: i });
                trace.push({ kind: "multiply", lhs: i, rhs: fileId, result });
                total += result;
                trace.push({ kind: "checksum", checksum: total });
                trace.push({ kind: "select-out", index: i });
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
    private diskElements: { item: HTMLLIElement, text: HTMLSpanElement }[] = [];

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
        case "move":
            return this.move(step);
        case "multiply":
            return this.multiply(step);
        case "checksum":
            return this.checksum(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part2TraceItemInput): number {
        this.memoryRow!.innerHTML = "";

        const max = Math.max(...step.disk.filter(x => x !== null) as number[]);
        const bestWidth = 4 * (max.toString().length + 1);
        const bestWidthStr = "w-" + bestWidth.toString();

        const disk = step.disk;
        for (let i = 0; i < disk.length; i++) {
            const item = utils.createCharItem(disk[i] === null ? "." : disk[i]!.toString());
            item.item.classList.add(
                "flex",
                "flex-row",
                "justify-center", // Center items vertically
                bestWidthStr, // Fixed width
                "h-8", // Fixed height
                "m-1" // Add margin to the item
            );
            this.diskElements.push(item);
            this.memoryRow!.appendChild(item.item);
        }

        return 1000;
    }

    private select(step: Part1TraceItemSelect): number {
        const item = this.diskElements[step.index];
        item.item.classList.remove("bg-neutral-800");
        item.item.classList.add("bg-yellow-500");

        return 1000;
    }

    private selectOut(step: Part1TraceItemSelectOut): number {
        const item = this.diskElements[step.index];
        item.item.classList.remove("bg-yellow-500");
        item.item.classList.add("bg-neutral-800");

        return 1000;
    }

    private move(step: Part1TraceItemMove): number {
        const fromItem = this.diskElements[step.fromIndex];
        const toItem = this.diskElements[step.toIndex];
        toItem.text.textContent = fromItem.text.textContent;
        fromItem.text.textContent = ".";

        toItem.item.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

        return 1000;
    }

    private multiply(step: Part1TraceItemMultiply): number {
        this.lhsItem!.textContent = step.lhs.toString();
        this.rhsItem!.textContent = step.rhs.toString();
        this.resultItem!.textContent = step.result.toString();

        this.resultItem!.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

        return 1000;
    }

    private checksum(step: Part1TraceItemChecksum): number {
        this.answerNumber!.textContent = step.checksum.toString();
        return 1000;
    }

    private create(): void {
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

        this.diskElements = [];
    }
}

type Part2TraceItemInput = { kind: "input", disk: (number | null)[] };
type Part2TraceItemSelect = { kind: "select", index: number };
type Part2TraceItemSelectOut = { kind: "select-out", index: number };
type Part2TraceItemMove = { kind: "move", fromIndex: number, toIndex: number };
type Part2TraceItemMultiply = { kind: "multiply", lhs: number, rhs: number, result: number };
type Part2TraceItemChecksum = { kind: "checksum", checksum: number };

type Part2TraceItem = Part2TraceItemInput | Part2TraceItemSelect | Part2TraceItemSelectOut | Part2TraceItemMove | Part2TraceItemMultiply | Part2TraceItemChecksum;

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): number[] {
        return input.split("").map(x => parseInt(x));
    }

    solve(): Trace<Part2TraceItem> {
        const trace: Trace<Part2TraceItem> = [];

        const disk = this.parseInput(this.input);

        const memory: (number | null)[] = [];

        let fileId = 0;
        for (let i = 0; i < disk.length; i++) {
            const size = disk[i];
            if (i % 2 === 0) {
                for (let _ = 0; _ < size; _++) {
                    memory.push(fileId);
                }
                fileId++;
            } else {
                for (let _ = 0; _ < size; _++) {
                    memory.push(null);
                }
            }
        }

        trace.push({ kind: "input", disk: memory.slice() });

        const chunks = [];
        fileId = 0;
        for (let i = 0; i < disk.length; i++) {
            const size = disk[i];
            if (i % 2 === 0) {
                chunks.push({ kind: "filled", fileId, size });
                fileId++;
            } else {
                chunks.push({ kind: "empty", size });
            }
        }

        let index = chunks.length - 1;
        while (true) {
            while (chunks[index].kind === "empty" && index > 0) {
                index--;
            }

            if (index === 0) {
                break;
            }

            if (chunks[index].kind === "filled") {
                let freeIndex = 0;
                let found = false;
                while (freeIndex < index) {
                    if (chunks[freeIndex].kind === "empty") {
                        if (chunks[freeIndex].size >= chunks[index].size) {
                            chunks[freeIndex].size -= chunks[index].size;
                            const chunk: { kind: "filled", fileId: number, size: number } = { kind: "filled", fileId: chunks[index].fileId!, size: chunks[index].size };
                            chunks[index] = { kind: "empty", size: chunk.size };
                            chunks.splice(freeIndex, 0, chunk);
                            found = true;
                            break;
                        }
                    }
                    freeIndex++;
                }

                if (!found) {
                    index--;
                }
            }
        }

        const memory2: (number | null)[] = [];
        for (let i = 0; i < chunks.length; i++) {
            if (chunks[i].kind === "empty") {
                for (let _ = 0; _ < chunks[i].size; _++) {
                    memory2.push(null);
                }
            } else {
                for (let _ = 0; _ < chunks[i].size; _++) {
                    memory2.push(chunks[i].fileId!);
                }
            }
        }

        for (let i = 0; i < memory2.length; i++) {
            if (memory[i] !== memory2[i]) {
                const fileId = memory2[i];
                const index = memory.indexOf(fileId);

                trace.push({ kind: "select", index: index });
                trace.push({ kind: "select", index: i });

                trace.push({ kind: "move", fromIndex: index, toIndex: i });

                trace.push({ kind: "select-out", index: index });
                trace.push({ kind: "select-out", index: i });

                memory[index] = null;
            }
        }

        let total = 0;
        for (let i = 0; i < memory2.length; i++) {
            const fileId = memory2[i];
            if (fileId !== null) {
                const result = i * fileId;
                trace.push({ kind: "select", index: i });
                trace.push({ kind: "multiply", lhs: i, rhs: fileId, result });
                total += result;
                trace.push({ kind: "checksum", checksum: total });
                trace.push({ kind: "select-out", index: i });
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
    private diskElements: { item: HTMLLIElement, text: HTMLSpanElement }[] = [];

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
        case "select":
            return this.select(step);
        case "select-out":
            return this.selectOut(step);
        case "move":
            return this.move(step);
        case "multiply":
            return this.multiply(step);
        case "checksum":
            return this.checksum(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part2TraceItem).kind}`);
        }
    }

    private createInput(step: Part2TraceItemInput): number {
        this.memoryRow!.innerHTML = "";

        const max = Math.max(...step.disk.filter(x => x !== null) as number[]);
        const bestWidth = 4 * (max.toString().length + 1);
        const bestWidthStr = "w-" + bestWidth.toString();

        const disk = step.disk;
        for (let i = 0; i < disk.length; i++) {
            const item = utils.createCharItem(disk[i] === null ? "." : disk[i]!.toString());
            item.item.classList.add(
                "flex",
                "flex-row",
                "justify-center", // Center items vertically
                bestWidthStr, // Fixed width
                "h-8", // Fixed height
                "m-1" // Add margin to the item
            );
            this.diskElements.push(item);
            this.memoryRow!.appendChild(item.item);
        }

        return 1000;
    }

    private select(step: Part2TraceItemSelect): number {
        const item = this.diskElements[step.index];
        item.item.classList.remove("bg-neutral-800");
        item.item.classList.add("bg-yellow-500");

        return 1000;
    }

    private selectOut(step: Part2TraceItemSelectOut): number {
        const item = this.diskElements[step.index];
        item.item.classList.remove("bg-yellow-500");
        item.item.classList.add("bg-neutral-800");

        return 1000;
    }

    private move(step: Part2TraceItemMove): number {
        const fromItem = this.diskElements[step.fromIndex];
        const toItem = this.diskElements[step.toIndex];
        toItem.text.textContent = fromItem.text.textContent;
        fromItem.text.textContent = ".";

        toItem.item.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

        return 1000;
    }

    private multiply(step: Part2TraceItemMultiply): number {
        this.lhsItem!.textContent = step.lhs.toString();
        this.rhsItem!.textContent = step.rhs.toString();
        this.resultItem!.textContent = step.result.toString();

        this.resultItem!.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

        return 1000;
    }

    private checksum(step: Part2TraceItemChecksum): number {
        this.answerNumber!.textContent = step.checksum.toString();
        return 1000;
    }

    private create(): void {
        // Create the main puzzle container
        const puzzleDiv = document.createElement("div");
        puzzleDiv.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a row
            "justify-center",   // Start items horizontally
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

        this.diskElements = [];
    }
}

const DESCRIPTION_PART1 = [
    utils.createParagraph("TODO"),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("TODO"),
];

const DEFAULT_INPUT_PART1 = "2333133121414131402";
const DEFAULT_INPUT_PART2 = "2333133121414131402";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
