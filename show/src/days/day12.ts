import { PartAnimator, Solution, Trace, utils } from "./common";

type Part1TraceItemInput = { kind: "input", garden: string[][] }; // input type is the garden plots
type Part1TraceItemAssign = { kind: "assign", row: number, col: number, plot: number }; // assign type is the plot and its position (assign a unique number to each plot)
type Part1TraceItemAreaPerimeter = { kind: "area-perimeter", area: number, perimeter: number }; // area type is the area of the plot, perimeter type is the perimeter of the plot
type Part1TraceItemTotal = { kind: "total", total: number }; // total type is the cost of building the fences (Area * Perimeter)

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemAssign | Part1TraceItemAreaPerimeter | Part1TraceItemTotal;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): string[][] {
        return input.trim().split("\n").map((line) => line.split(""));
    }

    private bfs(garden: string[][], visited: boolean[][], row: number, col: number, index: number, trace: Part1TraceItem[]): number {
        const height = garden.length;
        const width = garden[0].length;

        let area = 0;
        const plot = garden[row][col];

        const queue = [[row, col]];
        visited[row][col] = true;
        trace.push({ kind: "assign", row, col, plot: index });

        let perimeter = 0;
        while (queue.length > 0) {
            const [r, c] = queue.shift()!;
            area += 1;

            let count = 0;
            for (const dir of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                const newRow = r + dir[0];
                const newCol = c + dir[1];

                if (newRow < 0 || newRow >= height || newCol < 0 || newCol >= width) {
                    continue;
                }

                if (garden[newRow][newCol] === plot) {
                    count += 1;

                    if (!visited[newRow][newCol]) {
                        visited[newRow][newCol] = true;
                        trace.push({ kind: "assign", row: newRow, col: newCol, plot: index });
                        queue.push([newRow, newCol]);
                    }
                }
            }

            perimeter += 4 - count;
            trace.push({ kind: "area-perimeter", area, perimeter });
        }

        return area * perimeter;
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const garden = this.parseInput(this.input);
        trace.push({ kind: "input", garden });

        const width = garden[0].length;
        const height = garden.length;

        const visited = new Array(height).fill(null).map(() => new Array(width).fill(false));

        let total = 0;
        let index = 0;
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                if (visited[row][col]) {
                    continue;
                }

                total += this.bfs(garden, visited, row, col, index, trace);
                index += 1;
                trace.push({ kind: "total", total });
                trace.push({ kind: "area-perimeter", area: 0, perimeter: 0 });
            }
        }

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private areaNumber?: HTMLSpanElement;
    private perimeterNumber?: HTMLSpanElement;
    private mapColumn?: HTMLUListElement;
    private tiles?: { item: HTMLLIElement, text: HTMLSpanElement }[][];

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
        case "assign":
            return this.assign(step);
        case "area-perimeter":
            return this.areaPerimeter(step);
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        for (let i = 0; i < step.garden.length; i++) {
            const mapRow = document.createElement("li");
            mapRow.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
                "rounded-lg",      // Rounded corners
            );
            this.mapColumn!.appendChild(mapRow);

            const mapRowList = document.createElement("ul");
            mapRowList.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
            );
            mapRow.appendChild(mapRowList);

            const row = step.garden[i];
            const reportItems = utils.createRowCharItems(mapRowList, row);
            this.tiles!.push(reportItems);
        }

        return 1000;
    }

    private assign(step: Part1TraceItemAssign): number {
        const tile = this.tiles![step.row][step.col];
        const color = utils.randomBgColorSeed(step.plot);
        tile.item.classList.remove("bg-neutral-800");
        tile.item.classList.add(color);
        return 1000;
    }

    private areaPerimeter(step: Part1TraceItemAreaPerimeter): number {
        this.areaNumber!.textContent = step.area.toString();
        this.perimeterNumber!.textContent = step.perimeter.toString();
        return 1000;
    }

    private total(step: Part1TraceItemTotal): number {
        this.answerNumber!.textContent = step.total.toString();
        return 1000;
    }

    private create(): void {
        // Create the main puzzle container
        const puzzleDiv = document.createElement("div");
        puzzleDiv.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a row
            "justify-between", // Space between the columns
            "items-center",    // Center items vertically
            "w-full",          // Full width
            "h-full",          // Full height
            "grow",            // Allow the container to grow
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
            "text-green-500"  // Green text color
        );
        middlePad.appendChild(answerDiv);

        // Create the answer text inside the answer container
        const answerText = document.createElement("span");
        answerText.textContent = "Answer: ";
        answerDiv.appendChild(answerText);

        // Create a row for the area and perimeter
        const rowDiv = document.createElement("div");
        rowDiv.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
        );
        middlePad.appendChild(rowDiv);

        // Create the area container
        const areaDiv = document.createElement("div");
        areaDiv.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "mr-4"             // Margin right
        );
        rowDiv.appendChild(areaDiv);

        // Create the area text inside the area container
        const areaText = document.createElement("span");
        areaText.textContent = "Area: ";
        areaDiv.appendChild(areaText);

        // Create the area number inside the area container
        this.areaNumber = document.createElement("span");
        this.areaNumber.textContent = "0";
        this.areaNumber.classList.add(
            "transition-all",  // Smooth transition
            "ease-in-out",     // Ease-in-out timing function
            "duration-300",    // 300ms transition duration
        );
        areaDiv.appendChild(this.areaNumber);

        // Create the perimeter container
        const perimeterDiv = document.createElement("div");
        perimeterDiv.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center"     // Center items horizontally
        );
        rowDiv.appendChild(perimeterDiv);

        // Create the perimeter text inside the perimeter container
        const perimeterText = document.createElement("span");
        perimeterText.textContent = "Perimeter: ";
        perimeterDiv.appendChild(perimeterText);

        // Create the perimeter number inside the perimeter container
        this.perimeterNumber = document.createElement("span");
        this.perimeterNumber.textContent = "0";
        this.perimeterNumber.classList.add(
            "transition-all",  // Smooth transition
            "ease-in-out",     // Ease-in-out timing function
            "duration-300",    // 300ms transition duration
        );
        perimeterDiv.appendChild(this.perimeterNumber);

        // Create the answer number inside the answer container
        this.answerNumber = document.createElement("span");
        this.answerNumber.classList.add(
            "transition-all",  // Smooth transition
            "ease-in-out",     // Ease-in-out timing function
            "duration-300",    // 300ms transition duration
        );
        this.answerNumber.textContent = "0";
        answerDiv.appendChild(this.answerNumber);

        // Create a div that will contain the reports columns
        const mapDiv = document.createElement("div");
        mapDiv.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-start",   // Align items at the start
            "items-start",     // Align items at the start
            "h-full",          // Full height
            "max-w-full",      // Full width
            "overflow-auto"    // Allow scrolling
        );
        puzzleDiv.appendChild(mapDiv);

        // Create the reports columns that will contain all the reports in the puzzle
        this.mapColumn = document.createElement("ul");
        this.mapColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "mt-4"             // Margin top
        );
        mapDiv.appendChild(this.mapColumn);

        this.tiles = [];
    }
}

