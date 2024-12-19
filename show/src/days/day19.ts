import { PartAnimator, Solution, Trace, utils } from "./common";

type Part1TraceItemInput = { kind: "input", towels: string[], patterns: string[] };
type Part1TraceItemPossible = { kind: "possible", index: number, lengths: number[] };
type Part1TraceItemImpossible = { kind: "impossible", index: number };
type Part1TraceItemOutput = { kind: "output", answer: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemPossible | Part1TraceItemImpossible | Part1TraceItemOutput;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): [string[], string[]] {
        const [towelsLine, puzzleBlock] = input.trim().split("\n\n");

        const towels = towelsLine.trim().split(", ");
        const patterns = puzzleBlock.trim().split("\n");

        return [towels, patterns];
    }

    private findDeisgn(pattern: string, towels: string[], result: string[], memo: Map<string, string[]>): string[] {
        if (pattern === "") {
            return result;
        }

        if (memo.has(pattern)) {
            return memo.get(pattern)!;
        }

        const options: string[][] = [];
        for (let i = 0; i < towels.length; i++) {
            const towel = towels[i];
            const patternPrefix = pattern.slice(0, towel.length);

            if (towel === patternPrefix) {
                const patternSuffix = pattern.slice(towel.length, pattern.length);

                const opt = this.findDeisgn(patternSuffix, towels, [...result, towel], memo);
                options.push(opt);
            }
        }

        const best = options.length ? options.reduce((a, b) => a.length < b.length ? a : b) : [];
        memo.set(pattern, best);
        return best;
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const [towels, patterns] = this.parseInput(this.input);
        trace.push({ kind: "input", towels, patterns });

        let answer = 0;
        for (let i = 0; i < patterns.length; i++) {
            const map = new Map<string, string[]>();
            const design = this.findDeisgn(patterns[i], towels, [], map);
            if (design.length) {
                trace.push({ kind: "possible", index: i, lengths: design.map((x) => x.length) });
                answer += 1;
            } else {
                trace.push({ kind: "impossible", index: i });
            }
        }

        trace.push({ kind: "output", answer });

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private patternsCol?: HTMLUListElement;
    private patterns: { item: HTMLLIElement, text: HTMLSpanElement }[][] = [];
    private towelsRow?: HTMLUListElement;
    private towels: { item: HTMLLIElement, text: HTMLSpanElement }[] = [];

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
        case "possible":
            return this.possible(step);
        case "impossible":
            return this.impossible(step);
        case "output":
            return this.output(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private possible(step: Part1TraceItemPossible): number {
        const index = step.index;
        const lengths = step.lengths;

        let idx = 0;
        for (let i = 0; i < lengths.length; i++) {
            const length = lengths[i];
            for (let j = idx; j < idx + length; j++) {
                const item = this.patterns[index][j];
                const color = utils.randomBgColorSeed(i);
                item.item.classList.remove("bg-neutral-800");
                item.item.classList.add(color);
            }
            idx += length;
        }

        return 1000;
    }

    private impossible(step: Part1TraceItemImpossible): number {
        const index = step.index;

        for (let i = 0; i < this.patterns[index].length; i++) {
            const item = this.patterns[index][i];
            // Strike through the text
            item.text.classList.add("line-through");
        }

        return 1000;
    }

    private output(step: Part1TraceItemOutput): number {
        this.answerNumber!.textContent = step.answer.toString();
        return 1000;
    }

    private createInput(step: Part1TraceItemInput): number {
        const towels = step.towels;
        const patterns = step.patterns;

        this.towelsRow!.innerHTML = "";

        const max = Math.max(...towels.map((x) => x.length));
        const bestWidth = 4 * (max + 1);
        const bestWidthStr = "w-" + bestWidth.toString();

        for (let i = 0; i < towels.length; i++) {
            const item = utils.createCharItem(towels[i]);
            item.item.classList.add(
                "flex",
                "flex-row",
                "justify-center", // Center items vertically
                bestWidthStr, // Fixed width
                "h-8", // Fixed height
                "m-1" // Add margin to the item
            );
            this.towels.push(item);
            this.towelsRow!.appendChild(item.item);
        }

        this.patternsCol!.innerHTML = "";
        this.patterns = [];
        for (let i = 0; i < patterns.length; i++) {
            const pattern = patterns[i];
            const patternItems = [];
            const patternRow = document.createElement("li");
            patternRow.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
                "space-x-4",       // Horizontal space between children
                "w-full",          // Full width
            );
            patternRow.textContent = pattern;

            const patternContainer = document.createElement("ul");
            patternContainer.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-start",  // Center items horizontally
                "items-center",    // Center items vertically
                "space-x-4",       // Horizontal space between children
                "w-full",          // Full width
            );

            for (let j = 0; j < pattern.length; j++) {
                const item = utils.createCharItem(pattern[j]);
                item.item.classList.add(
                    "flex",
                    "flex-row",
                    "justify-center", // Center items vertically
                    "w-8", // Fixed width
                    "h-8", // Fixed height
                    "m-1" // Add margin to the item
                );
                patternItems.push(item);
                patternContainer.appendChild(item.item);
            }

            this.patterns.push(patternItems);
            this.patternsCol!.appendChild(patternContainer);
        }

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

        // Create the towels row that will contain div's for the towels
        // If it overflows then continue on next line
        const towelsDiv = document.createElement("div");
        towelsDiv.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",   // Start items horizontally
            "items-center",    // Center items vertically
            "w-full",          // Full width
        );
        puzzleDiv.appendChild(towelsDiv);

        this.towelsRow = document.createElement("ul");
        this.towelsRow.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "flex-wrap",       // Wrap children to the next line
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-4",       // Horizontal space between children
            "w-full",          // Full width
            "overflow-x-auto"  // Allow horizontal scrolling
        );
        towelsDiv.appendChild(this.towelsRow);

        this.towels = [];

        // Create the patterns column that will contain div's for the patterns
        const patternsDiv = document.createElement("div");
        patternsDiv.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "w-full",          // Full width
        );
        puzzleDiv.appendChild(patternsDiv);

        this.patternsCol = document.createElement("ul");
        this.patternsCol.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-y-4",       // Horizontal space between children
            "max-w-full",          // Full width
            "overflow-y-auto"  // Allow vertical scrolling
        );
        patternsDiv.appendChild(this.patternsCol);

        this.patterns = [];
    }
}

