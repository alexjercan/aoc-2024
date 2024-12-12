import { PartAnimator, Solution, Trace, utils } from "./common";

type Vec2 = { row: number, col: number };
const DIRECTIONS: Vec2[] = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
];

type Part1TraceItemInput = { kind: "input", map: number[][] };
type Part1TraceItemSelectStart = { kind: "select-start", start: Vec2 };
type Part1TraceItemSelectStartOut = { kind: "select-start-out", start: Vec2 };
type Part1TraceItemSelectTrailOut = { kind: "select-trail-out", trail: Vec2[] };
type Part1TraceItemTotal = { kind: "total", total: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemSelectStart | Part1TraceItemSelectStartOut | Part1TraceItemSelectTrailOut | Part1TraceItemTotal;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): number[][] {
        return input.trim().split("\n").map((line) => line.split("").map((c) => parseInt(c)));
    }

    private isBounded(map: number[][], pos: Vec2): boolean {
        return pos.row >= 0 && pos.row < map.length && pos.col >= 0 && pos.col < map[0].length;
    }

    private isIncreasing(map: number[][], old: Vec2, pos: Vec2): boolean {
        return map[old.row][old.col] + 1 === map[pos.row][pos.col];
    }

    private hike(map: number[][], pos: Vec2, current: Vec2[], result: Vec2[][]): Vec2[][] {
        if (map[pos.row][pos.col] === 9) {
            result.push(current);
            return result;
        } else {
            const newResult = [];
            for (const dir of DIRECTIONS) {
                const newPos: Vec2 = { row: pos.row + dir.row, col: pos.col + dir.col };
                if (this.isBounded(map, newPos) && this.isIncreasing(map, pos, newPos)) {
                    const part = this.hike(map, newPos, [...current, newPos], result.slice());
                    newResult.push(...part);
                }
            }

            return newResult;
        }
    }

    private isDuplicated(trails: Vec2[][], trail: Vec2[]): boolean {
        const last = trail[trail.length - 1];
        for (const t of trails) {
            const lastT = t[t.length - 1];
            if (lastT.row === last.row && lastT.col === last.col) {
                return true;
            }
        }

        return false;
    }

    private trailhead(map: number[][], start: Vec2): Vec2[][] {
        const results = this.hike(map, start, [start], []);

        const uniqueResults = [];
        for (const result of results) {
            if (!this.isDuplicated(uniqueResults, result)) {
                uniqueResults.push(result);
            }
        }

        return uniqueResults;
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const map = this.parseInput(this.input);
        trace.push({ kind: "input", map });

        let total = 0;
        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[0].length; col++) {
                if (map[row][col] === 0) {
                    trace.push({ kind: "select-start", start: { row, col } });
                    const trailheads = this.trailhead(map, { row, col });
                    for (const trail of trailheads) {
                        for (let i = 1; i < trail.length; i++) {
                            trace.push({ kind: "select-start", start: trail[i] });
                        }
                        total++;
                        trace.push({ kind: "total", total });
                        trace.push({ kind: "select-trail-out", trail: trail.slice(1) });
                    }
                    trace.push({ kind: "select-start-out", start: { row, col } });
                }
            }
        }

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private elementsColumn?: HTMLUListElement;
    private elements?: { item: HTMLLIElement, text: HTMLSpanElement }[][];

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
        this.elementsColumn = undefined;
        this.elements = undefined;
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
        case "select-start":
            return this.selectStart(step);
        case "select-start-out":
            return this.selectStartOut(step);
        case "select-trail-out":
            return this.selectTrailOut(step);
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        const height = step.map.length;
        const width = step.map[0].length;

        for (let i = 0; i < height; i++) {
            const reportRow = document.createElement("li");
            reportRow.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
                "rounded-lg",      // Rounded corners
            );
            this.elementsColumn!.appendChild(reportRow);

            const elementsRowList = document.createElement("ul");
            elementsRowList.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
            );
            reportRow.appendChild(elementsRowList);

            const elementsItems: { item: HTMLLIElement, text: HTMLSpanElement }[] = [];
            for (let j = 0; j < width; j++) {
                const item = utils.createCharItem(step.map[i][j].toString());
                elementsRowList.appendChild(item.item);
                elementsItems.push(item);
            }
            this.elements!.push(elementsItems);
        }

        return 1000;
    }

    private selectStart(step: Part1TraceItemSelectStart): number {
        const { row, col } = step.start;
        this.elements![row][col].item.classList.remove("bg-neutral-800");
        this.elements![row][col].item.classList.add("bg-yellow-500");

        return 1000;
    }

    private selectStartOut(step: Part1TraceItemSelectStartOut): number {
        const { row, col } = step.start;
        this.elements![row][col].item.classList.remove("bg-yellow-500");
        this.elements![row][col].item.classList.add("bg-neutral-800");

        return 1000;
    }

    private selectTrailOut(step: Part1TraceItemSelectTrailOut): number {
        for (const pos of step.trail) {
            this.elements![pos.row][pos.col].item.classList.remove("bg-yellow-500");
            this.elements![pos.row][pos.col].item.classList.add("bg-neutral-800");
        }

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
            "overflow-auto"    // Allow scrolling
        );
        this.solutionDiv.appendChild(puzzleDiv);

        // Create the middle pad container
        const middlePad = document.createElement("div");
        middlePad.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-1/2",           // Width is 1/3 of the parent container
            "p-2",             // Padding inside the container
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


        // Create a div that will contain the columns
        const reportsDiv = document.createElement("div");
        reportsDiv.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-start",   // Align items at the start
            "items-start",     // Align items at the start
            "h-full",          // Full height
            "max-w-full",      // Full width
            "overflow-auto"    // Allow scrolling
        );
        puzzleDiv.appendChild(reportsDiv);

        // Create the reports columns that will contain all the reports in the puzzle
        this.elementsColumn = document.createElement("ul");
        this.elementsColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "mt-4"             // Margin top
        );
        reportsDiv.appendChild(this.elementsColumn);

        this.elements = [];
    }
}

