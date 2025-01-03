import { PartAnimator, Solution, Trace, utils } from "./common";

function popMinCost(Q: [number, Vec2][]): [number, Vec2] {
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

function weightedNeighbors(point: Vec2): [Vec2, number][] {
    const ns: [Vec2, number][] = [];
    for (const nd of DIRECTIONS) {
        ns.push([ addVec2(point, nd), 1 ]);
    }

    return ns;
}

const DIRECTIONS: Vec2[] = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
];

function vec2ToString(point: Vec2): string {
    return `${point.row},${point.col}`;
}

function stringToVec2(key: string): Vec2 {
    const [row, col] = key.split(",").map(Number);
    return { row, col };
}

type Part1TraceItemInput = { kind: "input", freeSpaces: Vec2[], start: Vec2, end: Vec2, width: number, height: number };
type Part1TraceItemSelect = { kind: "select", path: Vec2[], start: Vec2, end: Vec2 };
type Part1TraceItemSelectJump = { kind: "select-jump", jumpIn: Vec2, jumpOut: Vec2 };
type Part1TraceItemSelectJumpOut = { kind: "select-jump-out", jumpIn: Vec2, jumpOut: Vec2 };
type Part1TraceItemSelectOut = { kind: "select-out", path: Vec2[], start: Vec2, end: Vec2 };
type Part1TraceItemTotal = { kind: "total", result: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemTotal | Part1TraceItemSelect | Part1TraceItemSelectJump | Part1TraceItemSelectOut | Part1TraceItemSelectJumpOut;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;
    protected jumpSize: number;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
        this.jumpSize = 2;
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

    private reconstructPaths2(prevs: Map<string, string[]>, end: Vec2, path: Vec2[]): Vec2[][] {
        const key = vec2ToString(end);
        if (!prevs.has(key)) {
            return [[...path]];
        }

        const paths: Vec2[][] = [];
        for (const prev of prevs.get(key) as string[]) {
            const point = stringToVec2(prev);
            paths.push(...this.reconstructPaths2(prevs, point, [...path, point]));
        }

        return paths;
    }

    private reconstructPaths(prevs: Map<string, string[]>, end: Vec2): Vec2[][] {
        return this.reconstructPaths2(prevs, end, [end]);
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const [freeSpaces, start, end, width, height] = this.parseInput(this.input);
        trace.push({ kind: "input", freeSpaces, start, end, width, height });

        const saveLimit = width > 10 ? 10 : 100;

        const isBounded = (n: [Vec2, number]) => {
            const [point, _cost] = n;
            return point.row >= 0 && point.row < height && point.col >= 0 && point.col < width;
        };

        const isEmpty = (n: [Vec2, number]) => {
            const [point, _cost] = n;
            return freeSpaces.some(p => p.row === point.row && p.col === point.col);
        };

        const puzzle = new Map<string, [Vec2, number][]>();
        for (const point of freeSpaces) {
            const ns = weightedNeighbors(point);
            const boundedNs = ns.filter(isBounded);
            const emptyNs = boundedNs.filter(isEmpty);
            puzzle.set(vec2ToString(point), emptyNs);
        }

        const dist = new Map<string, number>();
        const prevs = new Map<string, string[]>();
        const Q: [number, Vec2][] = [[0, start]];

        while (Q.length > 0) {
            const [c, u] = popMinCost(Q);
            const key = vec2ToString(u);
            if (dist.has(key)) {
                continue;
            }

            dist.set(key, c);
            for (const [v, weight] of puzzle.get(key) as [Vec2, number][]) {
                const vKey = vec2ToString(v);

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

        const paths: Vec2[][] = [];
        paths.push(...this.reconstructPaths(prevs, end));

        // For part1 we care about the first path anyway
        const path = paths[0].reverse();
        trace.push({ kind: "select", path , start, end });

        let total = 0;
        for (const [point1, cost1] of dist) {
            for (const [point2, cost2] of dist) {
                if (point1 === point2) {
                    continue;
                }

                const p1 = stringToVec2(point1);
                const p2 = stringToVec2(point2);
                const steps = Math.abs(p1.row - p2.row) + Math.abs(p1.col - p2.col);
                const saved = cost2 - cost1 - steps;
                if (steps <= this.jumpSize && saved >= saveLimit) {
                    total = total + 1;
                    trace.push({ kind: "select-jump", jumpIn: p1, jumpOut: p2 });
                    trace.push({ kind: "total", result: total });
                    trace.push({ kind: "select-jump-out", jumpIn: p1, jumpOut: p2 });
                }
            }
        }

        trace.push({ kind: "select-out", path, start, end });

        trace.push({ kind: "total", result: total });

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
        case "select-jump":
            return this.selectJump(step);
        case "select-jump-out":
            return this.selectJumpOut(step);
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
        const { path, start, end } = step;

        for (let i = 0; i < path.length; i++) {
            const point = path[i];
            const item = this.tiles![point.row][point.col];
            item.item.classList.remove("bg-neutral-800");
            item.item.classList.add("bg-yellow-500");
            item.text.textContent = i === 0 ? "S" : i === path.length - 1 ? "E" : "O";
        }

        return 1000;
    }

    private selectOut(step: Part1TraceItemSelectOut): number {
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

    private total(step: Part1TraceItemTotal): number {
        this.answerNumber!.textContent = step.result.toString();
        return 1000;
    }

    private selectJump(step: Part1TraceItemSelectJump): number {
        const { jumpIn, jumpOut } = step;

        const jumpInItem = this.tiles![jumpIn.row][jumpIn.col];
        jumpInItem.item.classList.remove("bg-yellow-500");
        jumpInItem.item.classList.add("bg-red-500");

        const jumpOutItem = this.tiles![jumpOut.row][jumpOut.col];
        jumpOutItem.item.classList.remove("bg-yellow-500");
        jumpOutItem.item.classList.add("bg-red-500");

        return 1000;
    }

    private selectJumpOut(step: Part1TraceItemSelectJumpOut): number {
        const { jumpIn, jumpOut } = step;

        const jumpInItem = this.tiles![jumpIn.row][jumpIn.col];
        jumpInItem.item.classList.remove("bg-red-500");
        jumpInItem.item.classList.add("bg-yellow-500");

        const jumpOutItem = this.tiles![jumpOut.row][jumpOut.col];
        jumpOutItem.item.classList.remove("bg-red-500");
        jumpOutItem.item.classList.add("bg-yellow-500");

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

class Part2Solution extends Part1Solution {
    constructor(input: string) {
        super(input);
        this.jumpSize = 20;
    }
}

class Part2Animator extends Part1Animator { }

const DESCRIPTION_PART1 = [
    utils.createParagraph("TODO"),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("TODO"),
];

const DEFAULT_INPUT_PART1 ="###############\n#...#...#.....#\n#.#.#.#.#.###.#\n#S#...#.#.#...#\n#######.#.#.###\n#######.#.#...#\n#######.#.###.#\n###..E#...#...#\n###.#######.###\n#...###...#...#\n#.#####.#.###.#\n#.#...#.#.#...#\n#.#.#.#.#.#.###\n#...#...#...###\n###############";
const DEFAULT_INPUT_PART2 ="###############\n#...#...#.....#\n#.#.#.#.#.###.#\n#S#...#.#.#...#\n#######.#.#.###\n#######.#.#...#\n#######.#.###.#\n###..E#...#...#\n###.#######.###\n#...###...#...#\n#.#####.#.###.#\n#.#...#.#.#...#\n#.#.#.#.#.#.###\n#...#...#...###\n###############";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
