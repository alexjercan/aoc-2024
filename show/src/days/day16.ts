import { PartAnimator, Solution, Trace, utils } from "./common";

function popMinCost(Q: [number, [Vec2, Vec2]][]): [number, [Vec2, Vec2]] {
    let minIndex = 0;
    let minCost = Q[0][0];
    for (let i = 1; i < Q.length; i++) {
        if (Q[i][0] < minCost) {
            minCost = Q[i][0];
            minIndex = i;
        }
    }

    const min = Q[minIndex];
    Q.splice(minIndex, 1);
    return min;
}

type Vec2 = {
    row: number;
    col: number;
};

function addVec2(a: Vec2, b: Vec2): Vec2 {
    return { row: a.row + b.row, col: a.col + b.col };
}

function weightedNeighbors(point: Vec2, d: Vec2): [[Vec2, Vec2], number][] {
    const ns: [[Vec2, Vec2], number][] = [];
    for (const nd of DIRECTIONS) {
        if (d.row === nd.row && d.col === nd.col) {
            ns.push([ [addVec2(point, nd), d], 1 ]);
        } else if (-d.row === nd.row && -d.col === nd.col) {
            continue;
        } else {
            ns.push([ [point, nd], 1000 ]);
        }
    }

    return ns;
}

const DIRECTIONS: Vec2[] = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
];

function dirToString(d: Vec2): string {
    if (d.row === -1 && d.col === 0) {
        return "^";
    }
    if (d.row === 0 && d.col === 1) {
        return ">";
    }
    if (d.row === 1 && d.col === 0) {
        return "v";
    }
    if (d.row === 0 && d.col === -1) {
        return "<";
    }

    throw new Error("Invalid direction");
}

function vec2DirToString(key: [Vec2, Vec2]): string {
    const [point, d] = key;
    return `${point.row},${point.col},${d.row},${d.col}`;
}

function stringToVec2Dir(key: string): [Vec2, Vec2] {
    const [row, col, dRow, dCol] = key.split(",").map(Number);
    return [{ row, col }, { row: dRow, col: dCol }];
}

