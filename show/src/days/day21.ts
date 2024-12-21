import { PartAnimator, Solution, Trace, utils } from "./common";

type Point = [number, number];

const POSITIONS: { [key: string]: Point } = {
    "7": [0, 0],
    "8": [0, 1],
    "9": [0, 2],
    "4": [1, 0],
    "5": [1, 1],
    "6": [1, 2],
    "1": [2, 0],
    "2": [2, 1],
    "3": [2, 2],
    "0": [3, 1],
    "A": [3, 2],
    "^": [0, 1],
    "a": [0, 2],
    "<": [1, 0],
    "v": [1, 1],
    ">": [1, 2],
};

const DIRECTIONS: { [key: string]: Point } = {
    "^": [-1, 0],
    "v": [1, 0],
    "<": [0, -1],
    ">": [0, 1],
};

type Part1TraceItemInput = { kind: "input", codes: string[] };
type Part1TraceItemSelect = { kind: "select", index: number };
type Part1TraceItemTotal = { kind: "total", total: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemSelect | Part1TraceItemTotal;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;
    protected robots: number = 2;
    private memoization: {
        [key: string]: number;
    } = {};

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): string[] {
        return input.trim().split("\n");
    }

    permutations(string: string): string[] {
        function* permutations(string: string): Generator<string> {
            if (string.length === 1) yield string;
            else {
                for (let i = 0; i < string.length; i++) {
                    const char = string[i];
                    const remaining = string.slice(0, i) + string.slice(i + 1);
                    for (const perm of permutations(remaining)) {
                        yield char + perm;
                    }
                }
            }
        }

        return [...permutations(string)];
    }

    // Generate movement set
    seeToMoveSet(start: Point, fin: Point, avoid: Point): string[] {
        const delta = [fin[0] - start[0], fin[1] - start[1]];
        let string = "";

        const [dx, dy] = delta;
        if (dx < 0) string += "^".repeat(-dx);
        if (dx > 0) string += "v".repeat(dx);
        if (dy < 0) string += "<".repeat(-dy);
        if (dy > 0) string += ">".repeat(dy);

        const result = [];
        for (const perm of new Set(this.permutations(string))) {
            let valid = true;
            let position = [...start];
            for (let i = 0; i < perm.length; i++) {
                const move = perm[i];
                position = position.map((val, idx) => val + DIRECTIONS[move][idx]);
                if (position[0] === avoid[0] && position[1] === avoid[1]) {
                    valid = false;
                    break;
                }
            }
            if (valid) result.push(perm + "a");
        }

        return result.length ? result : ["a"];
    }

    // Calculate minimum length
    minLength(s: string, lim = 0, depth = 0): number {
        const key = `${s},${depth},${lim}`;
        if (this.memoization[key]) return this.memoization[key];

        const avoid: Point = depth === 0 ? [3, 0] : [0, 0];
        let cur = depth === 0 ? POSITIONS["A"] : POSITIONS["a"];
        let length = 0;

        for (const char of s) {
            const nextCurrent = POSITIONS[char];
            const moveSet = this.seeToMoveSet(cur, nextCurrent, avoid);
            if (depth === lim) {
                length += moveSet[0].length;
            } else {
                length += Math.min(...moveSet.map(move => this.minLength(move, lim, depth + 1)));
            }
            cur = nextCurrent;
        }

        this.memoization[key] = length;
        return length;
    }

    private codeToNumber(code: string): number {
        return parseInt(code.replace(/[^0-9]/g, ""), 10);
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const codes = this.parseInput(this.input);
        trace.push({ kind: "input", codes });

        let total = 0;
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            trace.push({ kind: "select", index: i });
            const length = this.minLength(code, this.robots);
            const number = this.codeToNumber(code);
            total += length * number;
            trace.push({ kind: "total", total });
        }

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private inputCodes?: HTMLDivElement;

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
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        if (!this.inputCodes) {
            return 0;
        }

        this.inputCodes.innerHTML = "";
        for (const code of step.codes) {
            const codeDiv = document.createElement("div");
            codeDiv.classList.add(
                "text-2xl",       // Large text size
                "font-semibold",  // Semi-bold text
                "text-center",    // Centered text
                "text-white"      // White text color
            );
            codeDiv.textContent = code;
            this.inputCodes.appendChild(codeDiv);
        }

        return 1000;
    }

    private select(step: Part1TraceItemSelect): number {
        if (!this.inputCodes) {
            return 0;
        }

        const codeDiv = this.inputCodes.children[step.index] as HTMLDivElement;
        codeDiv.classList.remove("bg-neutral-800");
        codeDiv.classList.add("bg-green-500");

        return 1000;
    }

    private total(step: Part1TraceItemTotal): number {
        if (!this.answerNumber) {
            return 0;
        }

        this.answerNumber.textContent = step.total.toString();

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

        // Column for the input
        this.inputCodes = document.createElement("div");
        this.inputCodes.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
            "p-4",             // Padding inside the container
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
        );
        puzzleDiv.appendChild(this.inputCodes);
    }
}

class Part2Solution extends Part1Solution {
    protected robots: number = 25;
}

class Part2Animator extends Part1Animator { }

const DESCRIPTION_PART1 = [
    utils.createParagraph("TODO"),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("TODO"),
];

const DEFAULT_INPUT_PART1 = "029A\n980A\n179A\n456A\n379A";
const DEFAULT_INPUT_PART2 = "029A\n980A\n179A\n456A\n379A";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
