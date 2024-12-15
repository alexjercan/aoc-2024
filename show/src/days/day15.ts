import { PartAnimator, Solution, Trace, utils } from "./common";

type Vec2 = { row: number, col: number };
enum Move { Up, Down, Left, Right }

type Part1TraceItemInput = { kind: "input", boxes: Vec2[], walls: Vec2[], player: Vec2, moves: Move[], width: number, height: number };
type Part1TraceItemSelectMove = { kind: "select-move", index: number };
type Part1TraceItemSelectMoveOut = { kind: "select-move-out", index: number };
type Part1TraceItemMove = { kind: "move", fromTo: [Vec2, Vec2][] };
type Part1TraceItemTotal = { kind: "total", total: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemSelectMove | Part1TraceItemSelectMoveOut | Part1TraceItemMove | Part1TraceItemTotal;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): [Vec2[], Vec2[], Vec2, Move[], number, number] {
        const [map, ms] = input.trim().split("\n\n");
        const lines = map.split("\n");
        const height = lines.length;
        const width = lines[0].length;

        const boxes: Vec2[] = [];
        const walls: Vec2[] = [];
        let player: Vec2 = { row: -1, col: -1 };
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const c = lines[row][col];
                switch (c) {
                case "O":
                    boxes.push({ row, col });
                    break;
                case "#":
                    walls.push({ row, col });
                    break;
                case "@":
                    player = { row, col };
                    break;
                }
            }
        }

        const moves: Move[] = [];
        const moveChars = new Array(ms.trim().split("\n")).join("").split("");
        for (const c of moveChars) {
            switch (c) {
            case "^":
                moves.push(Move.Up);
                break;
            case "v":
                moves.push(Move.Down);
                break;
            case "<":
                moves.push(Move.Left);
                break;
            case ">":
                moves.push(Move.Right);
                break;
            default:
                throw new Error(`Unknown move character: ${c}`);
            }
        }

        return [boxes, walls, player, moves, width, height];
    }

    private newPosition(pos: Vec2, move: Move): Vec2 {
        switch (move) {
        case Move.Up:
            return { row: pos.row - 1, col: pos.col };
        case Move.Down:
            return { row: pos.row + 1, col: pos.col };
        case Move.Left:
            return { row: pos.row, col: pos.col - 1 };
        case Move.Right:
            return { row: pos.row, col: pos.col + 1 };
        }
    }

    private hasBox(boxes: Vec2[], pos: Vec2): boolean {
        return boxes.some((box) => box.row === pos.row && box.col === pos.col);
    }

    private hasWall(walls: Vec2[], pos: Vec2): boolean {
        return walls.some((wall) => wall.row === pos.row && wall.col === pos.col);
    }

    private pushBox(index: number, boxes: Vec2[], walls: Vec2[], move: Move): [boolean, [Vec2, Vec2][]] {
        const newPos = this.newPosition(boxes[index], move);
        if (this.hasWall(walls, newPos)) {
            return [false, []];
        }

        if (this.hasBox(boxes, newPos)) {
            const boxIndex = boxes.findIndex((box) => box.row === newPos.row && box.col === newPos.col);
            const [success, fromTo] = this.pushBox(boxIndex, boxes, walls, move);

            if (!success) {
                return [false, []];
            }

            return [true, [...fromTo, [boxes[index], newPos]]];
        }

        return [true, [[boxes[index], newPos]]];
    }

    private movePlayer(player: Vec2, move: Move, boxes: Vec2[], walls: Vec2[]): [Vec2, Vec2][] {
        const newPos = this.newPosition(player, move);
        if (this.hasWall(walls, newPos)) {
            return [];
        }

        if (this.hasBox(boxes, newPos)) {
            const boxIndex = boxes.findIndex((box) => box.row === newPos.row && box.col === newPos.col);
            const [success, fromTo] = this.pushBox(boxIndex, boxes, walls, move);

            if (!success) {
                return [];
            }

            return [...fromTo, [player, newPos]];
        }

        return [[player, newPos]];
    }

    private computeTotal(boxes: Vec2[]): number {
        let total = 0;
        for (const box of boxes) {
            total = total + 100 * box.row + box.col;
        }

        return total;
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const [boxes, walls, player, moves, width, height] = this.parseInput(this.input);
        trace.push({ kind: "input", boxes, walls, player, moves, width, height });

        let newPlayer = { ...player };
        let newBoxes = boxes.map((box) => ({ ...box }));
        const total = this.computeTotal(newBoxes);
        trace.push({ kind: "total", total });

        for (let index = 0; index < moves.length; index++) {
            const move = moves[index];
            trace.push({ kind: "select-move", index });

            const fromTo = this.movePlayer(newPlayer, move, newBoxes, walls);
            newPlayer = { ...newPlayer };
            newBoxes = newBoxes.map((box) => ({ ...box }));

            if (fromTo.length > 0) {
                trace.push({ kind: "move", fromTo });
                newPlayer.row = fromTo[fromTo.length - 1][1].row;
                newPlayer.col = fromTo[fromTo.length - 1][1].col;

                const boxIndices = [];
                for (let i = 0; i < fromTo.length - 1; i++) {
                    const [from, _] = fromTo[i];
                    const boxIndex = newBoxes.findIndex((box) => box.row === from.row && box.col === from.col);
                    boxIndices.push(boxIndex);
                }

                for (let i = 0; i < boxIndices.length; i++) {
                    const boxIndex = boxIndices[i];
                    newBoxes[boxIndex].row = fromTo[i][1].row;
                    newBoxes[boxIndex].col = fromTo[i][1].col;
                }
            }

            trace.push({ kind: "select-move-out", index });

            const total = this.computeTotal(newBoxes);
            trace.push({ kind: "total", total });
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
    private movesRow?: HTMLUListElement;
    private moves?: { item: HTMLLIElement, text: HTMLSpanElement }[];

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
        this.movesRow = undefined;
        this.moves = undefined;
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
        case "select-move":
            return this.selectMove(step);
        case "select-move-out":
            return this.selectMoveOut(step);
        case "move":
            return this.move(step);
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        const boxes = step.boxes;
        const walls = step.walls;
        const player = step.player;
        const moves = step.moves;
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
                const value = (player.row === row && player.col === col) ? "@" :
                    boxes.some((box) => box.row === row && box.col === col) ? "O" :
                        walls.some((wall) => wall.row === row && wall.col === col) ? "#" : ".";

                const element = utils.createCharItem(value);
                mapRowList.appendChild(element.item);
                rowItems.push(element);
            }
            this.tiles!.push(rowItems);
        }

        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            const moveText = move === Move.Up ? "^" :
                move === Move.Down ? "v" :
                    move === Move.Left ? "<" : ">";

            const moveItem = utils.createCharItem(moveText);
            this.movesRow!.appendChild(moveItem.item);
            this.moves!.push(moveItem);
        }

        return 1000;
    }

    private selectMove(step: Part1TraceItemSelectMove): number {
        this.moves![step.index].text.classList.remove("text-white");
        this.moves![step.index].text.classList.add("text-yellow-500");

        return 1000;
    }

    private selectMoveOut(step: Part1TraceItemSelectMoveOut): number {
        this.moves![step.index].text.classList.remove("text-yellow-500");
        this.moves![step.index].text.classList.add("text-white");

        return 1000;
    }

    private move(step: Part1TraceItemMove): number {
        const fromTo = step.fromTo;

        for (const [from, to] of fromTo) {
            const fromItem = this.tiles![from.row][from.col];
            const toItem = this.tiles![to.row][to.col];

            toItem.text.textContent = fromItem.text.textContent;
            fromItem.text.textContent = ".";
        }

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

        // Create the memory row that will contain div's for each character in the memory
        // If it overflows then continue on next line
        this.movesRow = document.createElement("ul");
        this.movesRow.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-start",   // Start items horizontally
            "items-center",    // Center items vertically
            "flex-wrap",       // Wrap items when they overflow
            "mt-4",             // Margin top
            "overflow-y-auto"  // Allow vertical scrolling
        );
        puzzleDiv.appendChild(this.movesRow);

        this.tiles = [];
        this.moves = [];
    }
}

type Part2TraceItemInput = { kind: "input" };

type Part2TraceItem = Part2TraceItemInput;

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    solve(): Trace<Part2TraceItem> {
        const trace: Trace<Part2TraceItem> = [];

        return trace;
    }
}

class Part2Animator implements PartAnimator<Part2TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

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
        default:
            throw new Error(`Unknown step kind: ${(step as Part2TraceItem).kind}`);
        }
    }

    private createInput(step: Part2TraceItemInput): number {
        return 1000;
    }

    private create(): void {
    }
}

const DESCRIPTION_PART1 = [
    utils.createParagraph("TODO"),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("TODO"),
];

const DEFAULT_INPUT_PART1 = "########\n#..O.O.#\n##@.O..#\n#...O..#\n#.#.O..#\n#...O..#\n#......#\n########\n\n<^^>>>vv<v>>v<<\n";
const DEFAULT_INPUT_PART2 = "########\n#..O.O.#\n##@.O..#\n#...O..#\n#.#.O..#\n#...O..#\n#......#\n########\n\n<^^>>>vv<v>>v<<\n";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
