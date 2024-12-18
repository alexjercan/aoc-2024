import { PartAnimator, Solution, Trace, utils } from "./common";

type Part1TraceItemInput = { kind: "input", points: [number, number][], width: number, height: number };
type Part1TraceItemPath = { kind: "path", path: [number, number], running: number };
type Part1TraceItemAnswer = { kind: "answer", length: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemPath | Part1TraceItemAnswer;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): [[number, number][], number, number] {
        const points = input.split("\n").map((line) => {
            const [x, y] = line.split(",").map((n) => parseInt(n, 10));
            return [x, y];
        }) as [number, number][];
        const maxW = Math.max(...points.map(([x, _]) => x));
        const maxH = Math.max(...points.map(([_, y]) => y));

        const width = maxW < 7 ? 7 : 71;
        const height = maxH < 7 ? 7 : 71;

        return [points, width, height];
    }

    private hashPoint(p: [number, number]): string {
        return `${p[0]},${p[1]}`;
    }

    private unhashPoint(s: string): [number, number] {
        const [x, y] = s.split(",").map((n) => parseInt(n, 10));
        return [x, y];
    }

    private manhattanDistance(p1: [number, number], p2: [number, number]): number {
        return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
    }

    private reconstructPath(cameFrom: Map<string, string>, current: string): string[] {
        const totalPath = [current];
        while (cameFrom.has(current)) {
            current = cameFrom.get(current) || "";
            totalPath.push(current);
        }

        return totalPath.reverse();
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const [points, width, height] = this.parseInput(this.input);
        const numPoints = points.length < 1024 ? 12 : 1024;
        const choosePoints = points.slice(0, numPoints);
        trace.push({ kind: "input", points: choosePoints, width, height });

        const start = [0, 0] as [number, number];
        const end = [width - 1, height - 1] as [number, number];

        const openSet = new Set<string>();
        openSet.add(this.hashPoint(start));

        const gScore = new Map<string, number>();
        gScore.set(this.hashPoint(start), 0);

        const fScore = new Map<string, number>();
        fScore.set(this.hashPoint(start), this.manhattanDistance(start, end));

        const cameFrom = new Map<string, string>();

        let path: string[] = [];
        while (openSet.size > 0) {
            let current: [number, number] = [0, 0];
            let currentF = Number.MAX_SAFE_INTEGER;
            for (const p of openSet) {
                const f = fScore.get(p) ?? Number.MAX_SAFE_INTEGER;
                if (f < currentF) {
                    current = this.unhashPoint(p);
                    currentF = f;
                }
            }

            if (current[0] === end[0] && current[1] === end[1]) {
                path = this.reconstructPath(cameFrom, this.hashPoint(end));
                break;
            }

            openSet.delete(this.hashPoint(current));
            for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                const neighbor: [number, number] = [current[0] + dx, current[1] + dy];
                if (neighbor[0] < 0 || neighbor[0] >= width || neighbor[1] < 0 || neighbor[1] >= height) {
                    continue;
                }

                if (choosePoints.some((p) => p[0] === neighbor[0] && p[1] === neighbor[1])) {
                    continue;
                }

                const gScoreCurrent = gScore.get(this.hashPoint(current)) ?? Number.MAX_SAFE_INTEGER;
                const gScoreNeighbor = gScore.get(this.hashPoint(neighbor)) ?? Number.MAX_SAFE_INTEGER;
                const tentativeGScore = gScoreCurrent + 1;
                if (tentativeGScore < gScoreNeighbor) {
                    cameFrom.set(this.hashPoint(neighbor), this.hashPoint(current));
                    gScore.set(this.hashPoint(neighbor), tentativeGScore);
                    fScore.set(this.hashPoint(neighbor), tentativeGScore + this.manhattanDistance(neighbor, end));
                    openSet.add(this.hashPoint(neighbor));
                }
            }
        }

        for (let i = 0; i < path.length; i++) {
            trace.push({ kind: "path", path: this.unhashPoint(path[i]), running: i });
        }

        trace.push({ kind: "answer", length: path.length - 1 });

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
        case "path":
            return this.path(step);
        case "answer":
            return this.answer(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        const points = step.points;
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
                const value = points.some(([x, y]) => x === col && y === row) ? "#" : ".";

                const element = utils.createCharItem(value);
                element.item.classList.add(
                    "flex",
                    "flex-row",
                    "justify-center", // Center items vertically
                    "w-8", // Fixed width
                    "h-8", // Fixed height
                    "m-1" // Add margin to the item
                );
                mapRowList.appendChild(element.item);
                rowItems.push(element);
            }
            this.tiles!.push(rowItems);
        }

        return 1000;
    }

    private path(step: Part1TraceItemPath): number {
        const [x, y] = step.path;
        const running = step.running;

        const item = this.tiles![y][x];
        item.item.classList.remove("bg-neutral-800");
        item.item.classList.add("bg-yellow-500");
        item.text.textContent = running.toString();

        return 1000;
    }

    private answer(step: Part1TraceItemAnswer): number {
        this.answerNumber!.textContent = step.length.toString();

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

type Part2TraceItemInput = { kind: "input", points: [number, number][], width: number, height: number };
type Part2TraceItemBlock = { kind: "block", block: [number, number][] };
type Part2TraceItemBlockOut = { kind: "block-out", block: [number, number][] };
type Part2TraceItemPath = { kind: "path", path: [number, number][] };
type Part2TraceItemPathOut = { kind: "path-out", path: [number, number][] };
type Part2TraceItemAnswer = { kind: "answer", length: string };

type Part2TraceItem = Part2TraceItemInput | Part2TraceItemBlock | Part2TraceItemBlockOut | Part2TraceItemPath | Part2TraceItemPathOut | Part2TraceItemAnswer;

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): [[number, number][], number, number] {
        const points = input.split("\n").map((line) => {
            const [x, y] = line.split(",").map((n) => parseInt(n, 10));
            return [x, y];
        }) as [number, number][];
        const maxW = Math.max(...points.map(([x, _]) => x));
        const maxH = Math.max(...points.map(([_, y]) => y));

        const width = maxW < 7 ? 7 : 71;
        const height = maxH < 7 ? 7 : 71;

        return [points, width, height];
    }

    private hashPoint(p: [number, number]): string {
        return `${p[0]},${p[1]}`;
    }

    private unhashPoint(s: string): [number, number] {
        const [x, y] = s.split(",").map((n) => parseInt(n, 10));
        return [x, y];
    }

    private manhattanDistance(p1: [number, number], p2: [number, number]): number {
        return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
    }

    private reconstructPath(cameFrom: Map<string, string>, current: string): string[] {
        const totalPath = [current];
        while (cameFrom.has(current)) {
            current = cameFrom.get(current) || "";
            totalPath.push(current);
        }

        return totalPath.reverse();
    }

    solve(): Trace<Part2TraceItem> {
        /*
  counter = testacles.length / 2
  half = counter
  while true do
    newObstacles = obstacles.map(&:clone)
    newObstacles.push(*testacles.take(counter))

    path = astar(newObstacles, start, target, width, height)
    if path != nil then
      newObstacles = obstacles.map(&:clone)
      newObstacles.push(*testacles.take(counter + 1))
      if astar(newObstacles, start, target, width, height) == nil then
        return testacles[counter]
      end

      counter = counter + half / 2
      half = half / 2
    else
      counter = counter - half / 2
      half = half / 2
    end
  end

  return nil
  */
        const trace: Trace<Part2TraceItem> = [];
        const [points, width, height] = this.parseInput(this.input);
        const numPoints = points.length < 1024 ? 12 : 1024;

        const obstacles = points.slice(0, numPoints);
        const testacles = points.slice(numPoints, points.length);
        trace.push({ kind: "input", points: obstacles, width, height });

        let counter = Math.floor(testacles.length / 2);
        let half = counter;
        while (true) {
            const newObstacles = obstacles.slice();
            newObstacles.push(...testacles.slice(0, counter));

            const ogTestacles = testacles.slice(0, counter);
            trace.push({ kind: "block", block: ogTestacles });

            const path = this.astar(newObstacles, width, height);
            if (path.length > 0) {
                const newObstacles2 = obstacles.slice();
                newObstacles2.push(...testacles.slice(0, counter + 1));
                trace.push({ kind: "block", block: testacles.slice(counter, counter + 1) });

                if (this.astar(newObstacles2, width, height).length === 0) {
                    trace.push({ kind: "answer", length: `${points[numPoints + counter][0]},${points[numPoints + counter][1]}` });
                    trace.push({ kind: "block-out", block: [...ogTestacles, points[numPoints + counter] ] });
                    break;
                }

                trace.push({ kind: "path", path });
                trace.push({ kind: "path-out", path });

                trace.push({ kind: "block-out", block: testacles.slice(counter, counter + 1) });

                counter = counter + Math.floor(half / 2);
                half = Math.floor(half / 2);
            } else {
                counter = counter - Math.floor(half / 2);
                half = Math.floor(half / 2);
            }

            trace.push({ kind: "block-out", block: ogTestacles });
        }

        return trace;
    }

    private astar(choosePoints: [number, number][], width: number, height: number): [number, number][] {
        const start = [0, 0] as [number, number];
        const end = [width - 1, height - 1] as [number, number];

        const openSet = new Set<string>();
        openSet.add(this.hashPoint(start));

        const gScore = new Map<string, number>();
        gScore.set(this.hashPoint(start), 0);

        const fScore = new Map<string, number>();
        fScore.set(this.hashPoint(start), this.manhattanDistance(start, end));

        const cameFrom = new Map<string, string>();

        let path: string[] = [];
        while (openSet.size > 0) {
            let current: [number, number] = [0, 0];
            let currentF = Number.MAX_SAFE_INTEGER;
            for (const p of openSet) {
                const f = fScore.get(p) ?? Number.MAX_SAFE_INTEGER;
                if (f < currentF) {
                    current = this.unhashPoint(p);
                    currentF = f;
                }
            }

            if (current[0] === end[0] && current[1] === end[1]) {
                path = this.reconstructPath(cameFrom, this.hashPoint(end));
                break;
            }

            openSet.delete(this.hashPoint(current));
            for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                const neighbor: [number, number] = [current[0] + dx, current[1] + dy];
                if (neighbor[0] < 0 || neighbor[0] >= width || neighbor[1] < 0 || neighbor[1] >= height) {
                    continue;
                }

                if (choosePoints.some((p) => p[0] === neighbor[0] && p[1] === neighbor[1])) {
                    continue;
                }

                const gScoreCurrent = gScore.get(this.hashPoint(current)) ?? Number.MAX_SAFE_INTEGER;
                const gScoreNeighbor = gScore.get(this.hashPoint(neighbor)) ?? Number.MAX_SAFE_INTEGER;
                const tentativeGScore = gScoreCurrent + 1;
                if (tentativeGScore < gScoreNeighbor) {
                    cameFrom.set(this.hashPoint(neighbor), this.hashPoint(current));
                    gScore.set(this.hashPoint(neighbor), tentativeGScore);
                    fScore.set(this.hashPoint(neighbor), tentativeGScore + this.manhattanDistance(neighbor, end));
                    openSet.add(this.hashPoint(neighbor));
                }
            }
        }

        return path.map((p) => this.unhashPoint(p));
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
        case "block":
            return this.block(step);
        case "block-out":
            return this.blockOut(step);
        case "path":
            return this.path(step);
        case "path-out":
            return this.pathOut(step);
        case "answer":
            return this.answer(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part2TraceItem).kind}`);
        }
    }

    private createInput(step: Part2TraceItemInput): number {
        const points = step.points;
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
                const value = points.some(([x, y]) => x === col && y === row) ? "#" : ".";

                const element = utils.createCharItem(value);
                element.item.classList.add(
                    "flex",
                    "flex-row",
                    "justify-center", // Center items vertically
                    "w-8", // Fixed width
                    "h-8", // Fixed height
                    "m-1" // Add margin to the item
                );
                mapRowList.appendChild(element.item);
                rowItems.push(element);
            }
            this.tiles!.push(rowItems);
        }

        return 1000;
    }

    private block(step: Part2TraceItemBlock): number {
        for (const [x, y] of step.block) {
            const item = this.tiles![y][x];
            item.item.classList.remove("bg-neutral-800");
            item.item.classList.add("bg-red-500");
            item.text.textContent = "#";
        }

        return 1000;
    }

    private blockOut(step: Part2TraceItemBlockOut): number {
        for (const [x, y] of step.block) {
            const item = this.tiles![y][x];
            item.item.classList.remove("bg-red-500");
            item.item.classList.add("bg-neutral-800");
            item.text.textContent = ".";
        }

        return 1000;
    }

    private path(step: Part2TraceItemPath): number {
        for (let i = 0; i < step.path.length; i++) {
            const [x, y] = step.path[i];
            const item = this.tiles![y][x];
            item.item.classList.remove("bg-neutral-800");
            item.item.classList.add("bg-yellow-500");
        }

        return 1000;
    }

    private pathOut(step: Part2TraceItemPathOut): number {
        for (const [x, y] of step.path) {
            const item = this.tiles![y][x];
            item.item.classList.remove("bg-yellow-500");
            item.item.classList.add("bg-neutral-800");
        }

        return 1000;
    }

    private answer(step: Part2TraceItemAnswer): number {
        this.answerNumber!.textContent = step.length.toString();

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

const DEFAULT_INPUT_PART1 = "5,4\n4,2\n4,5\n3,0\n2,1\n6,3\n2,4\n1,5\n0,6\n3,3\n2,6\n5,1\n1,2\n5,5\n2,5\n6,5\n1,4\n0,4\n6,4\n1,1\n6,1\n1,0\n0,5\n1,6\n2,0";
const DEFAULT_INPUT_PART2 = "5,4\n4,2\n4,5\n3,0\n2,1\n6,3\n2,4\n1,5\n0,6\n3,3\n2,6\n5,1\n1,2\n5,5\n2,5\n6,5\n1,4\n0,4\n6,4\n1,1\n6,1\n1,0\n0,5\n1,6\n2,0";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
