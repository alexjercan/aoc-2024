import { PartAnimator, Solution, Trace, utils } from "./common";

function prng(seed: number): number {
    const MASK = (1 << 24) - 1;
    let s = seed;
    s = s ^ ((s << 6) & MASK);
    s = s ^ ((s >> 5) & MASK);
    s = s ^ ((s << 11) & MASK);
    return s;
}

type Part1TraceItemInput = { kind: "input", numbers: number[] };
type Part1TraceItemSelect = { kind: "select", index: number };
type Part1TraceItemSelectOut = { kind: "select-out", index: number };
type Part1TraceItemPRNG = { kind: "prng", index: number, result: number };
type Part1TraceItemSum = { kind: "sum", sum: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemSelect | Part1TraceItemSelectOut | Part1TraceItemPRNG | Part1TraceItemSum;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): number[] {
        return input.trim().split("\n").map((line) => parseInt(line, 10));
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const numbers = this.parseInput(this.input);
        trace.push({ kind: "input", numbers });

        let sum = 0;
        for (let index = 0; index < numbers.length; index++) {
            const seed = numbers[index];
            trace.push({ kind: "select", index });
            let acc = seed;
            for (let i = 0; i < 2000; i++) {
                acc = prng(acc);
                trace.push({ kind: "prng", index, result: acc });
            }
            trace.push({ kind: "select-out", index });

            sum += acc;
            trace.push({ kind: "sum", sum });
        }

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private numbersColumn?: HTMLDivElement;
    private resultsColumn?: HTMLDivElement;

    constructor(inputDiv: HTMLDivElement, solutionDiv: HTMLDivElement) {
        this.inputDiv = inputDiv;
        this.solutionDiv = solutionDiv;

        this.reset();
    }

    reset(): void {
        this.inputDiv.classList.remove("hidden");
        this.solutionDiv.classList.add("hidden");
        this.solutionDiv.innerHTML = "";

        this.answerNumber = undefined;
        this.numbersColumn = undefined;
        this.resultsColumn = undefined;
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
        case "prng":
            return this.prng(step);
        case "sum":
            return this.sum(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        this.numbersColumn!.innerHTML = "";
        for (const code of step.numbers) {
            const codeDiv = document.createElement("div");
            codeDiv.classList.add(
                "text-2xl",       // Large text size
                "font-semibold",  // Semi-bold text
                "text-center",    // Centered text
                "text-white"      // White text color
            );
            codeDiv.textContent = code.toString();
            this.numbersColumn!.appendChild(codeDiv);

            const resultDiv = document.createElement("div");
            resultDiv.classList.add(
                "text-2xl",       // Large text size
                "font-semibold",  // Semi-bold text
                "text-center",    // Centered text
                "text-white"      // White text color
            );
            resultDiv.textContent = "?";
            this.resultsColumn!.appendChild(resultDiv);
        }

        return 1000;
    }

    private select(step: Part1TraceItemSelect): number {
        const codeDiv = this.numbersColumn!.children[step.index] as HTMLDivElement;
        codeDiv.classList.remove("bg-neutral-800");
        codeDiv.classList.add("bg-green-500");

        return 1000;
    }

    private selectOut(step: Part1TraceItemSelectOut): number {
        const codeDiv = this.numbersColumn!.children[step.index] as HTMLDivElement;
        codeDiv.classList.remove("bg-green-500");
        codeDiv.classList.add("bg-neutral-800");

        return 1000;
    }

    private prng(step: Part1TraceItemPRNG): number {
        const resultDiv = this.resultsColumn!.children[step.index] as HTMLDivElement;
        resultDiv.textContent = step.result.toString();

        return 1000;
    }

    private sum(step: Part1TraceItemSum): number {
        this.answerNumber!.textContent = step.sum.toString();

        return 1000;
    }

    private create(): void {
        // Create the main puzzle container
        const puzzleDiv = document.createElement("div");
        puzzleDiv.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a row
            "justify-start", // Space between the columns
            "items-center",    // Center items vertically
            "space-y-4",       // Horizontal space between children
            "w-full",          // Full width
            "h-full",          // Full height
            "grow",            // Allow the container to grow
            "py-4",            // Vertical padding
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

        // Row for the numbers and results
        const row = document.createElement("div");
        row.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center", // Space between the columns
            "items-center",    // Center items vertically
            "w-full",          // Full width
            "space-x-4",       // Horizontal space between children
        );
        puzzleDiv.appendChild(row);

        // Column for the input
        this.numbersColumn = document.createElement("div");
        this.numbersColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
            "p-4",             // Padding inside the container
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
        );
        row.appendChild(this.numbersColumn);

        // Column for the results
        this.resultsColumn = document.createElement("div");
        this.resultsColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
            "p-4",             // Padding inside the container
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
        );
        row.appendChild(this.resultsColumn);
    }
}

