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
        return input.trim().split("\n").map(line => line.split(""));
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
            this.elements!.push(reportItems);
        }

        return 1000;
    }

    private coord(step: Part1TraceItemCoord): number {
        const [row, col] = step.coord;
        this.elements![row][col].item.classList.add("bg-yellow-500");

        this.elements![step.coord[0]][step.coord[1]].item.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

        return 1000;
    }

    private coordOut(step: Part1TraceItemCoordOut): number {
        const [row, col] = step.coord;
        this.elements![row][col].item.classList.remove("bg-yellow-500");
        return 1000;
    }

    private check(step: Part1TraceItemCheckMatch): number {
        this.checkItems!.forEach((item, index) => {
            item.text.textContent = step.what[index];
        });

        step.coords.forEach(([row, col]) => {
            this.elements![row][col].item.classList.add("bg-yellow-500");
        });

        return 1000;
    }

    private checkOut(step: Part1TraceItemCheckMatchOut): number {
        step.coords.forEach(([row, col]) => {
            this.elements![row][col].item.classList.remove("bg-yellow-500");
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

        // Create a div that will contain the reports columns
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
        this.reportsColumn = document.createElement("ul");
        this.reportsColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "mt-4"             // Margin top
        );
        reportsDiv.appendChild(this.reportsColumn);

        this.elements = [];
    }
}

type Part2TraceItemInput = { kind: "input", matrix: string[][] };
type Part2TraceItemCoord = { kind: "coord", coord: [number, number] };
type Part2TraceItemCoordOut = { kind: "coord-out", coord: [number, number] };
type Part2TraceItemCheckMatch1 = { kind: "check1", what: string, coords: [number, number][] };
type Part2TraceItemCheckMatchOut1 = { kind: "check1-out", coords: [number, number][] };
type Part2TraceItemMatch1 = { kind: "match1", ok1: boolean };
type Part2TraceItemMatchOut1 = { kind: "match1-out" };
type Part2TraceItemCheckMatch2 = { kind: "check2", what: string, coords: [number, number][] };
type Part2TraceItemCheckMatchOut2 = { kind: "check2-out", coords: [number, number][] };
type Part2TraceItemMatch2 = { kind: "match2", ok2: boolean };
type Part2TraceItemMatchOut2 = { kind: "match2-out" };
type Part2TraceItemTotal = { kind: "total", total: number };

type Part2TraceItem = Part2TraceItemInput | Part2TraceItemCoord | Part2TraceItemCoordOut | Part2TraceItemCheckMatch1 | Part2TraceItemCheckMatchOut1 | Part2TraceItemMatch1 | Part2TraceItemMatchOut1 | Part2TraceItemCheckMatch2 | Part2TraceItemCheckMatchOut2 | Part2TraceItemMatch2 | Part2TraceItemMatchOut2 | Part2TraceItemTotal;

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): string[][] {
        return input.trim().split("\n").map(line => line.split(""));
    }

    solve(): Trace<Part2TraceItem> {
        const trace: Trace<Part2TraceItem> = [];

        const matrix = this.parseInput(this.input);
        trace.push({ kind: "input", matrix });

        const rows = matrix.length;
        const cols = matrix[0].length;
        let total = 0;
        for (let row = 1; row < rows - 1; row++) {
            for (let col = 1; col < cols - 1; col++) {
                trace.push({ kind: "coord", coord: [row, col] });

                let ok1 = false;
                let ok2 = false;

                const indices = [[row - 1, col - 1], [row, col], [row + 1, col + 1]] as [number, number][];
                const slice1 = indices.map(([row, col]) => matrix[row][col]).join("");
                trace.push({ kind: "check1", what: slice1, coords: [[row - 1, col - 1], [row + 1, col + 1]] });
                if (slice1 === "MAS" || slice1 === "SAM") {
                    ok1 = true;
                }
                trace.push({ kind: "match1", ok1 });

                if (ok1) {
                    const indices = [[row + 1, col - 1], [row, col], [row - 1, col + 1]] as [number, number][];
                    const slice2 = indices.map(([row, col]) => matrix[row][col]).join("");
                    trace.push({ kind: "check2", what: slice2, coords: [[row + 1, col - 1], [row - 1, col + 1]] });
                    if (slice2 === "MAS" || slice2 === "SAM") {
                        ok2 = true;
                    }
                    trace.push({ kind: "match2", ok2 });
                }

                if (ok1 && ok2) {
                    total++;
                    trace.push({ kind: "total", total });
                }

                trace.push({ kind: "check1-out", coords: [[row - 1, col - 1], [row + 1, col + 1]] });

                if (ok1) {
                    trace.push({ kind: "check2-out", coords: [[row + 1, col - 1], [row - 1, col + 1]] });
                }

                trace.push({ kind: "match1-out" });
                if (ok1) {
                    trace.push({ kind: "match2-out" });
                }

                trace.push({ kind: "coord-out", coord: [row, col] });
            }
        }

        return trace;
    }
}

