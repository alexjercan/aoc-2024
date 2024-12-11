import { PartAnimator, Solution, Trace, utils } from "./common";

type Vec2 = { row: number, col: number };

type Part1TraceItemInput = { kind: "input", antenas: Map<string, Vec2[]>, width: number, height: number };
type Part1TraceItemSelectFreq = { kind: "select-freq", antena: string };
type Part1TraceItemSelectFreqOut = { kind: "select-freq-out", antena: string };
type Part1TraceItemSelectCoords = { kind: "select-coords", coords: Vec2[] };
type Part1TraceItemSelectCoordsOut = { kind: "select-coords-out", coords: Vec2[] };
type Part1TraceItemAntinodes = { kind: "antinodes", antinodes: [string, Vec2][] };
type Part1TraceItemAntinoesOut = { kind: "antinodes-out", antinodes: [string, Vec2][] };
type Part1TraceItemTotal = { kind: "total", total: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemSelectFreq | Part1TraceItemSelectFreqOut | Part1TraceItemSelectCoords | Part1TraceItemSelectCoordsOut | Part1TraceItemAntinodes | Part1TraceItemAntinoesOut | Part1TraceItemTotal;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): [Map<string, Vec2[]>, number, number] {
        const map = new Map<string, Vec2[]>();
        const lines = input.trim().split("\n");
        const height = lines.length;
        const width = lines[0].length;
        for (let row = 0; row < lines.length; row++) {
            const line = lines[row];
            for (let col = 0; col < line.length; col++) {
                const c = line[col];
                if (c === ".") {
                    continue;
                }
                if (!map.has(c)) {
                    map.set(c, []);
                }
                map.get(c)!.push({ row, col });
            }
        }

        return [map, width, height];
    }

    private combinations2(arr: Vec2[]): [Vec2, Vec2][] {
        const result: [Vec2, Vec2][] = [];
        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                result.push([arr[i], arr[j]]);
            }
        }

        return result;
    }

    private bounded(coord: Vec2, antenas: Map<string, Vec2[]>, width: number, height: number): boolean {
        const bounded = coord.row >= 0 && coord.row < height && coord.col >= 0 && coord.col < width;

        for (const [_, coords] of antenas) {
            if (coords.some(c => c.row === coord.row && c.col === coord.col)) {
                return false;
            }
        }

        return bounded;
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const [antenas, width, height] = this.parseInput(this.input);
        trace.push({ kind: "input", antenas, width, height });

        const colors = new Map<string, string>();
        const anitnodesMap = new Map<string, Set<Vec2>>();

        let totalAntinodes = new Set<string>();
        for (const [antena, coords] of antenas) {
            trace.push({ kind: "select-freq", antena });
            colors.set(antena, utils.randomBgColor());

            const antinodes = new Set<Vec2>();

            const combs = this.combinations2(coords);
            for (const [coord1, coord2] of combs) {
                trace.push({ kind: "select-coords", coords: [coord1, coord2] });

                const colDelta = coord1.col - coord2.col;
                const rowDelta = coord1.row - coord2.row;
                const antinodesCoords = [
                    { col: coord1.col + colDelta, row: coord1.row + rowDelta },
                    { col: coord2.col - colDelta, row: coord2.row - rowDelta },
                ];
                const antinodesCoordsFiltered = antinodesCoords.filter(coord => this.bounded(coord, antenas, width, height));
                antinodesCoordsFiltered.forEach(coord => antinodes.add(coord));

                trace.push({ kind: "antinodes", antinodes: Array.from(antinodes).map(coord => [colors.get(antena)!, coord]) });
                trace.push({ kind: "select-coords-out", coords: [coord1, coord2] });
            }

            totalAntinodes = new Set([...totalAntinodes, ...Array.from(antinodes).map(coord => `${coord.row},${coord.col}`)]);
            anitnodesMap.set(antena, antinodes);

            trace.push({ kind: "total", total: totalAntinodes.size });
            trace.push({ kind: "select-freq-out", antena });
        }

        const anitnodesOut: [string, Vec2][] = [];
        for (const [antena, _] of antenas) {
            anitnodesMap.get(antena)!.forEach(coord => anitnodesOut.push([antena, coord]));
        }
        trace.push({ kind: "antinodes-out", antinodes: anitnodesOut });

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private frequencySpan?: HTMLSpanElement;
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
        this.frequencySpan = undefined;
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
        case "select-freq":
            return this.selectFreq(step);
        case "select-freq-out":
            return this.selectFreqOut(step);
        case "select-coords":
            return this.selectCoords(step);
        case "select-coords-out":
            return this.selectCoordsOut(step);
        case "antinodes":
            return this.antinodes(step);
        case "antinodes-out":
            return this.antinodesOut(step);
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        for (let i = 0; i < step.height; i++) {
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
            for (let j = 0; j < step.width; j++) {
                const item = utils.createCharItem(".");
                elementsRowList.appendChild(item.item);
                elementsItems.push(item);
            }
            this.elements!.push(elementsItems);
        }

        for (const [antena, coords] of step.antenas) {
            for (const coord of coords) {
                this.elements![coord.row][coord.col].text.textContent = antena;
            }
        }

        return 1000;
    }

    private selectFreq(step: Part1TraceItemSelectFreq): number {
        this.frequencySpan!.textContent = step.antena;
        return 1000;
    }

    private selectFreqOut(step: Part1TraceItemSelectFreqOut): number {
        this.frequencySpan!.textContent = "?";
        return 1000;
    }

    private selectCoords(step: Part1TraceItemSelectCoords): number {
        for (const coord of step.coords) {
            this.elements![coord.row][coord.col].item.classList.remove("text-white");
            this.elements![coord.row][coord.col].item.classList.add("text-yellow-500");
        }

        return 1000;
    }

    private selectCoordsOut(step: Part1TraceItemSelectCoordsOut): number {
        for (const coord of step.coords) {
            this.elements![coord.row][coord.col].item.classList.remove("text-yellow-500");
            this.elements![coord.row][coord.col].item.classList.add("text-white");
        }

        return 1000;
    }

    private antinodes(step: Part1TraceItemAntinodes): number {
        for (const [color, coord] of step.antinodes) {
            if (!this.elements![coord.row][coord.col].item.classList.contains("bg-neutral-800")) {
                continue;
            }
            this.elements![coord.row][coord.col].item.classList.remove("bg-neutral-800");
            this.elements![coord.row][coord.col].item.classList.add(color);
        }

        return 1000;
    }

    private antinodesOut(step: Part1TraceItemAntinoesOut): number {
        for (const [color, coord] of step.antinodes) {
            if (!this.elements![coord.row][coord.col].item.classList.contains(color)) {
                continue;
            }
            this.elements![coord.row][coord.col].item.classList.remove(color);
            this.elements![coord.row][coord.col].item.classList.add("bg-neutral-800");
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

        // Create the top row of the middle pad
        const middleRow1 = document.createElement("ul");
        middleRow1.classList.add(
            "text-xl",        // Large text size
            "font-semibold",  // Semi-bold text
            "text-center",    // Centered text
            "text-yellow-500"  // Green text color
        );
        middlePad.appendChild(middleRow1);

        // Add the current frequency text to the top row
        const currentFreqText = document.createElement("span");
        currentFreqText.textContent = "Frequency: ";
        currentFreqText.classList.add(
            "transition-all",  // Smooth transition
            "ease-in-out",     // Ease-in-out timing function
            "duration-300",    // 300ms transition duration
        );
        middleRow1.appendChild(currentFreqText);

        // Add the current frequency number to the top row
        this.frequencySpan = document.createElement("span");
        this.frequencySpan.textContent = "?";
        middleRow1.appendChild(this.frequencySpan);

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

type Part2TraceItemInput = { kind: "input", antenas: Map<string, Vec2[]>, width: number, height: number };
type Part2TraceItemSelectFreq = { kind: "select-freq", antena: string };
type Part2TraceItemSelectFreqOut = { kind: "select-freq-out", antena: string };
type Part2TraceItemSelectCoords = { kind: "select-coords", coords: Vec2[] };
type Part2TraceItemSelectCoordsOut = { kind: "select-coords-out", coords: Vec2[] };
type Part2TraceItemAntinodes = { kind: "antinodes", antinodes: [string, Vec2][] };
type Part2TraceItemAntinoesOut = { kind: "antinodes-out", antinodes: [string, Vec2][] };
type Part2TraceItemTotal = { kind: "total", total: number };

type Part2TraceItem = Part2TraceItemInput | Part2TraceItemSelectFreq | Part2TraceItemSelectFreqOut | Part2TraceItemSelectCoords | Part2TraceItemSelectCoordsOut | Part2TraceItemAntinodes | Part2TraceItemAntinoesOut | Part2TraceItemTotal;

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): [Map<string, Vec2[]>, number, number] {
        const map = new Map<string, Vec2[]>();
        const lines = input.trim().split("\n");
        const height = lines.length;
        const width = lines[0].length;
        for (let row = 0; row < lines.length; row++) {
            const line = lines[row];
            for (let col = 0; col < line.length; col++) {
                const c = line[col];
                if (c === ".") {
                    continue;
                }
                if (!map.has(c)) {
                    map.set(c, []);
                }
                map.get(c)!.push({ row, col });
            }
        }

        return [map, width, height];
    }

    private combinations2(arr: Vec2[]): [Vec2, Vec2][] {
        const result: [Vec2, Vec2][] = [];
        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                result.push([arr[i], arr[j]]);
            }
        }

        return result;
    }

    private bounded(coord: Vec2, antenas: Map<string, Vec2[]>, width: number, height: number): boolean {
        const bounded = coord.row >= 0 && coord.row < height && coord.col >= 0 && coord.col < width;

        for (const [_, coords] of antenas) {
            if (coords.some(c => c.row === coord.row && c.col === coord.col)) {
                return false;
            }
        }

        return bounded;
    }

    private resonant(coord: Vec2, colDelta: number, rowDelta: number, width: number, height: number): Vec2[] {
        const result: Vec2[] = [];

        let current = coord;
        while (this.bounded(current, new Map(), width, height)) {
            result.push(current);
            current = { col: current.col + colDelta, row: current.row + rowDelta };
        }

        return result;
    }

    solve(): Trace<Part2TraceItem> {
        const trace: Trace<Part2TraceItem> = [];

        const [antenas, width, height] = this.parseInput(this.input);
        trace.push({ kind: "input", antenas, width, height });

        const colors = new Map<string, string>();
        const anitnodesMap = new Map<string, Set<Vec2>>();

        let totalAntinodes = new Set<string>();
        for (const [antena, coords] of antenas) {
            trace.push({ kind: "select-freq", antena });
            colors.set(antena, utils.randomBgColor());

            const antinodes = new Set<Vec2>();

            const combs = this.combinations2(coords);
            for (const [coord1, coord2] of combs) {
                trace.push({ kind: "select-coords", coords: [coord1, coord2] });

                const colDelta = coord1.col - coord2.col;
                const rowDelta = coord1.row - coord2.row;
                const antinodesCoords = [
                    ...this.resonant(coord1, colDelta, rowDelta, width, height),
                    ...this.resonant(coord2, -colDelta, -rowDelta, width, height),
                    coord1,
                    coord2,
                ];
                antinodesCoords.forEach(coord => antinodes.add(coord));

                trace.push({ kind: "antinodes", antinodes: Array.from(antinodes).map(coord => [colors.get(antena)!, coord]) });
                trace.push({ kind: "select-coords-out", coords: [coord1, coord2] });
            }

            totalAntinodes = new Set([...totalAntinodes, ...Array.from(antinodes).map(coord => `${coord.row},${coord.col}`)]);
            anitnodesMap.set(antena, antinodes);

            trace.push({ kind: "total", total: totalAntinodes.size });
            trace.push({ kind: "select-freq-out", antena });
        }

        const anitnodesOut: [string, Vec2][] = [];
        for (const [antena, _] of antenas) {
            anitnodesMap.get(antena)!.forEach(coord => anitnodesOut.push([antena, coord]));
        }
        trace.push({ kind: "antinodes-out", antinodes: anitnodesOut });

        return trace;
    }
}