type Part2TraceItemInput = { kind: "input", map: number[][] };
type Part2TraceItemSelectStart = { kind: "select-start", start: Vec2 };
type Part2TraceItemSelectStartOut = { kind: "select-start-out", start: Vec2 };
type Part2TraceItemSelectTrailOut = { kind: "select-trail-out", trail: Vec2[] };
type Part2TraceItemTotal = { kind: "total", total: number };

type Part2TraceItem = Part2TraceItemInput | Part2TraceItemSelectStart | Part2TraceItemSelectStartOut | Part2TraceItemSelectTrailOut | Part2TraceItemTotal;

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): number[][] {
        return input.trim().split("\n").map((line) => line.split("").map((c) => parseInt(c)));
    }

    private isBounded(map: number[][], pos: Vec2): boolean {
        return pos.row >= 0 && pos.row < map.length && pos.col >= 0 && pos.col < map[0].length;
    }

    private isIncreasing(map: number[][], old: Vec2, pos: Vec2): boolean {
        return map[old.row][old.col] + 1 === map[pos.row][pos.col];
    }

    private hike(map: number[][], pos: Vec2, current: Vec2[], result: Vec2[][]): Vec2[][] {
        if (map[pos.row][pos.col] === 9) {
            result.push(current);
            return result;
        } else {
            const newResult = [];
            for (const dir of DIRECTIONS) {
                const newPos: Vec2 = { row: pos.row + dir.row, col: pos.col + dir.col };
                if (this.isBounded(map, newPos) && this.isIncreasing(map, pos, newPos)) {
                    const part = this.hike(map, newPos, [...current, newPos], result.slice());
                    newResult.push(...part);
                }
            }

            return newResult;
        }
    }

    private trailhead(map: number[][], start: Vec2): Vec2[][] {
        const results = this.hike(map, start, [start], []);

        return results;
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const map = this.parseInput(this.input);
        trace.push({ kind: "input", map });

        let total = 0;
        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[0].length; col++) {
                if (map[row][col] === 0) {
                    trace.push({ kind: "select-start", start: { row, col } });
                    const trailheads = this.trailhead(map, { row, col });
                    for (const trail of trailheads) {
                        for (let i = 1; i < trail.length; i++) {
                            trace.push({ kind: "select-start", start: trail[i] });
                        }
                        total++;
                        trace.push({ kind: "total", total });
                        trace.push({ kind: "select-trail-out", trail: trail.slice(1) });
                    }
                    trace.push({ kind: "select-start-out", start: { row, col } });
                }
            }
        }

        return trace;
    }
}