type Part2TraceItemInput = { kind: "input", towels: string[], patterns: string[] };
type Part2TraceItemPossible = { kind: "possible", index: number, count: number };
type Part2TraceItemImpossible = { kind: "impossible", index: number };
type Part2TraceItemOutput = { kind: "output", answer: number };

type Part2TraceItem = Part2TraceItemInput | Part2TraceItemPossible | Part2TraceItemImpossible | Part2TraceItemOutput;

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): [string[], string[]] {
        const [towelsLine, puzzleBlock] = input.trim().split("\n\n");

        const towels = towelsLine.trim().split(", ");
        const patterns = puzzleBlock.trim().split("\n");

        return [towels, patterns];
    }

    private countDeisgns(pattern: string, towels: string[], memo: Map<string, number>): number {
        if (pattern === "") {
            return 1;
        }

        if (memo.has(pattern)) {
            return memo.get(pattern)!;
        }

        let count = 0;
        for (let i = 0; i < towels.length; i++) {
            const towel = towels[i];
            const patternPrefix = pattern.slice(0, towel.length);

            if (towel === patternPrefix) {
                const patternSuffix = pattern.slice(towel.length, pattern.length);

                count = count + this.countDeisgns(patternSuffix, towels, memo);
            }
        }

        memo.set(pattern, count);
        return count;
    }

    solve(): Trace<Part2TraceItem> {
        const trace: Trace<Part2TraceItem> = [];

        const [towels, patterns] = this.parseInput(this.input);
        trace.push({ kind: "input", towels, patterns });

        let answer = 0;
        for (let i = 0; i < patterns.length; i++) {
            const map = new Map<string, number>();
            const count = this.countDeisgns(patterns[i], towels, map);
            if (count > 0) {
                trace.push({ kind: "possible", index: i, count });
            } else {
                trace.push({ kind: "impossible", index: i });
            }
            answer += count;
        }

        trace.push({ kind: "output", answer });

        return trace;
    }
}