type Part2TraceItemInput = { kind: "input", numbers: number[] };
type Part2TraceItemSelect = { kind: "select", index: number };
type Part2TraceItemSelectOut = { kind: "select-out", index: number };
type Part2TraceItemQuad = { kind: "quad", index: number, quad: Quadruple, last: number | string };
type Part2TraceItemSum = { kind: "sum", sum: number };

type Part2TraceItem = Part2TraceItemInput | Part2TraceItemSelect | Part2TraceItemSelectOut | Part2TraceItemQuad | Part2TraceItemSum;

class Quadruple {
    a: number;
    b: number;
    c: number;
    d: number;

    constructor(a: number, b: number, c: number, d: number) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }

    push(x: number): Quadruple {
        return new Quadruple(this.b, this.c, this.d, x);
    }

    hash(): string {
        return `${this.a},${this.b},${this.c},${this.d}`;
    }
}

function parseQuadruple(str: string): Quadruple {
    const parts = str.split(",").map((part) => parseInt(part, 10));
    return new Quadruple(parts[0], parts[1], parts[2], parts[3]);
}

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): number[] {
        return input.trim().split("\n").map((line) => parseInt(line, 10));
    }

    solve(): Trace<Part2TraceItem> {
        const trace: Trace<Part2TraceItem> = [];

        const numbers = this.parseInput(this.input);
        trace.push({ kind: "input", numbers });

        const prices = new Map<string, number>();
        const results: Map<string, number>[] = [];
        for (let i = 0; i < numbers.length; i++) {
            let seed = numbers[i];
            const visited = new Map<string, number>();
            let quad = new Quadruple(0, 0, 0, 0);
            let last = seed % 10;
            trace.push({ kind: "select", index: i });

            for (let j = 0; j < 2000; j++) {
                seed = prng(seed);
                quad = quad.push(seed % 10 - last);
                last = seed % 10;
                trace.push({ kind: "quad", index: i, quad, last });

                if (j >= 4 && !visited.has(quad.hash())) {
                    prices.set(quad.hash(), (prices.get(quad.hash()) ?? 0) + seed % 10);
                    visited.set(quad.hash(), seed % 10);
                }
            }

            trace.push({ kind: "select-out", index: i });
            results.push(visited);
        }

        const max = Math.max(...prices.values());
        let quadStrMax = null;
        for (const [str, sum] of prices.entries()) {
            if (sum === max) {
                quadStrMax = str;
            }
        }
        if (quadStrMax === null) {
            throw new Error("No maximum found");
        }

        for (let index = 0; index < results.length; index++) {
            const quad = parseQuadruple(quadStrMax);
            const result = results[index].get(quadStrMax) ?? "N/A";
            trace.push({ kind: "quad", index, quad, last: result });
        }

        trace.push({ kind: "sum", sum: max });

        return trace;
    }
}