class Part2Animator implements PartAnimator<Part2TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private elementsColumn?: HTMLUListElement;
    private elements?: { item: HTMLLIElement, text: HTMLSpanElement }[][];

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
        this.elementsColumn = undefined;
        this.elements = undefined;
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
        case "select-start":
            return this.selectStart(step);
        case "select-start-out":
            return this.selectStartOut(step);
        case "select-trail-out":
            return this.selectTrailOut(step);
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part2TraceItemInput): number {
        const height = step.map.length;
        const width = step.map[0].length;

        for (let i = 0; i < height; i++) {
            const reportRow = document.createElement("li");
            reportRow.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
                "rounded-lg",      // Rounded corners
            );
            this.elementsColumn!.appendChild(reportRow);

            const elementsRowList = document.createElement("ul");
            elementsRowList.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
            );
            reportRow.appendChild(elementsRowList);

            const elementsItems: { item: HTMLLIElement, text: HTMLSpanElement }[] = [];
            for (let j = 0; j < width; j++) {
                const item = utils.createCharItem(step.map[i][j].toString());
                elementsRowList.appendChild(item.item);
                elementsItems.push(item);
            }
            this.elements!.push(elementsItems);
        }

        return 1000;
    }

    private selectStart(step: Part2TraceItemSelectStart): number {
        const { row, col } = step.start;
        this.elements![row][col].item.classList.remove("bg-neutral-800");
        this.elements![row][col].item.classList.add("bg-yellow-500");

        return 1000;
    }

    private selectStartOut(step: Part2TraceItemSelectStartOut): number {
        const { row, col } = step.start;
        this.elements![row][col].item.classList.remove("bg-yellow-500");
        this.elements![row][col].item.classList.add("bg-neutral-800");

        return 1000;
    }

    private selectTrailOut(step: Part2TraceItemSelectTrailOut): number {
        for (const pos of step.trail) {
            this.elements![pos.row][pos.col].item.classList.remove("bg-yellow-500");
            this.elements![pos.row][pos.col].item.classList.add("bg-neutral-800");
        }

        return 1000;
    }

    private total(step: Part2TraceItemTotal): number {
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
            "overflow-auto"    // Allow scrolling
        );
        this.solutionDiv.appendChild(puzzleDiv);

        // Create the middle pad container
        const middlePad = document.createElement("div");
        middlePad.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-1/2",           // Width is 1/3 of the parent container
            "p-2",             // Padding inside the container
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


        // Create a div that will contain the columns
        const reportsDiv = document.createElement("div");
        reportsDiv.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-start",   // Align items at the start
            "items-start",     // Align items at the start
            "h-full",          // Full height
            "max-w-full",      // Full width
            "overflow-auto"    // Allow scrolling
        );
        puzzleDiv.appendChild(reportsDiv);

        // Create the reports columns that will contain all the reports in the puzzle
        this.elementsColumn = document.createElement("ul");
        this.elementsColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "mt-4"             // Margin top
        );
        reportsDiv.appendChild(this.elementsColumn);

        this.elements = [];
    }
}

const DESCRIPTION_PART1 = [
    utils.createParagraph("TODO"),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("TODO"),
];

const DEFAULT_INPUT_PART1 = "89010123\n78121874\n87430965\n96549874\n45678903\n32019012\n01329801\n10456732";
const DEFAULT_INPUT_PART2 = "89010123\n78121874\n87430965\n96549874\n45678903\n32019012\n01329801\n10456732";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