class Part2Animator implements PartAnimator<Part2TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private patternsCol?: HTMLUListElement;
    private patterns: { item: HTMLLIElement, text: HTMLSpanElement }[][] = [];
    private counts: { item: HTMLLIElement, text: HTMLSpanElement }[] = [];
    private towelsRow?: HTMLUListElement;
    private towels: { item: HTMLLIElement, text: HTMLSpanElement }[] = [];

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
        case "possible":
            return this.possible(step);
        case "impossible":
            return this.impossible(step);
        case "output":
            return this.output(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part2TraceItem).kind}`);
        }
    }

    private possible(step: Part2TraceItemPossible): number {
        const index = step.index;
        const count = step.count;

        this.counts[index].text.textContent = count.toString();
        for (let i = 0; i < this.patterns[index].length; i++) {
            const item = this.patterns[index][i];
            item.item.classList.remove("bg-neutral-800");
            item.item.classList.add("bg-green-500");
        }

        return 1000;
    }

    private impossible(step: Part2TraceItemImpossible): number {
        const index = step.index;

        for (let i = 0; i < this.patterns[index].length; i++) {
            const item = this.patterns[index][i];
            item.item.classList.remove("bg-neutral-800");
            item.item.classList.add("bg-red-500");
        }

        return 1000;
    }

    private output(step: Part2TraceItemOutput): number {
        this.answerNumber!.textContent = step.answer.toString();
        return 1000;
    }

    private createInput(step: Part2TraceItemInput): number {
        const towels = step.towels;
        const patterns = step.patterns;

        this.towelsRow!.innerHTML = "";

        const max = Math.max(...towels.map((x) => x.length));
        const bestWidth = 4 * (max + 1);
        const bestWidthStr = "w-" + bestWidth.toString();

        for (let i = 0; i < towels.length; i++) {
            const item = utils.createCharItem(towels[i]);
            item.item.classList.add(
                "flex",
                "flex-row",
                "justify-center", // Center items vertically
                bestWidthStr, // Fixed width
                "h-8", // Fixed height
                "m-1" // Add margin to the item
            );
            this.towels.push(item);
            this.towelsRow!.appendChild(item.item);
        }

        this.patternsCol!.innerHTML = "";
        this.patterns = [];
        for (let i = 0; i < patterns.length; i++) {
            const pattern = patterns[i];
            const patternItems = [];
            const patternRow = document.createElement("li");
            patternRow.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
                "space-x-4",       // Horizontal space between children
                "w-full",          // Full width
            );
            patternRow.textContent = pattern;

            const patternContainer = document.createElement("ul");
            patternContainer.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-start",  // Center items horizontally
                "items-center",    // Center items vertically
                "space-x-4",       // Horizontal space between children
                "w-full",          // Full width
            );

            for (let j = 0; j < pattern.length; j++) {
                const item = utils.createCharItem(pattern[j]);
                item.item.classList.add(
                    "flex",
                    "flex-row",
                    "justify-center", // Center items vertically
                    "w-8", // Fixed width
                    "h-8", // Fixed height
                    "m-1" // Add margin to the item
                );
                patternItems.push(item);
                patternContainer.appendChild(item.item);
            }

            const countItem = utils.createCharItem("?");
            countItem.item.classList.add(
                "flex",
                "flex-row",
                "justify-center", // Center items vertically
                "w-8", // Fixed width
                "h-8", // Fixed height
                "m-1" // Add margin to the item
            );
            this.counts.push(countItem);
            patternContainer.appendChild(countItem.item);

            this.patterns.push(patternItems);
            this.patternsCol!.appendChild(patternContainer);
        }

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

        // Create the towels row that will contain div's for the towels
        // If it overflows then continue on next line
        const towelsDiv = document.createElement("div");
        towelsDiv.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",   // Start items horizontally
            "items-center",    // Center items vertically
            "w-full",          // Full width
        );
        puzzleDiv.appendChild(towelsDiv);

        this.towelsRow = document.createElement("ul");
        this.towelsRow.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "flex-wrap",       // Wrap children to the next line
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-4",       // Horizontal space between children
            "w-full",          // Full width
            "overflow-x-auto"  // Allow horizontal scrolling
        );
        towelsDiv.appendChild(this.towelsRow);

        this.towels = [];

        // Create the patterns column that will contain div's for the patterns
        const patternsDiv = document.createElement("div");
        patternsDiv.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "w-full",          // Full width
        );
        puzzleDiv.appendChild(patternsDiv);

        this.patternsCol = document.createElement("ul");
        this.patternsCol.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-y-4",       // Horizontal space between children
            "max-w-full",          // Full width
            "overflow-y-auto"  // Allow vertical scrolling
        );
        patternsDiv.appendChild(this.patternsCol);

        this.patterns = [];
        this.counts = [];
    }
}

const DESCRIPTION_PART1 = [
    utils.createParagraph("TODO"),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("TODO"),
];

const DEFAULT_INPUT_PART1 = "r, wr, b, g, bwu, rb, gb, br\n\nbrwrr\nbggr\ngbbr\nrrbgbr\nubwu\nbwurrg\nbrgr\nbbrgwb";
const DEFAULT_INPUT_PART2 = "r, wr, b, g, bwu, rb, gb, br\n\nbrwrr\nbggr\ngbbr\nrrbgbr\nubwu\nbwurrg\nbrgr\nbbrgwb";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