class Part2Animator implements PartAnimator<Part2TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private numbersColumn?: HTMLDivElement;
    private resultsColumn?: HTMLDivElement;

    constructor(inputDiv: HTMLDivElement, solutionDiv: HTMLDivElement) {
        this.inputDiv = inputDiv;
        this.solutionDiv = solutionDiv;

        this.reset();
    }

    reset(): void {
        this.inputDiv.classList.remove("hidden");
        this.solutionDiv.classList.add("hidden");
        this.solutionDiv.innerHTML = "";

        this.answerNumber = undefined;
        this.numbersColumn = undefined;
        this.resultsColumn = undefined;
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
        case "quad":
            return this.quad(step);
        case "sum":
            return this.sum(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part2TraceItem).kind}`);
        }
    }

    private createInput(step: Part2TraceItemInput): number {
        this.numbersColumn!.innerHTML = "";
        for (const code of step.numbers) {
            const codeDiv = document.createElement("div");
            codeDiv.classList.add(
                "text-2xl",       // Large text size
                "font-semibold",  // Semi-bold text
                "text-center",    // Centered text
                "text-white"      // White text color
            );
            codeDiv.textContent = code.toString();
            this.numbersColumn!.appendChild(codeDiv);

            const resultDiv = document.createElement("div");
            resultDiv.classList.add(
                "text-2xl",       // Large text size
                "font-semibold",  // Semi-bold text
                "text-center",    // Centered text
                "text-white"      // White text color
            );
            resultDiv.textContent = "?";
            this.resultsColumn!.appendChild(resultDiv);
        }

        return 1000;
    }

    private select(step: Part2TraceItemSelect): number {
        const codeDiv = this.numbersColumn!.children[step.index] as HTMLDivElement;
        codeDiv.classList.remove("bg-neutral-800");
        codeDiv.classList.add("bg-green-500");

        return 1000;
    }

    private selectOut(step: Part2TraceItemSelectOut): number {
        const codeDiv = this.numbersColumn!.children[step.index] as HTMLDivElement;
        codeDiv.classList.remove("bg-green-500");
        codeDiv.classList.add("bg-neutral-800");

        return 1000;
    }

    private quad(step: Part2TraceItemQuad): number {
        const resultDiv = this.resultsColumn!.children[step.index] as HTMLDivElement;
        resultDiv.textContent = `(${step.quad.a}, ${step.quad.b}, ${step.quad.c}, ${step.quad.d}) -> ${step.last}`;

        return 1000;
    }

    private sum(step: Part2TraceItemSum): number {
        this.answerNumber!.textContent = step.sum.toString();

        return 1000;
    }

    private create(): void {
        // Create the main puzzle container
        const puzzleDiv = document.createElement("div");
        puzzleDiv.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a row
            "justify-start", // Space between the columns
            "items-center",    // Center items vertically
            "space-y-4",       // Horizontal space between children
            "w-full",          // Full width
            "h-full",          // Full height
            "grow",            // Allow the container to grow
            "py-4",            // Vertical padding
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

        // Row for the numbers and results
        const row = document.createElement("div");
        row.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center", // Space between the columns
            "items-center",    // Center items vertically
            "w-full",          // Full width
            "space-x-4",       // Horizontal space between children
        );
        puzzleDiv.appendChild(row);

        // Column for the input
        this.numbersColumn = document.createElement("div");
        this.numbersColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
            "p-4",             // Padding inside the container
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
        );
        row.appendChild(this.numbersColumn);

        // Column for the results
        this.resultsColumn = document.createElement("div");
        this.resultsColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
            "p-4",             // Padding inside the container
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
        );
        row.appendChild(this.resultsColumn);
    }
}

const DESCRIPTION_PART1 = [
    utils.createParagraph("TODO"),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("TODO"),
];

const DEFAULT_INPUT_PART1 = "1\n10\n100\n2024";
const DEFAULT_INPUT_PART2 = "1\n2\n3\n2024";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
