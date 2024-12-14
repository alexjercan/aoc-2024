import { PartAnimator, Solution, Trace, utils } from "./common";

function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
}

type Vec2 = { x: number, y: number };

type Robot = {
    pos: Vec2,
    speed: Vec2,
};

type Part1TraceItemInput = { kind: "input", robots: Robot[] };
type Part1TraceItemSelect = { kind: "select", pos: Vec2 };
type Part1TraceItemSelectOut = { kind: "select-out", pos: Vec2 };
type Part1TraceItemMove = { kind: "move", from: Vec2, to: Vec2 };
type Part1TraceItemQuad = { kind: "quad", q1: number, q2: number, q3: number, q4: number };
type Part1TraceItemAnswer = { kind: "answer", answer: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemSelect | Part1TraceItemSelectOut | Part1TraceItemMove | Part1TraceItemQuad | Part1TraceItemAnswer;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): Robot[] {
        return input.trim().split("\n").map((line) => {
            const parts = line.split(" ");
            const pos = parts[0].split("=")[1].split(",").map((x) => parseInt(x, 10));
            const speed = parts[1].split("=")[1].split(",").map((x) => parseInt(x, 10));
            return {
                pos: { x: pos[0], y: pos[1] },
                speed: { x: speed[0], y: speed[1] },
            };
        });
    }

    private step(robot: Robot, time: number, { width, height }: { width: number, height: number }): Vec2 {
        return {
            x: mod(robot.pos.x + time * robot.speed.x, width),
            y: mod(robot.pos.y + time * robot.speed.y, height),
        };
    }

    private quad(pos: Vec2, { width, height }: { width: number, height: number }): number {
        const midWidth = Math.floor(width / 2);
        const midHeight = Math.floor(height / 2);

        if (pos.x < midWidth && pos.y < midHeight) {
            return 1;
        } else if (pos.x > midWidth && pos.y < midHeight) {
            return 2;
        } else if (pos.x < midWidth && pos.y > midHeight) {
            return 3;
        } else if (pos.x > midWidth && pos.y > midHeight) {
            return 4;
        } else {
            return 0;
        }
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const robots = this.parseInput(this.input);
        trace.push({ kind: "input", robots });

        const width = robots.reduce((acc, robot) => Math.max(acc, robot.pos.x), 0) > 10 ? 101 : 11;
        const height = robots.reduce((acc, robot) => Math.max(acc, robot.pos.y), 0) > 10 ? 103 : 7;

        const poss = [];
        for (const robot of robots) {
            const originalPos = robot.pos;
            trace.push({ kind: "select", pos: originalPos });
            const pos = this.step(robot, 100, { width, height });
            trace.push({ kind: "move", from: originalPos, to: pos });
            trace.push({ kind: "select-out", pos });
            poss.push(pos);
        }

        const quads = poss.map((pos) => this.quad(pos, { width, height })).filter((quad) => quad !== 0);
        const q1 = quads.filter((quad) => quad === 1).length;
        const q2 = quads.filter((quad) => quad === 2).length;
        const q3 = quads.filter((quad) => quad === 3).length;
        const q4 = quads.filter((quad) => quad === 4).length;
        trace.push({ kind: "quad", q1, q2, q3, q4 });

        const answer = q1 * q2 * q3 * q4;
        trace.push({ kind: "answer", answer });

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private mapColumn?: HTMLUListElement;
    private tiles?: { item: HTMLLIElement, text: HTMLSpanElement }[][];
    private quadItems?: { item: HTMLLIElement, text: HTMLSpanElement }[];

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
        this.quadItems = undefined;
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
        case "move":
            return this.move(step);
        case "quad":
            return this.quad(step);
        case "answer":
            return this.answer(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        const robots = step.robots;
        const maxX = robots.reduce((acc, robot) => Math.max(acc, robot.pos.x), 0);
        const maxY = robots.reduce((acc, robot) => Math.max(acc, robot.pos.y), 0);
        const width = (maxX > 10) ? 101 : 11;
        const height = (maxY > 10) ? 103 : 7;

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

            const rowTiles: { item: HTMLLIElement, text: HTMLSpanElement }[] = [];
            for (let col = 0; col < width; col++) {
                const count = robots.filter((robot) => robot.pos.x === col && robot.pos.y === row).length;
                const value = count > 0 ? count.toString() : "";
                const item = utils.createCharItem(value);

                item.item.classList.add(
                    "flex", // Enable flex layout
                    "items-center", // Center items vertically
                    "justify-center", // Center items horizontally
                    "min-w-8", // Fixed width
                    "aspect-square", // Square aspect ratio
                    "m-1", // Add margin to the item
                );
                mapRowList.appendChild(item.item);
                rowTiles.push(item);
            }
            this.tiles!.push(rowTiles);
        }

        return 1000;
    }

    private select(step: Part1TraceItemSelect): number {
        const { pos } = step;
        this.tiles![pos.y][pos.x].item.classList.remove("text-white");
        this.tiles![pos.y][pos.x].item.classList.add("text-yellow-500");

        return 1000;
    }

    private selectOut(step: Part1TraceItemSelectOut): number {
        const { pos } = step;
        this.tiles![pos.y][pos.x].item.classList.remove("text-yellow-500");
        this.tiles![pos.y][pos.x].item.classList.add("text-white");

        return 1000;
    }

    private move(step: Part1TraceItemMove): number {
        const { from, to } = step;
        this.tiles![from.y][from.x].item.classList.remove("text-yellow-500");
        this.tiles![from.y][from.x].item.classList.add("text-white");
        this.tiles![to.y][to.x].item.classList.remove("text-white");
        this.tiles![to.y][to.x].item.classList.add("text-yellow-500");

        const countFrom = parseInt(this.tiles![from.y][from.x].text.textContent || "0", 10);
        const countTo = parseInt(this.tiles![to.y][to.x].text.textContent || "0", 10);

        this.tiles![from.y][from.x].text.textContent = countFrom > 1 ? (countFrom - 1).toString() : "";
        this.tiles![to.y][to.x].text.textContent = (countTo + 1).toString();

        return 1000;
    }

    private quad(step: Part1TraceItemQuad): number {
        const { q1, q2, q3, q4 } = step;
        this.quadItems![0].text.textContent = q1.toString();
        this.quadItems![1].text.textContent = q2.toString();
        this.quadItems![2].text.textContent = q3.toString();
        this.quadItems![3].text.textContent = q4.toString();

        const midWidth = Math.floor(this.tiles![0].length / 2);
        const midHeight = Math.floor(this.tiles!.length / 2);

        for (let row = 0; row < this.tiles!.length; row++) {
            for (let col = 0; col < this.tiles![row].length; col++) {
                const item = this.tiles![row][col];
                if (col === midWidth || row === midHeight) {
                    item.item.classList.remove("bg-neutral-700");
                    item.item.classList.add("bg-red-500");
                }
            }
        }

        return 1000;
    }

    private answer(step: Part1TraceItemAnswer): number {
        this.answerNumber!.textContent = step.answer.toString();

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
        this.quadItems = [];
        for (let i = 0; i < 4; i++) {
            const item = utils.createNumberItem("");
            this.quadItems.push(item);
            middleRow1.appendChild(item.item);
        }

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

type Part2TraceItemInput = { kind: "input", robots: Robot[] };
type Part2TraceItemMove = { kind: "move", from: Vec2[], to: Vec2[] };
type Part2TraceItemTotal = { kind: "total", total: number };

type Part2TraceItem = Part2TraceItemInput | Part2TraceItemMove | Part2TraceItemTotal;

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): Robot[] {
        return input.trim().split("\n").map((line) => {
            const parts = line.split(" ");
            const pos = parts[0].split("=")[1].split(",").map((x) => parseInt(x, 10));
            const speed = parts[1].split("=")[1].split(",").map((x) => parseInt(x, 10));
            return {
                pos: { x: pos[0], y: pos[1] },
                speed: { x: speed[0], y: speed[1] },
            };
        });
    }

    private step(robot: Robot, time: number, { width, height }: { width: number, height: number }): Vec2 {
        return {
            x: mod(robot.pos.x + time * robot.speed.x, width),
            y: mod(robot.pos.y + time * robot.speed.y, height),
        };
    }

    solve(): Trace<Part2TraceItem> {
        const trace: Trace<Part2TraceItem> = [];

        let robots = this.parseInput(this.input);
        trace.push({ kind: "input", robots });

        const width = robots.reduce((acc, robot) => Math.max(acc, robot.pos.x), 0) > 10 ? 101 : 11;
        const height = robots.reduce((acc, robot) => Math.max(acc, robot.pos.y), 0) > 10 ? 103 : 7;

        let count = 0;
        while (true) {
            const originalPoss = robots.map((robot) => robot.pos);

            robots = robots.map((robot) => {
                return {
                    pos: this.step(robot, 1, { width, height }),
                    speed: robot.speed,
                };
            });
            trace.push({ kind: "move", from: originalPoss, to: robots.map((robot) => robot.pos) });

            const positions = new Set(robots.map((robot) => `${robot.pos.x},${robot.pos.y}`));

            if (positions.size === robots.length) {
                break;
            }

            count++;
            trace.push({ kind: "total", total: count });
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
        case "move":
            return this.move(step);
        case "total":
            return this.answer(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part2TraceItem).kind}`);
        }
    }

    private createInput(step: Part2TraceItemInput): number {
        const robots = step.robots;
        const maxX = robots.reduce((acc, robot) => Math.max(acc, robot.pos.x), 0);
        const maxY = robots.reduce((acc, robot) => Math.max(acc, robot.pos.y), 0);
        const width = (maxX > 10) ? 101 : 11;
        const height = (maxY > 10) ? 103 : 7;

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

            const rowTiles: { item: HTMLLIElement, text: HTMLSpanElement }[] = [];
            for (let col = 0; col < width; col++) {
                const value = robots.some((robot) => robot.pos.x === col && robot.pos.y === row) ? "#" : "";
                const item = utils.createCharItem(value);

                item.item.classList.add(
                    "flex", // Enable flex layout
                    "items-center", // Center items vertically
                    "justify-center", // Center items horizontally
                    "min-w-8", // Fixed width
                    "aspect-square", // Square aspect ratio
                    "m-1", // Add margin to the item
                );
                mapRowList.appendChild(item.item);
                rowTiles.push(item);
            }
            this.tiles!.push(rowTiles);
        }

        return 1000;
    }

    private move(step: Part2TraceItemMove): number {
        const { from, to } = step;
        for (let i = 0; i < from.length; i++) {
            this.tiles![from[i].y][from[i].x].text.textContent = "";
            this.tiles![to[i].y][to[i].x].text.textContent = "#";
        }

        return 1000;
    }

    private answer(step: Part2TraceItemTotal): number {
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

const DEFAULT_INPUT_PART1 = "p=0,4 v=3,-3\np=6,3 v=-1,-3\np=10,3 v=-1,2\np=2,0 v=2,-1\np=0,0 v=1,3\np=3,0 v=-2,-2\np=7,6 v=-1,-3\np=3,0 v=-1,-2\np=9,3 v=2,3\np=7,3 v=-1,2\np=2,4 v=2,-3\np=9,5 v=-3,-3";
const DEFAULT_INPUT_PART2 = "p=0,4 v=3,-3\np=6,3 v=-1,-3\np=10,3 v=-1,2\np=2,0 v=2,-1\np=0,0 v=1,3\np=3,0 v=-2,-2\np=7,6 v=-1,-3\np=3,0 v=-1,-2\np=9,3 v=2,3\np=7,3 v=-1,2\np=2,4 v=2,-3\np=9,5 v=-3,-3";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