class Part2Animator implements PartAnimator<Part2TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private checkItems1?: { item: HTMLLIElement, text: HTMLSpanElement }[];
    private checkItems2?: { item: HTMLLIElement, text: HTMLSpanElement }[];
    private reportsColumn?: HTMLUListElement;
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
        case "coord":
            return this.coord(step);
        case "coord-out":
            return this.coordOut(step);
        case "check1":
            return this.check1(step);
        case "check1-out":
            return this.check1Out(step);
        case "match1":
            return this.match1(step);
        case "match1-out":
            return this.match1Out(step);
        case "check2":
            return this.check2(step);
        case "check2-out":
            return this.check2Out(step);
        case "match2":
            return this.match2(step);
        case "match2-out":
            return this.match2Out(step);
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part2TraceItem).kind}`);
        }
    }

    private createInput(step: Part2TraceItemInput): number {
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
            this.elements!.push(reportItems);
        }

        return 1000;
    }

    private coord(step: Part2TraceItemCoord): number {
        const [row, col] = step.coord;
        this.elements![row][col].item.classList.add("bg-yellow-500");

        this.elements![step.coord[0]][step.coord[1]].item.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

        return 1000;
    }

    private coordOut(step: Part2TraceItemCoordOut): number {
        const [row, col] = step.coord;
        this.elements![row][col].item.classList.remove("bg-yellow-500");
        return 1000;
    }

    private check1(step: Part2TraceItemCheckMatch1): number {
        this.checkItems1!.forEach((item, index) => {
            item.text.textContent = step.what[index];
        });

        step.coords.forEach(([row, col]) => {
            this.elements![row][col].item.classList.add("bg-yellow-500");
        });

        return 1000;
    }

    private check1Out(step: Part2TraceItemCheckMatchOut1): number {
        step.coords.forEach(([row, col]) => {
            this.elements![row][col].item.classList.remove("bg-yellow-500");
        });

        return 1000;
    }

    private match1(step: Part2TraceItemMatch1): number {
        this.checkItems1!.forEach(item => item.item.classList.remove("bg-neutral-700"));
        if (step.ok1) {
            this.checkItems1!.forEach(item => item.item.classList.add("bg-green-500"));
        } else {
            this.checkItems1!.forEach(item => item.item.classList.add("bg-red-500"));
        }

        return 1000;
    }

    private match1Out(step: Part2TraceItemMatchOut1): number {
        this.checkItems1!.forEach(item => item.item.classList.remove("bg-green-500", "bg-red-500"));
        this.checkItems1!.forEach(item => item.item.classList.add("bg-neutral-700"));
        this.checkItems1!.forEach(item => item.text.textContent = "");
        return 1000;
    }

    private check2(step: Part2TraceItemCheckMatch2): number {
        this.checkItems2!.forEach((item, index) => {
            item.text.textContent = step.what[index];
        });

        step.coords.forEach(([row, col]) => {
            this.elements![row][col].item.classList.add("bg-yellow-500");
        });

        return 1000;
    }

    private check2Out(step: Part2TraceItemCheckMatchOut2): number {
        step.coords.forEach(([row, col]) => {
            this.elements![row][col].item.classList.remove("bg-yellow-500");
        });

        return 1000;
    }

    private match2(step: Part2TraceItemMatch2): number {
        this.checkItems2!.forEach(item => item.item.classList.remove("bg-neutral-700"));
        if (step.ok2) {
            this.checkItems2!.forEach(item => item.item.classList.add("bg-green-500"));
        } else {
            this.checkItems2!.forEach(item => item.item.classList.add("bg-red-500"));
        }

        return 1000;
    }

    private match2Out(step: Part2TraceItemMatchOut2): number {
        this.checkItems2!.forEach(item => item.item.classList.remove("bg-green-500", "bg-red-500"));
        this.checkItems2!.forEach(item => item.item.classList.add("bg-neutral-700"));
        this.checkItems2!.forEach(item => item.text.textContent = "");
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
            "justify-center",  // Center items vertically
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
        this.checkItems1 = [];
        for (let i = 0; i < 3; i++) {
            const item = utils.createNumberItem("");
            this.checkItems1.push(item);
            middleRow1.appendChild(item.item);
        }

        // Create the bottom row of the middle pad
        const middleRow2 = document.createElement("ul");
        middleRow2.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mb-4"             // Margin bottom
        );
        middlePad.appendChild(middleRow2);

        // Create check items
        this.checkItems2 = [];
        for (let i = 0; i < 3; i++) {
            const item = utils.createNumberItem("");
            this.checkItems2.push(item);
            middleRow2.appendChild(item.item);
        }

        // Create a div that will contain the reports columns
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
        this.reportsColumn = document.createElement("ul");
        this.reportsColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "mt-4"             // Margin top
        );
        reportsDiv.appendChild(this.reportsColumn);

        this.elements = [];
    }
}

const DESCRIPTION_PART1 = [
    utils.createParagraph("We are given a matrix of characters. We need to count the number of times the string 'XMAS' appears in the matrix. The string can appear horizontally, vertically, or diagonally. We also have to check if it is reversed."),
    utils.createParagraph("My solution for Part1 was to go through each cell of the matrix and check if the string 'XMAS' appears in the horizontal, vertical, and diagonal directions, starting from that cell."),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("We are given a matrix of characters. We need to count the number of times the string 'MAS' or 'SAM' appears in the matrix. The string can appear diagonally in two directions."),
    utils.createParagraph("My solution for Part2 was to go through each cell of the matrix and check if the string 'MAS' or 'SAM' appears in the diagonal directions, with 'A' being the center character."),
];

const DEFAULT_INPUT_PART1 = "MMMSXXMASM\nMSAMXMSMSA\nAMXSXMAAMM\nMSAMASMSMX\nXMASAMXAMM\nXXAMMXXAMA\nSMSMSASXSS\nSAXAMASAAA\nMAMMMXMMMM\nMXMXAXMASX";
const DEFAULT_INPUT_PART2 = "MMMSXXMASM\nMSAMXMSMSA\nAMXSXMAAMM\nMSAMASMSMX\nXMASAMXAMM\nXXAMMXXAMA\nSMSMSASXSS\nSAXAMASAAA\nMAMMMXMMMM\nMXMXAXMASX";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
