import { PartAnimator, Solution, Trace, utils } from "./common";

enum Facing {
    NORTH = "^",
    SOUTH = "v",
    EAST = ">",
    WEST = "<",
}

enum Tile {
    EMPTY = ".",
    WALL = "#",
}

type Vec2 = {
    row: number,
    col: number,
}

type Guard = {
    pos: Vec2,
    facing: Facing,
}

type Part1TraceItemInput = { kind: "input", map: Tile[][], guard: Guard };
type Part1TraceItemCheck = { kind: "check", pos: Vec2 };
type Part1TraceItemCheckResult = { kind: "check-result", pos: Vec2, result: boolean };
type Part1TraceItemCheckOut = { kind: "check-out", pos: Vec2 };
type Part1TraceItemMoveTo = { kind: "move-to", from: Vec2, to: Vec2, facing: Facing };
type Part1TraceItemTurn = { kind: "turn", pos: Vec2, facing: Facing };
type Part1TraceItemVisit = { kind: "visit", pos: Vec2 };
type Part1TraceItemTotal = { kind: "total", steps: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemCheck | Part1TraceItemCheckResult | Part1TraceItemCheckOut | Part1TraceItemMoveTo | Part1TraceItemTurn | Part1TraceItemVisit | Part1TraceItemTotal;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    private parseInput(input: string): [Tile[][], Guard] {
        const lines = input.trim().split("\n");
        const map: Tile[][] = [];
        let guard: Guard | null = null;

        for (let row = 0; row < lines.length; row++) {
            const line = lines[row];
            const mapRow: Tile[] = [];

            for (let col = 0; col < line.length; col++) {
                const c = line[col];
                if (c === Facing.NORTH || c === Facing.SOUTH || c === Facing.EAST || c === Facing.WEST) {
                    guard = { pos: { row, col }, facing: c as Facing };
                    mapRow.push(Tile.EMPTY);
                } else {
                    mapRow.push(c as Tile);
                }
            }

            map.push(mapRow);
        }

        if (guard === null) {
            throw new Error("Guard not found");
        }

        return [map, guard];
    }

    constructor(input: string) {
        this.input = input;
    }

    private nextPos(pos: Vec2, facing: Facing): Vec2 {
        switch (facing) {
        case Facing.NORTH:
            return { row: pos.row - 1, col: pos.col };
        case Facing.SOUTH:
            return { row: pos.row + 1, col: pos.col };
        case Facing.EAST:
            return { row: pos.row, col: pos.col + 1 };
        case Facing.WEST:
            return { row: pos.row, col: pos.col - 1 };
        }
    }

    private isBounded(map: Tile[][], pos: Vec2): boolean {
        return pos.row >= 0 && pos.row < map.length && pos.col >= 0 && pos.col < map[0].length;
    }

    private isWall(map: Tile[][], pos: Vec2): boolean {
        return map[pos.row][pos.col] === Tile.WALL;
    }

    private turnRight(facing: Facing): Facing {
        switch (facing) {
        case Facing.NORTH:
            return Facing.EAST;
        case Facing.SOUTH:
            return Facing.WEST;
        case Facing.EAST:
            return Facing.SOUTH;
        case Facing.WEST:
            return Facing.NORTH;
        }
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];
        const [map, guard] = this.parseInput(this.input);
        trace.push({ kind: "input", map, guard: { pos: { row: guard.pos.row, col: guard.pos.col }, facing: guard.facing } });

        const visited: boolean[][] = Array.from({ length: map.length }, () => Array(map[0].length).fill(false));
        let totalSteps = 0;
        while (true) {
            const isVisited = visited[guard.pos.row][guard.pos.col];
            if (!isVisited) {
                totalSteps++;
                trace.push({ kind: "total", steps: totalSteps });
                visited[guard.pos.row][guard.pos.col] = true;
            }
            trace.push({ kind: "visit", pos: guard.pos });

            const nextPos = this.nextPos(guard.pos, guard.facing);
            const isBounded = this.isBounded(map, nextPos);
            if (!isBounded) {
                break;
            }
            trace.push({ kind: "check", pos: nextPos });

            const isWall = this.isWall(map, nextPos);
            trace.push({ kind: "check-result", pos: nextPos, result: !isWall });
            trace.push({ kind: "check-out", pos: nextPos });

            if (isWall) {
                guard.facing = this.turnRight(guard.facing);
                trace.push({ kind: "turn", pos: guard.pos, facing: guard.facing });
                continue;
            }

            trace.push({ kind: "move-to", from: guard.pos, to: nextPos, facing: guard.facing });
            guard.pos = nextPos;
        }

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
        case "check":
            return this.check(step);
        case "check-result":
            return this.checkResult(step);
        case "check-out":
            return this.checkOut(step);
        case "move-to":
            return this.moveTo(step);
        case "turn":
            return this.turn(step);
        case "visit":
            return this.visit(step);
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        for (let i = 0; i < step.map.length; i++) {
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

            const row = step.map[i].map((tile) => {
                switch (tile) {
                case Tile.EMPTY:
                    return "";
                case Tile.WALL:
                    return "#";
                }
            });
            const reportItems = utils.createRowCharItems(mapRowList, row);
            this.tiles!.push(reportItems);
        }

        const guardPos = step.guard.pos;
        this.tiles![guardPos.row][guardPos.col].text.textContent = step.guard.facing;

        return 1000;
    }

    private check(step: Part1TraceItemCheck): number {
        const pos = step.pos;
        this.tiles![pos.row][pos.col].item.classList.remove("bg-neutral-800");
        this.tiles![pos.row][pos.col].item.classList.add("bg-yellow-500");
        return 1000;
    }

    private checkResult(step: Part1TraceItemCheckResult): number {
        const pos = step.pos;
        const result = step.result;
        if (result) {
            this.tiles![pos.row][pos.col].item.classList.remove("bg-yellow-500");
            this.tiles![pos.row][pos.col].item.classList.add("bg-green-500");
        } else {
            this.tiles![pos.row][pos.col].item.classList.remove("bg-yellow-500");
            this.tiles![pos.row][pos.col].item.classList.add("bg-red-500");
        }
        return 1000;
    }

    private checkOut(step: Part1TraceItemCheckOut): number {
        const pos = step.pos;
        this.tiles![pos.row][pos.col].item.classList.remove("bg-green-500", "bg-red-500");
        this.tiles![pos.row][pos.col].item.classList.add("bg-neutral-800");
        return 1000;
    }

    private moveTo(step: Part1TraceItemMoveTo): number {
        const from = step.from;
        const to = step.to;
        this.tiles![from.row][from.col].text.textContent = "";
        this.tiles![to.row][to.col].text.textContent = step.facing;
        return 1000;
    }

    private turn(step: Part1TraceItemTurn): number {
        const pos = step.pos;
        this.tiles![pos.row][pos.col].text.textContent = step.facing;
        return 1000;
    }

    private visit(step: Part1TraceItemVisit): number {
        const pos = step.pos;
        this.tiles![pos.row][pos.col].item.classList.remove("bg-neutral-800");
        this.tiles![pos.row][pos.col].item.classList.add("bg-blue-500");
        return 1000;
    }

    private total(step: Part1TraceItemTotal): number {
        this.answerNumber!.textContent = step.steps.toString();
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

type Part2TraceItemObstruct = { kind: "obstruct", pos: Vec2 };

type Part2TraceItem = Part1TraceItemInput | Part1TraceItemCheck | Part1TraceItemCheckResult | Part1TraceItemCheckOut | Part1TraceItemMoveTo | Part1TraceItemTurn | Part1TraceItemVisit | Part1TraceItemTotal | Part2TraceItemObstruct;

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    private parseInput(input: string): [Tile[][], Guard] {
        const lines = input.trim().split("\n");
        const map: Tile[][] = [];
        let guard: Guard | null = null;

        for (let row = 0; row < lines.length; row++) {
            const line = lines[row];
            const mapRow: Tile[] = [];

            for (let col = 0; col < line.length; col++) {
                const c = line[col];
                if (c === Facing.NORTH || c === Facing.SOUTH || c === Facing.EAST || c === Facing.WEST) {
                    guard = { pos: { row, col }, facing: c as Facing };
                    mapRow.push(Tile.EMPTY);
                } else {
                    mapRow.push(c as Tile);
                }
            }

            map.push(mapRow);
        }

        if (guard === null) {
            throw new Error("Guard not found");
        }

        return [map, guard];
    }

    constructor(input: string) {
        this.input = input;
    }

    private nextPos(pos: Vec2, facing: Facing): Vec2 {
        switch (facing) {
        case Facing.NORTH:
            return { row: pos.row - 1, col: pos.col };
        case Facing.SOUTH:
            return { row: pos.row + 1, col: pos.col };
        case Facing.EAST:
            return { row: pos.row, col: pos.col + 1 };
        case Facing.WEST:
            return { row: pos.row, col: pos.col - 1 };
        }
    }

    private isBounded(map: Tile[][], pos: Vec2): boolean {
        return pos.row >= 0 && pos.row < map.length && pos.col >= 0 && pos.col < map[0].length;
    }

    private isWall(map: Tile[][], pos: Vec2): boolean {
        return map[pos.row][pos.col] === Tile.WALL;
    }

    private turnRight(facing: Facing): Facing {
        switch (facing) {
        case Facing.NORTH:
            return Facing.EAST;
        case Facing.SOUTH:
            return Facing.WEST;
        case Facing.EAST:
            return Facing.SOUTH;
        case Facing.WEST:
            return Facing.NORTH;
        }
    }

    solve(): Trace<Part2TraceItem> {
        const trace: Trace<Part2TraceItem> = [];
        const [mapOG, guardOG] = this.parseInput(this.input);

        let totalCycles = 0;
        for (let row = 0; row < mapOG.length; row++) {
            for (let col = 0; col < mapOG[row].length; col++) {
                if (mapOG[row][col] === Tile.WALL) {
                    continue;
                }

                const map = structuredClone(mapOG);
                const guard = structuredClone(guardOG);
                trace.push({ kind: "input", map, guard: { pos: { row: guard.pos.row, col: guard.pos.col }, facing: guard.facing } });

                trace.push({ kind: "obstruct", pos: { row, col } });
                map[row][col] = Tile.WALL;

                const visited: Map<Facing, boolean>[][] = Array.from({ length: map.length }, () => Array(map[0].length).fill(null).map(() => new Map()));
                while (true) {
                    const isVisited = visited[guard.pos.row][guard.pos.col].get(guard.facing);
                    if (isVisited) {
                        totalCycles++;
                        trace.push({ kind: "total", steps: totalCycles });
                        break;
                    }

                    visited[guard.pos.row][guard.pos.col].set(guard.facing, true);
                    trace.push({ kind: "visit", pos: guard.pos });

                    const nextPos = this.nextPos(guard.pos, guard.facing);
                    const isBounded = this.isBounded(map, nextPos);
                    if (!isBounded) {
                        break;
                    }
                    trace.push({ kind: "check", pos: nextPos });

                    const isWall = this.isWall(map, nextPos);
                    trace.push({ kind: "check-result", pos: nextPos, result: !isWall });
                    trace.push({ kind: "check-out", pos: nextPos });

                    if (isWall) {
                        guard.facing = this.turnRight(guard.facing);
                        trace.push({ kind: "turn", pos: guard.pos, facing: guard.facing });
                        continue;
                    }

                    trace.push({ kind: "move-to", from: guard.pos, to: nextPos, facing: guard.facing });
                    guard.pos = nextPos;
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
        case "check":
            return this.check(step);
        case "check-result":
            return this.checkResult(step);
        case "check-out":
            return this.checkOut(step);
        case "move-to":
            return this.moveTo(step);
        case "turn":
            return this.turn(step);
        case "visit":
            return this.visit(step);
        case "total":
            return this.total(step);
        case "obstruct":
            return this.obstruct(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part2TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        this.mapColumn!.innerHTML = "";
        this.tiles = [];

        for (let i = 0; i < step.map.length; i++) {
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

            const row = step.map[i].map((tile) => {
                switch (tile) {
                case Tile.EMPTY:
                    return "";
                case Tile.WALL:
                    return "#";
                }
            });
            const reportItems = utils.createRowCharItems(mapRowList, row);
            this.tiles!.push(reportItems);
        }

        const guardPos = step.guard.pos;
        this.tiles![guardPos.row][guardPos.col].text.textContent = step.guard.facing;

        return 1000;
    }

    private check(step: Part1TraceItemCheck): number {
        const pos = step.pos;
        this.tiles![pos.row][pos.col].item.classList.remove("bg-neutral-800");
        this.tiles![pos.row][pos.col].item.classList.add("bg-yellow-500");
        return 1000;
    }

    private checkResult(step: Part1TraceItemCheckResult): number {
        const pos = step.pos;
        const result = step.result;
        if (result) {
            this.tiles![pos.row][pos.col].item.classList.remove("bg-yellow-500");
            this.tiles![pos.row][pos.col].item.classList.add("bg-green-500");
        } else {
            this.tiles![pos.row][pos.col].item.classList.remove("bg-yellow-500");
            this.tiles![pos.row][pos.col].item.classList.add("bg-red-500");
        }
        return 1000;
    }

    private checkOut(step: Part1TraceItemCheckOut): number {
        const pos = step.pos;
        this.tiles![pos.row][pos.col].item.classList.remove("bg-green-500", "bg-red-500");
        this.tiles![pos.row][pos.col].item.classList.add("bg-neutral-800");
        return 1000;
    }

    private moveTo(step: Part1TraceItemMoveTo): number {
        const from = step.from;
        const to = step.to;
        this.tiles![from.row][from.col].text.textContent = "";
        this.tiles![to.row][to.col].text.textContent = step.facing;
        return 1000;
    }

    private turn(step: Part1TraceItemTurn): number {
        const pos = step.pos;
        this.tiles![pos.row][pos.col].text.textContent = step.facing;
        return 1000;
    }

    private visit(step: Part1TraceItemVisit): number {
        const pos = step.pos;
        this.tiles![pos.row][pos.col].item.classList.remove("bg-neutral-800");
        this.tiles![pos.row][pos.col].item.classList.add("bg-blue-500");
        return 1000;
    }

    private total(step: Part1TraceItemTotal): number {
        this.answerNumber!.textContent = step.steps.toString();
        return 1000;
    }

    private obstruct(step: Part2TraceItemObstruct): number {
        const pos = step.pos;
        this.tiles![pos.row][pos.col].item.classList.remove("bg-neutral-800");
        this.tiles![pos.row][pos.col].item.classList.add("bg-red-500");
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

const DEFAULT_INPUT_PART1 = "....#.....\n.........#\n..........\n..#.......\n.......#..\n..........\n.#..^.....\n........#.\n#.........\n......#...";
const DEFAULT_INPUT_PART2 = "....#.....\n.........#\n..........\n..#.......\n.......#..\n..........\n.#..^.....\n........#.\n#.........\n......#...";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
