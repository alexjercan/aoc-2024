import { PartAnimator, Solution, Trace, utils } from "./common";

type Part1TraceItemInput = { kind: "input", matrix: string[][] };
type Part1TraceItemCoord = { kind: "coord", coord: [number, number] };
type Part1TraceItemCoordOut = { kind: "coord-out", coord: [number, number] };
type Part1TraceItemCheckMatch = { kind: "check", what: string, coords: [number, number][] };
type Part1TraceItemCheckMatchOut = { kind: "check-out", coords: [number, number][] };
type Part1TraceItemMatch = { kind: "match", match: boolean };
type Part1TraceItemMatchOut = { kind: "match-out" };
type Part1TraceItemTotal = { kind: "total", total: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemCoord | Part1TraceItemCoordOut | Part1TraceItemCheckMatch | Part1TraceItemCheckMatchOut | Part1TraceItemMatch | Part1TraceItemMatchOut | Part1TraceItemTotal;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): string[][] {
        return input.split("\n").map(line => line.split(""));
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const matrix = this.parseInput(this.input);
        trace.push({ kind: "input", matrix });

        const rows = matrix.length;
        const cols = matrix[0].length;
        let total = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                trace.push({ kind: "coord", coord: [row, col] });

                if (col <= cols - 4) {
                    const indices = [[row, col], [row, col + 1], [row, col + 2], [row, col + 3]] as [number, number][];
                    const slice = indices.map(([row, col]) => matrix[row][col]).join("");
                    trace.push({ kind: "check", what: slice, coords: indices.slice(1) });
                    const match = slice === "XMAS";
                    trace.push({ kind: "match", match });
                    if (match) {
                        total++;
                        trace.push({ kind: "total", total });
                    }
                    trace.push({ kind: "check-out", coords: indices.slice(1) });
                    trace.push({ kind: "match-out" });
                }

                if (col >= 3) {
                    const indices = [[row, col], [row, col - 1], [row, col - 2], [row, col - 3]] as [number, number][];
                    const slice = indices.map(([row, col]) => matrix[row][col]).join("");
                    trace.push({ kind: "check", what: slice, coords: indices.slice(1) });
                    const match = slice === "XMAS";
                    trace.push({ kind: "match", match });
                    if (match) {
                        total++;
                        trace.push({ kind: "total", total });
                    }
                    trace.push({ kind: "check-out", coords: indices.slice(1) });
                    trace.push({ kind: "match-out" });
                }

                if (row <= rows - 4) {
                    const indices = [[row, col], [row + 1, col], [row + 2, col], [row + 3, col]] as [number, number][];
                    const slice = indices.map(([row, col]) => matrix[row][col]).join("");
                    trace.push({ kind: "check", what: slice, coords: indices.slice(1) });
                    const match = slice === "XMAS";
                    trace.push({ kind: "match", match });
                    if (match) {
                        total++;
                        trace.push({ kind: "total", total });
                    }
                    trace.push({ kind: "check-out", coords: indices.slice(1) });
                    trace.push({ kind: "match-out" });
                }

                if (row >= 3) {
                    const indices = [[row, col], [row - 1, col], [row - 2, col], [row - 3, col]] as [number, number][];
                    const slice = indices.map(([row, col]) => matrix[row][col]).join("");
                    trace.push({ kind: "check", what: slice, coords: indices.slice(1) });
                    const match = slice === "XMAS";
                    trace.push({ kind: "match", match });
                    if (match) {
                        total++;
                        trace.push({ kind: "total", total });
                    }
                    trace.push({ kind: "check-out", coords: indices.slice(1) });
                    trace.push({ kind: "match-out" });
                }

                if (col <= cols - 4 && row <= rows - 4) {
                    const indices = [[row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3]] as [number, number][];
                    const slice = indices.map(([row, col]) => matrix[row][col]).join("");
                    trace.push({ kind: "check", what: slice, coords: indices.slice(1) });
                    const match = slice === "XMAS";
                    trace.push({ kind: "match", match });
                    if (match) {
                        total++;
                        trace.push({ kind: "total", total });
                    }
                    trace.push({ kind: "check-out", coords: indices.slice(1) });
                    trace.push({ kind: "match-out" });
                }

                if (col <= cols - 4 && row >= 3) {
                    const indices = [[row, col], [row - 1, col + 1], [row - 2, col + 2], [row - 3, col + 3]] as [number, number][];
                    const slice = indices.map(([row, col]) => matrix[row][col]).join("");
                    trace.push({ kind: "check", what: slice, coords: indices.slice(1) });
                    const match = slice === "XMAS";
                    trace.push({ kind: "match", match });
                    if (match) {
                        total++;
                        trace.push({ kind: "total", total });
                    }
                    trace.push({ kind: "check-out", coords: indices.slice(1) });
                    trace.push({ kind: "match-out" });
                }

                if (col >= 3 && row <= rows - 4) {
                    const indices = [[row, col], [row + 1, col - 1], [row + 2, col - 2], [row + 3, col - 3]] as [number, number][];
                    const slice = indices.map(([row, col]) => matrix[row][col]).join("");
                    trace.push({ kind: "check", what: slice, coords: indices.slice(1) });
                    const match = slice === "XMAS";
                    trace.push({ kind: "match", match });
                    if (match) {
                        total++;
                        trace.push({ kind: "total", total });
                    }
                    trace.push({ kind: "check-out", coords: indices.slice(1) });
                    trace.push({ kind: "match-out" });
                }

                if (col >= 3 && row >= 3) {
                    const indices = [[row, col], [row - 1, col - 1], [row - 2, col - 2], [row - 3, col - 3]] as [number, number][];
                    const slice = indices.map(([row, col]) => matrix[row][col]).join("");
                    trace.push({ kind: "check", what: slice, coords: indices.slice(1) });
                    const match = slice === "XMAS";
                    trace.push({ kind: "match", match });
                    if (match) {
                        total++;
                        trace.push({ kind: "total", total });
                    }
                    trace.push({ kind: "check-out", coords: indices.slice(1) });
                    trace.push({ kind: "match-out" });
                }

                trace.push({ kind: "coord-out", coord: [row, col] });
            }
        }

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private checkItems?: { item: HTMLLIElement, text: HTMLSpanElement }[];
    private reportsColumn?: HTMLUListElement;
    private reports?: { item: HTMLLIElement, text: HTMLSpanElement }[][];

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
        case "coord":
            return this.coord(step);
        case "coord-out":
            return this.coordOut(step);
        case "check":
            return this.check(step);
        case "check-out":
            return this.checkOut(step);
        case "match":
            return this.match1(step);
        case "match-out":
            return this.matchOut(step);
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        for (let i = 0; i < step.matrix.length; i++) {
            const reportRow = document.createElement("li");
            reportRow.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
                "rounded-lg",      // Rounded corners
            );
            this.reportsColumn!.appendChild(reportRow);

            const reportRowList = document.createElement("ul");
            reportRowList.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
            );
            reportRow.appendChild(reportRowList);

            const reportItems = utils.createRowCharItems(reportRowList, step.matrix[i]);
            this.reports!.push(reportItems);
        }

        return 1000;
    }

    private coord(step: Part1TraceItemCoord): number {
        const [row, col] = step.coord;
        this.reports![row][col].item.classList.add("bg-yellow-500");
        return 1000;
    }

    private coordOut(step: Part1TraceItemCoordOut): number {
        const [row, col] = step.coord;
        this.reports![row][col].item.classList.remove("bg-yellow-500");
        return 1000;
    }

    private check(step: Part1TraceItemCheckMatch): number {
        this.checkItems!.forEach((item, index) => {
            item.text.textContent = step.what[index];
        });

        step.coords.forEach(([row, col]) => {
            this.reports![row][col].item.classList.add("bg-yellow-500");
        });

        return 1000;
    }

    private checkOut(step: Part1TraceItemCheckMatchOut): number {
        step.coords.forEach(([row, col]) => {
            this.reports![row][col].item.classList.remove("bg-yellow-500");
        });

        return 1000;
    }

    private match1(step: Part1TraceItemMatch): number {
        this.checkItems!.forEach(item => item.item.classList.remove("bg-neutral-700"));
        if (step.match) {
            this.checkItems!.forEach(item => item.item.classList.add("bg-green-500"));
        } else {
            this.checkItems!.forEach(item => item.item.classList.add("bg-red-500"));
        }

        return 1000;
    }

    private matchOut(step: Part1TraceItemMatchOut): number {
        this.checkItems!.forEach(item => item.item.classList.remove("bg-green-500", "bg-red-500"));
        this.checkItems!.forEach(item => item.item.classList.add("bg-neutral-700"));
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
            "justify-between", // Space between the columns
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
            "w-1/2",           // Width is 1/3 of the parent container
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

        // Create check items
        this.checkItems = [];
        for (let i = 0; i < 4; i++) {
            const item = utils.createNumberItem("");
            this.checkItems.push(item);
            middleRow1.appendChild(item.item);
        }

        // Create the reports columns that will contain all the reports in the puzzle
        this.reportsColumn = document.createElement("ul");
        this.reportsColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "mt-4"             // Margin top
        );
        puzzleDiv.appendChild(this.reportsColumn);

        this.reports = [];
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

const DEFAULT_INPUT_PART1 = "MMMSXXMASM\nMSAMXMSMSA\nAMXSXMAAMM\nMSAMASMSMX\nXMASAMXAMM\nXXAMMXXAMA\nSMSMSASXSS\nSAXAMASAAA\nMAMMMXMMMM\nMXMXAXMASX";
const DEFAULT_INPUT_PART2 = "MMMSXXMASM\nMSAMXMSMSA\nAMXSXMAAMM\nMSAMASMSMX\nXMASAMXAMM\nXXAMMXXAMA\nSMSMSASXSS\nSAXAMASAAA\nMAMMMXMMMM\nMXMXAXMASX";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