type Part1TraceItemInput = { kind: "input", freeSpaces: Vec2[], start: Vec2, end: Vec2, width: number, height: number };
type Part1TraceItemSelect = { kind: "select", point: Vec2, dir: Vec2, runningCost: number };
type Part1TraceItemSelectOut = { kind: "select-out", path: [Vec2, Vec2][], start: Vec2, end: Vec2 };
type Part1TraceItemTotal = { kind: "total", result: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemTotal | Part1TraceItemSelect | Part1TraceItemSelectOut;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): [Vec2[], Vec2, Vec2, number, number] {
        const lines = input.trim().split("\n");
        const height = lines.length;
        const width = lines[0].length;

        const freeSpaces: Vec2[] = [];
        let start: Vec2 | null = null;
        let end: Vec2 | null = null;

        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const point = { row, col };
                const ch = lines[row][col];

                if (ch === ".") {
                    freeSpaces.push(point);
                }

                if (ch === "S") {
                    start = point;
                    freeSpaces.push(point);
                }

                if (ch === "E") {
                    end = point;
                    freeSpaces.push(point);
                }
            }
        }

        if (start === null || end === null) {
            throw new Error("Start or end not found");
        }

        return [freeSpaces, start, end, width, height];
    }

    private reconstructPaths2(prevs: Map<string, string[]>, end: [Vec2, Vec2], path: [Vec2, Vec2][]): [Vec2, Vec2][][] {
        const key = vec2DirToString(end);
        if (!prevs.has(key)) {
            return [[...path]];
        }

        const paths: [Vec2, Vec2][][] = [];
        for (const prev of prevs.get(key) as string[]) {
            const [point, d] = stringToVec2Dir(prev);
            paths.push(...this.reconstructPaths2(prevs, [point, d], [...path, [point, d]]));
        }

        return paths;
    }

    private reconstructPaths(prevs: Map<string, string[]>, end: [Vec2, Vec2]): [Vec2, Vec2][][] {
        return this.reconstructPaths2(prevs, end, [end]);
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const [freeSpaces, start, end, width, height] = this.parseInput(this.input);
        trace.push({ kind: "input", freeSpaces, start, end, width, height });

        const isBounded = (n: [[Vec2, Vec2], number]) => {
            const [[point, _dir], _cost] = n;
            return point.row >= 0 && point.row < height && point.col >= 0 && point.col < width;
        };

        const isEmpty = (n: [[Vec2, Vec2], number]) => {
            const [[point, _dir], _cost] = n;
            return freeSpaces.some(p => p.row === point.row && p.col === point.col);
        };

        const puzzle = new Map<string, [[Vec2, Vec2], number][]>();
        for (const point of freeSpaces) {
            for (const d of DIRECTIONS) {
                const ns = weightedNeighbors(point, d);
                const boundedNs = ns.filter(isBounded);
                const emptyNs = boundedNs.filter(isEmpty);
                puzzle.set(vec2DirToString([point, d]), emptyNs);
            }
        }

        const dist = new Map<string, number>();
        const prevs = new Map<string, string[]>();
        const Q: [number, [Vec2, Vec2]][] = [[0, [start, DIRECTIONS[1]]]];

        while (Q.length > 0) {
            const [c, u] = popMinCost(Q);
            const key = vec2DirToString(u);
            if (dist.has(key)) {
                continue;
            }

            dist.set(key, c);
            for (const [v, weight] of puzzle.get(key) as [[Vec2, Vec2], number][]) {
                const vKey = vec2DirToString(v);

                if (dist.has(vKey) && c + weight == dist.get(vKey)) {
                    if (!prevs.has(vKey)) {
                        prevs.set(vKey, []);
                    }

                    prevs.get(vKey)?.push(key);
                }

                if (!dist.has(vKey)) {
                    if (!prevs.has(vKey)) {
                        prevs.set(vKey, []);
                    }

                    prevs.get(vKey)?.push(key);

                    Q.push([c + weight, v]);
                }
            }
        }

        const result = Math.min(...DIRECTIONS.map(d => dist.get(vec2DirToString([end, d])) as number));
        const paths: [Vec2, Vec2][][] = [];
        for (const d of DIRECTIONS) {
            if (result === dist.get(vec2DirToString([end, d])) as number) {
                paths.push(...this.reconstructPaths(prevs, [end, d]));
            }
        }

        // For part1 we care about the first path anyway
        const path = paths[0].reverse();
        for (let i = 0; i < path.length; i++) {
            const partialResult = dist.get(vec2DirToString(path[i]));
            trace.push({ kind: "select", point: path[i][0], dir: path[i][1], runningCost: partialResult as number });
        }
        trace.push({ kind: "select-out", path, start, end });

        trace.push({ kind: "total", result });

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
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

        this.answerNumber = undefined;
        this.mapColumn = undefined;
        this.tiles = undefined;
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
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        const freeSpaces = step.freeSpaces;
        const start = step.start;
        const end = step.end;
        const width = step.width;
        const height = step.height;

        for (let row = 0; row < height; row++) {
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

            const rowItems = [];
            for (let col = 0; col < width; col++) {
                let value: string;

                if (start.row === row && start.col === col) {
                    value = "S";
                } else if (end.row === row && end.col === col) {
                    value = "E";
                } else if (freeSpaces.some(p => p.row === row && p.col === col)) {
                    value = ".";
                } else {
                    value = "#";
                }

                const element = utils.createCharItem(value);
                mapRowList.appendChild(element.item);
                rowItems.push(element);
            }
            this.tiles!.push(rowItems);
        }

        return 1000;
    }

    private select(step: Part1TraceItemSelect): number {
        const { point, dir, runningCost } = step;

        const item = this.tiles![point.row][point.col];
        item.item.classList.remove("bg-neutral-800");
        item.item.classList.add("bg-yellow-500");
        item.text.textContent = dirToString(dir);

        this.answerNumber!.textContent = runningCost.toString();

        return 1000;
    }

    private selectOut(step: Part1TraceItemSelectOut): number {
        const path = step.path;
        const start = step.start;
        const end = step.end;

        for (let i = 0; i < path.length; i++) {
            const [point, _dir] = path[i];
            const item = this.tiles![point.row][point.col];
            item.item.classList.remove("bg-yellow-500");
            item.item.classList.add("bg-neutral-800");
            item.text.textContent = ".";
        }

        const startItem = this.tiles![start.row][start.col];
        startItem.text.textContent = "S";

        const endItem = this.tiles![end.row][end.col];
        endItem.text.textContent = "E";

        return 1000;
    }

    private total(step: Part1TraceItemTotal): number {
        this.answerNumber!.textContent = step.result.toString();
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
            "max-w-full",      // Full width
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

type Part2TraceItemInput = { kind: "input", freeSpaces: Vec2[], start: Vec2, end: Vec2, width: number, height: number };
type Part2TraceItemSelect = { kind: "select", point: Vec2, runningCount: number };
type Part2TraceItemSelectOut = { kind: "select-out", path: Vec2[], start: Vec2, end: Vec2 };
type Part2TraceItemTotal = { kind: "total", result: number };

type Part2TraceItem = Part2TraceItemInput | Part2TraceItemTotal | Part2TraceItemSelect | Part2TraceItemSelectOut;

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): [Vec2[], Vec2, Vec2, number, number] {
        const lines = input.trim().split("\n");
        const height = lines.length;
        const width = lines[0].length;

        const freeSpaces: Vec2[] = [];
        let start: Vec2 | null = null;
        let end: Vec2 | null = null;

        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const point = { row, col };
                const ch = lines[row][col];

                if (ch === ".") {
                    freeSpaces.push(point);
                }

                if (ch === "S") {
                    start = point;
                    freeSpaces.push(point);
                }

                if (ch === "E") {
                    end = point;
                    freeSpaces.push(point);
                }
            }
        }

        if (start === null || end === null) {
            throw new Error("Start or end not found");
        }

        return [freeSpaces, start, end, width, height];
    }

    private reconstructPaths2(prevs: Map<string, string[]>, end: [Vec2, Vec2], path: [Vec2, Vec2][]): [Vec2, Vec2][][] {
        const key = vec2DirToString(end);
        if (!prevs.has(key)) {
            return [[...path]];
        }

        const paths: [Vec2, Vec2][][] = [];
        for (const prev of prevs.get(key) as string[]) {
            const [point, d] = stringToVec2Dir(prev);
            paths.push(...this.reconstructPaths2(prevs, [point, d], [...path, [point, d]]));
        }

        return paths;
    }

    private reconstructPaths(prevs: Map<string, string[]>, end: [Vec2, Vec2]): [Vec2, Vec2][][] {
        return this.reconstructPaths2(prevs, end, [end]);
    }

    solve(): Trace<Part2TraceItem> {
        const trace: Trace<Part2TraceItem> = [];

        const [freeSpaces, start, end, width, height] = this.parseInput(this.input);
        trace.push({ kind: "input", freeSpaces, start, end, width, height });

        const isBounded = (n: [[Vec2, Vec2], number]) => {
            const [[point, _dir], _cost] = n;
            return point.row >= 0 && point.row < height && point.col >= 0 && point.col < width;
        };

        const isEmpty = (n: [[Vec2, Vec2], number]) => {
            const [[point, _dir], _cost] = n;
            return freeSpaces.some(p => p.row === point.row && p.col === point.col);
        };

        const puzzle = new Map<string, [[Vec2, Vec2], number][]>();
        for (const point of freeSpaces) {
            for (const d of DIRECTIONS) {
                const ns = weightedNeighbors(point, d);
                const boundedNs = ns.filter(isBounded);
                const emptyNs = boundedNs.filter(isEmpty);
                puzzle.set(vec2DirToString([point, d]), emptyNs);
            }
        }

        const dist = new Map<string, number>();
        const prevs = new Map<string, string[]>();
        const Q: [number, [Vec2, Vec2]][] = [[0, [start, DIRECTIONS[1]]]];

        while (Q.length > 0) {
            const [c, u] = popMinCost(Q);
            const key = vec2DirToString(u);
            if (dist.has(key)) {
                continue;
            }

            dist.set(key, c);
            for (const [v, weight] of puzzle.get(key) as [[Vec2, Vec2], number][]) {
                const vKey = vec2DirToString(v);

                if (dist.has(vKey) && c + weight == dist.get(vKey)) {
                    if (!prevs.has(vKey)) {
                        prevs.set(vKey, []);
                    }

                    prevs.get(vKey)?.push(key);
                }

                if (!dist.has(vKey)) {
                    if (!prevs.has(vKey)) {
                        prevs.set(vKey, []);
                    }

                    prevs.get(vKey)?.push(key);

                    Q.push([c + weight, v]);
                }
            }
        }

        const result = Math.min(...DIRECTIONS.map(d => dist.get(vec2DirToString([end, d])) as number));
        const paths: [Vec2, Vec2][][] = [];
        for (const d of DIRECTIONS) {
            if (result === dist.get(vec2DirToString([end, d])) as number) {
                paths.push(...this.reconstructPaths(prevs, [end, d]));
            }
        }

        const visited = new Set<string>();
        for (const path of paths) {
            for (const [point, _dir] of path.reverse()) {
                visited.add(`${point.row},${point.col}`);
            }
        }
        const points = Array.from(visited).map(p => p.split(",").map(Number)).map(([row, col]) => ({ row, col }));
        let count = 0;
        for (const point of points) {
            trace.push({ kind: "select", point, runningCount: count });
            count++;
        }
        trace.push({ kind: "select-out", path: points, start, end });

        trace.push({ kind: "total", result: count });

        return trace;
    }
}