type Part2TraceItemInput = { kind: "input", garden: string[][] }; // input type is the garden plots
type Part2TraceItemAssign = { kind: "assign", row: number, col: number, plot: number }; // assign type is the plot and its position (assign a unique number to each plot)
type Part2TraceItemAreaSides = { kind: "area-sides", area: number, sides: number }; // area type is the area of the plot, sides type is the number of sides of the plot (number of corners)
type Part2TraceItemTotal = { kind: "total", total: number }; // total type is the cost of building the fences (Area * Perimeter)

type Part2TraceItem = Part2TraceItemInput | Part2TraceItemAssign | Part2TraceItemAreaSides | Part2TraceItemTotal;

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): string[][] {
        return input.trim().split("\n").map((line) => line.split(""));
    }

    private corners(region: [number, number][]): number {
        let sides = 0;

        const edgeCoordCorners = new Set<string>();

        // Populate edgeCoordCorners
        for (const [x, y] of region) {
            for (const [dx, dy] of [
                [0.5, 0.5],
                [0.5, -0.5],
                [-0.5, 0.5],
                [-0.5, -0.5]
            ]) {
                edgeCoordCorners.add(`${x + dx},${y + dy}`);
            }
        }

        // Analyze edge coordinates
        for (const corner of edgeCoordCorners) {
            const [x, y] = corner.split(",").map(Number);
            let pattern = "";

            for (const [dx, dy] of [
                [0.5, 0.5],
                [0.5, -0.5],
                [-0.5, 0.5],
                [-0.5, -0.5]
            ]) {
                pattern += region.some(([rx, ry]) => rx === x + dx && ry === y + dy) ? "X" : "O";
            }

            if (pattern === "OXXO" || pattern === "XOOX") {
                sides += 2;
            } else if (pattern.split("X").length - 1 === 3 || pattern.split("O").length - 1 === 3) {
                sides += 1;
            }
        }

        return sides;
    }

    private bfs(garden: string[][], visited: boolean[][], row: number, col: number, index: number, trace: Part2TraceItem[]): number {
        const height = garden.length;
        const width = garden[0].length;

        let area = 0;
        const plot = garden[row][col];

        const queue = [[row, col]];
        visited[row][col] = true;

        const plots: [number, number][] = [];
        while (queue.length > 0) {
            const [r, c] = queue.shift()!;
            trace.push({ kind: "assign", row: r, col: c, plot: index });

            area += 1;

            plots.push([r, c]);
            trace.push({ kind: "area-sides", area, sides: this.corners(plots) });

            for (const dir of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                const newRow = r + dir[0];
                const newCol = c + dir[1];

                if (newRow < 0 || newRow >= height || newCol < 0 || newCol >= width) {
                    continue;
                }

                if (garden[newRow][newCol] === plot) {
                    if (!visited[newRow][newCol]) {
                        visited[newRow][newCol] = true;
                        queue.push([newRow, newCol]);
                    }
                }
            }
        }

        return area * this.corners(plots);
    }

    solve(): Trace<Part2TraceItem> {
        const trace: Trace<Part2TraceItem> = [];

        const garden = this.parseInput(this.input);
        trace.push({ kind: "input", garden });

        const width = garden[0].length;
        const height = garden.length;

        const visited = new Array(height).fill(null).map(() => new Array(width).fill(false));

        let total = 0;
        let index = 0;
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                if (visited[row][col]) {
                    continue;
                }

                total += this.bfs(garden, visited, row, col, index, trace);
                index += 1;
                trace.push({ kind: "total", total });
                trace.push({ kind: "area-sides", area: 0, sides: 0 });
            }
        }

        return trace;
    }
}