class Part2Animator implements PartAnimator<Part2TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private frequencySpan?: HTMLSpanElement;
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
        this.frequencySpan = undefined;
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
        case "select-freq":
            return this.selectFreq(step);
        case "select-freq-out":
            return this.selectFreqOut(step);
        case "select-coords":
            return this.selectCoords(step);
        case "select-coords-out":
            return this.selectCoordsOut(step);
        case "antinodes":
            return this.antinodes(step);
        case "antinodes-out":
            return this.antinodesOut(step);
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part2TraceItemInput): number {
        for (let i = 0; i < step.height; i++) {
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
            for (let j = 0; j < step.width; j++) {
                const item = utils.createCharItem(".");
                elementsRowList.appendChild(item.item);
                elementsItems.push(item);
            }
            this.elements!.push(elementsItems);
        }

        for (const [antena, coords] of step.antenas) {
            for (const coord of coords) {
                this.elements![coord.row][coord.col].text.textContent = antena;
            }
        }

        return 1000;
    }

    private selectFreq(step: Part2TraceItemSelectFreq): number {
        this.frequencySpan!.textContent = step.antena;
        return 1000;
    }

    private selectFreqOut(step: Part2TraceItemSelectFreqOut): number {
        this.frequencySpan!.textContent = "?";
        return 1000;
    }

    private selectCoords(step: Part2TraceItemSelectCoords): number {
        for (const coord of step.coords) {
            this.elements![coord.row][coord.col].item.classList.remove("text-white");
            this.elements![coord.row][coord.col].item.classList.add("text-yellow-500");
        }

        return 1000;
    }

    private selectCoordsOut(step: Part2TraceItemSelectCoordsOut): number {
        for (const coord of step.coords) {
            this.elements![coord.row][coord.col].item.classList.remove("text-yellow-500");
            this.elements![coord.row][coord.col].item.classList.add("text-white");
        }

        return 1000;
    }

    private antinodes(step: Part2TraceItemAntinodes): number {
        for (const [color, coord] of step.antinodes) {
            if (!this.elements![coord.row][coord.col].item.classList.contains("bg-neutral-800")) {
                continue;
            }
            this.elements![coord.row][coord.col].item.classList.remove("bg-neutral-800");
            this.elements![coord.row][coord.col].item.classList.add(color);
        }

        return 1000;
    }

    private antinodesOut(step: Part2TraceItemAntinoesOut): number {
        for (const [color, coord] of step.antinodes) {
            if (!this.elements![coord.row][coord.col].item.classList.contains(color)) {
                continue;
            }
            this.elements![coord.row][coord.col].item.classList.remove(color);
            this.elements![coord.row][coord.col].item.classList.add("bg-neutral-800");
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

        // Create the top row of the middle pad
        const middleRow1 = document.createElement("ul");
        middleRow1.classList.add(
            "text-xl",        // Large text size
            "font-semibold",  // Semi-bold text
            "text-center",    // Centered text
            "text-yellow-500"  // Green text color
        );
        middlePad.appendChild(middleRow1);

        // Add the current frequency text to the top row
        const currentFreqText = document.createElement("span");
        currentFreqText.textContent = "Frequency: ";
        currentFreqText.classList.add(
            "transition-all",  // Smooth transition
            "ease-in-out",     // Ease-in-out timing function
            "duration-300",    // 300ms transition duration
        );
        middleRow1.appendChild(currentFreqText);

        // Add the current frequency number to the top row
        this.frequencySpan = document.createElement("span");
        this.frequencySpan.textContent = "?";
        middleRow1.appendChild(this.frequencySpan);

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

const DEFAULT_INPUT_PART1 = "............\n........0...\n.....0......\n.......0....\n....0.......\n......A.....\n............\n............\n........A...\n.........A..\n............\n............";
const DEFAULT_INPUT_PART2 = "............\n........0...\n.....0......\n.......0....\n....0.......\n......A.....\n............\n............\n........A...\n.........A..\n............\n............";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