class Part2Animator implements PartAnimator<Part2TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
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

        this.answerNumber = undefined;
        this.mapColumn = undefined;
        this.tiles = undefined;
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
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part2TraceItemInput): number {
        const freeSpaces = step.freeSpaces;
        const start = step.start;
        const end = step.end;
        const width = step.width;
        const height = step.height;

        for (let row = 0; row < height; row++) {
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

            const rowItems = [];
            for (let col = 0; col < width; col++) {
                let value: string;

                if (start.row === row && start.col === col) {
                    value = "S";
                } else if (end.row === row && end.col === col) {
                    value = "E";
                } else if (freeSpaces.some(p => p.row === row && p.col === col)) {
                    value = ".";
                } else {
                    value = "#";
                }

                const element = utils.createCharItem(value);
                mapRowList.appendChild(element.item);
                rowItems.push(element);
            }
            this.tiles!.push(rowItems);
        }

        return 1000;
    }

    private select(step: Part2TraceItemSelect): number {
        const { point, runningCount } = step;

        const item = this.tiles![point.row][point.col];
        item.item.classList.remove("bg-neutral-800");
        item.item.classList.add("bg-yellow-500");
        item.text.textContent = "O";

        this.answerNumber!.textContent = runningCount.toString();

        return 1000;
    }

    private selectOut(step: Part2TraceItemSelectOut): number {
        const path = step.path;
        const start = step.start;
        const end = step.end;

        for (let i = 0; i < path.length; i++) {
            const point = path[i];
            const item = this.tiles![point.row][point.col];
            item.item.classList.remove("bg-yellow-500");
            item.item.classList.add("bg-neutral-800");
            item.text.textContent = ".";
        }

        const startItem = this.tiles![start.row][start.col];
        startItem.text.textContent = "S";

        const endItem = this.tiles![end.row][end.col];
        endItem.text.textContent = "E";

        return 1000;
    }

    private total(step: Part2TraceItemTotal): number {
        this.answerNumber!.textContent = step.result.toString();
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
            "max-w-full",      // Full width
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

const DEFAULT_INPUT_PART1 = "###############\n#.......#....E#\n#.#.###.#.###.#\n#.....#.#...#.#\n#.###.#####.#.#\n#.#.#.......#.#\n#.#.#####.###.#\n#...........#.#\n###.#.#####.#.#\n#...#.....#.#.#\n#.#.#.###.#.#.#\n#.....#...#.#.#\n#.###.#.#.#.#.#\n#S..#.....#...#\n###############";
const DEFAULT_INPUT_PART2 = "###############\n#.......#....E#\n#.#.###.#.###.#\n#.....#.#...#.#\n#.###.#####.#.#\n#.#.#.......#.#\n#.#.#####.###.#\n#...........#.#\n###.#.#####.#.#\n#...#.....#.#.#\n#.#.#.###.#.#.#\n#.....#...#.#.#\n#.###.#.#.#.#.#\n#S..#.....#...#\n###############";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