class Part2Animator implements PartAnimator<Part2TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private areaNumber?: HTMLSpanElement;
    private sidesNumber?: HTMLSpanElement;
    private mapColumn?: HTMLUListElement;
    private tiles?: { item: HTMLLIElement, text: HTMLSpanElement }[][];

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
        case "assign":
            return this.assign(step);
        case "area-sides":
            return this.areaSides(step);
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part2TraceItemInput): number {
        for (let i = 0; i < step.garden.length; i++) {
            const mapRow = document.createElement("li");
            mapRow.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
                "rounded-lg",      // Rounded corners
            );
            this.mapColumn!.appendChild(mapRow);

            const mapRowList = document.createElement("ul");
            mapRowList.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
            );
            mapRow.appendChild(mapRowList);

            const row = step.garden[i];
            const reportItems = utils.createRowCharItems(mapRowList, row);
            this.tiles!.push(reportItems);
        }

        return 1000;
    }

    private assign(step: Part2TraceItemAssign): number {
        const tile = this.tiles![step.row][step.col];
        const color = utils.randomBgColorSeed(step.plot);
        tile.item.classList.remove("bg-neutral-800");
        tile.item.classList.add(color);
        return 1000;
    }

    private areaSides(step: Part2TraceItemAreaSides): number {
        this.areaNumber!.textContent = step.area.toString();
        this.sidesNumber!.textContent = step.sides.toString();
        return 1000;
    }

    private total(step: Part2TraceItemTotal): number {
        this.answerNumber!.textContent = step.total.toString();
        return 1000;
    }

    private create(): void {
        // Create the main puzzle container
        const puzzleDiv = document.createElement("div");
        puzzleDiv.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a row
            "justify-between", // Space between the columns
            "items-center",    // Center items vertically
            "w-full",          // Full width
            "h-full",          // Full height
            "grow",            // Allow the container to grow
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
            "text-green-500"  // Green text color
        );
        middlePad.appendChild(answerDiv);

        // Create the answer text inside the answer container
        const answerText = document.createElement("span");
        answerText.textContent = "Answer: ";
        answerDiv.appendChild(answerText);

        // Create a row for the area and perimeter
        const rowDiv = document.createElement("div");
        rowDiv.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
        );
        middlePad.appendChild(rowDiv);

        // Create the area container
        const areaDiv = document.createElement("div");
        areaDiv.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "mr-4"             // Margin right
        );
        rowDiv.appendChild(areaDiv);

        // Create the area text inside the area container
        const areaText = document.createElement("span");
        areaText.textContent = "Area: ";
        areaDiv.appendChild(areaText);

        // Create the area number inside the area container
        this.areaNumber = document.createElement("span");
        this.areaNumber.textContent = "0";
        this.areaNumber.classList.add(
            "transition-all",  // Smooth transition
            "ease-in-out",     // Ease-in-out timing function
            "duration-300",    // 300ms transition duration
        );
        areaDiv.appendChild(this.areaNumber);

        // Create the perimeter container
        const perimeterDiv = document.createElement("div");
        perimeterDiv.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center"     // Center items horizontally
        );
        rowDiv.appendChild(perimeterDiv);

        // Create the perimeter text inside the perimeter container
        const perimeterText = document.createElement("span");
        perimeterText.textContent = "Sides: ";
        perimeterDiv.appendChild(perimeterText);

        // Create the perimeter number inside the perimeter container
        this.sidesNumber = document.createElement("span");
        this.sidesNumber.textContent = "0";
        this.sidesNumber.classList.add(
            "transition-all",  // Smooth transition
            "ease-in-out",     // Ease-in-out timing function
            "duration-300",    // 300ms transition duration
        );
        perimeterDiv.appendChild(this.sidesNumber);

        // Create the answer number inside the answer container
        this.answerNumber = document.createElement("span");
        this.answerNumber.classList.add(
            "transition-all",  // Smooth transition
            "ease-in-out",     // Ease-in-out timing function
            "duration-300",    // 300ms transition duration
        );
        this.answerNumber.textContent = "0";
        answerDiv.appendChild(this.answerNumber);

        // Create a div that will contain the reports columns
        const mapDiv = document.createElement("div");
        mapDiv.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-start",   // Align items at the start
            "items-start",     // Align items at the start
            "h-full",          // Full height
            "max-w-full",      // Full width
            "overflow-auto"    // Allow scrolling
        );
        puzzleDiv.appendChild(mapDiv);

        // Create the reports columns that will contain all the reports in the puzzle
        this.mapColumn = document.createElement("ul");
        this.mapColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "mt-4"             // Margin top
        );
        mapDiv.appendChild(this.mapColumn);

        this.tiles = [];
    }
}

const DESCRIPTION_PART1 = [
    utils.createParagraph("TODO"),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("TODO"),
];

const DEFAULT_INPUT_PART1 = "RRRRIICCFF\nRRRRIICCCF\nVVRRRCCFFF\nVVRCCCJFFF\nVVVVCJJCFE\nVVIVCCJJEE\nVVIIICJJEE\nMIIIIIJJEE\nMIIISIJEEE\nMMMISSJEEE";
const DEFAULT_INPUT_PART2 = "RRRRIICCFF\nRRRRIICCCF\nVVRRRCCFFF\nVVRCCCJFFF\nVVVVCJJCFE\nVVIVCCJJEE\nVVIIICJJEE\nMIIIIIJJEE\nMIIISIJEEE\nMMMISSJEEE";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
