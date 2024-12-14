import { PartAnimator, Solution, Trace, utils } from "./common";

type ClawMachine = { xA: number, xB: number, yA: number, yB: number, xPrize: number, yPrize: number };

type Part1TraceItemInput = { kind: "input", machines: ClawMachine[] };
type Part1TraceItemSolution = { kind: "solution", index: number, aPresses: number | null, bPresses: number | null };
type Part1TraceItemTotal = { kind: "total", total: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemSolution | Part1TraceItemTotal;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): ClawMachine[] {
        const machines: ClawMachine[] = [];

        for (const group of input.split("\n\n")) {
            const lines = group.split("\n");

            const machine: ClawMachine = {
                xA: parseInt(lines[0].match(/X\+(\d+), Y\+(\d+)/)![1]),
                xB: parseInt(lines[1].match(/X\+(\d+), Y\+(\d+)/)![1]),
                yA: parseInt(lines[0].match(/X\+(\d+), Y\+(\d+)/)![2]),
                yB: parseInt(lines[1].match(/X\+(\d+), Y\+(\d+)/)![2]),
                xPrize: parseInt(lines[2].match(/X=(\d+), Y=(\d+)/)![1]),
                yPrize: parseInt(lines[2].match(/X=(\d+), Y=(\d+)/)![2]),
            };

            machines.push(machine);
        }

        return machines;
    }

    private solveMachine(index: number, machine: ClawMachine, offset: number, trace: Trace<Part1TraceItem>): number {
        const x = machine.xPrize + offset;
        const y = machine.yPrize + offset;

        const den = machine.xA * machine.yB - machine.yA * machine.xB;
        if (den === 0) {
            return 0;
        }

        const a = machine.yB * x - machine.xB * y;
        const b = -machine.yA * x + machine.xA * y;

        const aPresses = Math.floor(a / den);
        const bPresses = Math.floor(b / den);

        const xResult = aPresses * machine.xA + bPresses * machine.xB;
        const yResult = aPresses * machine.yA + bPresses * machine.yB;

        if (xResult === x && yResult === y) {
            trace.push({ kind: "solution", index, aPresses, bPresses });
            return aPresses * 3 + bPresses;
        }

        trace.push({ kind: "solution", index, aPresses: null, bPresses: null });
        return 0;
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const machines = this.parseInput(this.input);
        trace.push({ kind: "input", machines });

        let total = 0;
        for (let index = 0; index < machines.length; index++) {
            const machine = machines[index];
            total += this.solveMachine(index, machine, 0, trace);

            trace.push({ kind: "total", total });
        }

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private container?: HTMLDivElement;
    private solutions?: HTMLUListElement[] = [];

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
        this.container = undefined;
        this.solutions = undefined;
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
        case "solution":
            return this.solution(step);
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        const machines = step.machines;

        for (let index = 0; index < machines.length; index++) {
            const machine = machines[index];

            const item = document.createElement("li");
            item.classList.add(
                "flex",            // Flex container
                "flex-col",        // Arrange children in a column
                "items-center",    // Center items horizontally
                "space-y-2",       // Vertical space between children
                "w-full",          // Full width
                "bg-neutral-800",  // Dark background
                "rounded-lg",      // Rounded corners
                "p-4",             // Padding inside the container
                "shadow-md",       // Medium shadow effect
            );
            this.container!.appendChild(item);

            const text = document.createElement("span");
            text.classList.add(
                "text-lg",         // Large text size
                "font-semibold",   // Semi-bold text
                "text-center",     // Centered text
            );
            text.textContent = `Machine ${index + 1}`;
            item.appendChild(text);

            // contaier will have 2 columns on lhs will be the equations and on rhs the solution
            const contaier = document.createElement("div");
            contaier.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a column
                "items-center",    // Center items horizontally
                "space-x-4",       // Horizontal space between children
                "w-full",          // Full width
            );
            item.appendChild(contaier);

            const equations = document.createElement("ul");
            equations.classList.add(
                "flex",            // Flex container
                "flex-col",        // Arrange children in a column
                "items-center",    // Center items horizontally
                "space-y-2",       // Vertical space between children
                "w-1/2",           // Width is 1/2 of the parent container
            );
            contaier.appendChild(equations);

            const solution = document.createElement("ul");
            solution.classList.add(
                "flex",            // Flex container
                "flex-col",        // Arrange children in a column
                "items-center",    // Center items horizontally
                "space-y-2",       // Vertical space between children
                "w-1/2",           // Width is 1/2 of the parent container
            );
            contaier.appendChild(solution);
            this.solutions!.push(solution);

            const machineDivA = document.createElement("li");
            machineDivA.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a column
                "items-start",    // Center items horizontally
                "justify-center",  // Center items horizontally
                "w-full",          // Full width
                "space-x-4",       // Horizontal space between children
                "rounded-lg",      // Rounded corners
                "shadow-sm",       // Small shadow effect
            );
            equations.appendChild(machineDivA);

            const machineTextA = document.createElement("span");
            machineTextA.classList.add(
                "text-lg",         // Large text size
                "font-semibold",   // Semi-bold text
                "text-center",     // Centered text
            );
            machineTextA.textContent = "Button A";
            machineDivA.appendChild(machineTextA);

            const machineTextAValue = document.createElement("span");
            machineTextAValue.classList.add(
                "text-lg",         // Large text size
                "font-semibold",   // Semi-bold text
                "text-center",     // Centered text
            );

            machineTextAValue.textContent = `X+${machine.xA}, Y+${machine.yA}`;
            machineDivA.appendChild(machineTextAValue);

            const machineDivB = document.createElement("li");
            machineDivB.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a column
                "items-start",    // Center items horizontally
                "justify-center",  // Center items horizontally
                "w-full",          // Full width
                "space-x-4",       // Horizontal space between children
                "rounded-lg",      // Rounded corners
                "shadow-sm",       // Small shadow effect
            );
            equations.appendChild(machineDivB);

            const machineTextB = document.createElement("span");
            machineTextB.classList.add(
                "text-lg",         // Large text size
                "font-semibold",   // Semi-bold text
                "text-center",     // Centered text
            );
            machineTextB.textContent = "Button B";
            machineDivB.appendChild(machineTextB);

            const machineTextBValue = document.createElement("span");
            machineTextBValue.classList.add(
                "text-lg",         // Large text size
                "font-semibold",   // Semi-bold text
                "text-center",     // Centered text
            );
            machineTextBValue.textContent = `X+${machine.xB}, Y+${machine.yB}`;
            machineDivB.appendChild(machineTextBValue);

            const machineDivPrize = document.createElement("li");
            machineDivPrize.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a column
                "items-start",    // Center items horizontally
                "justify-center",  // Center items horizontally
                "w-full",          // Full width
                "space-x-4",       // Horizontal space between children
                "rounded-lg",      // Rounded corners
                "shadow-sm",       // Small shadow effect
            );
            equations.appendChild(machineDivPrize);

            const machineTextPrize = document.createElement("span");
            machineTextPrize.classList.add(
                "text-lg",         // Large text size
                "font-semibold",   // Semi-bold text
                "text-center",     // Centered text
            );
            machineTextPrize.textContent = "Prize";
            machineDivPrize.appendChild(machineTextPrize);

            const machineTextPrizeValue = document.createElement("span");
            machineTextPrizeValue.classList.add(
                "text-lg",         // Large text size
                "font-semibold",   // Semi-bold text
                "text-center",     // Centered text
            );
            machineTextPrizeValue.textContent = `X=${machine.xPrize}, Y=${machine.yPrize}`;
            machineDivPrize.appendChild(machineTextPrizeValue);
        }

        return 1000;
    }

    private solution(step: Part1TraceItemSolution): number {
        const index = step.index;
        const aPresses = step.aPresses;
        const bPresses = step.bPresses;

        const solution = this.solutions![index];
        const item = document.createElement("li");
        item.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "space-y-2",       // Vertical space between children
            "w-full",          // Full width
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "p-4",             // Padding inside the container
            "shadow-md",       // Medium shadow effect
        );
        solution.appendChild(item);

        const text = document.createElement("span");
        text.classList.add(
            "text-lg",         // Large text size
            "font-semibold",   // Semi-bold text
            "text-center",     // Centered text
        );
        text.textContent = `Solution ${index + 1}`;
        item.appendChild(text);

        const machineDivA = document.createElement("li");
        machineDivA.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a column
            "items-start",    // Center items horizontally
            "justify-center",  // Center items horizontally
            "w-full",          // Full width
            "space-x-4",       // Horizontal space between children
            "rounded-lg",      // Rounded corners
            "shadow-sm",       // Small shadow effect
        );
        item.appendChild(machineDivA);

        const machineTextA = document.createElement("span");
        machineTextA.classList.add(
            "text-lg",         // Large text size
            "font-semibold",   // Semi-bold text
            "text-center",     // Centered text
        );
        machineTextA.textContent = "Button A";
        machineDivA.appendChild(machineTextA);

        const machineTextAValue = document.createElement("span");
        machineTextAValue.classList.add(
            "text-lg",         // Large text size
            "font-semibold",   // Semi-bold text
            "text-center",     // Centered text
        );

        if (aPresses !== null) {
            machineTextAValue.textContent = `Press ${aPresses} times`;
        }
        else {
            machineTextAValue.textContent = "No solution";
        }
        machineDivA.appendChild(machineTextAValue);

        const machineDivB = document.createElement("li");
        machineDivB.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a column
            "items-start",    // Center items horizontally
            "justify-center",  // Center items horizontally
            "w-full",          // Full width
            "space-x-4",       // Horizontal space between children
            "rounded-lg",      // Rounded corners
            "shadow-sm",       // Small shadow effect
        );
        item.appendChild(machineDivB);

        const machineTextB = document.createElement("span");
        machineTextB.classList.add(
            "text-lg",         // Large text size
            "font-semibold",   // Semi-bold text
            "text-center",     // Centered text
        );
        machineTextB.textContent = "Button B";
        machineDivB.appendChild(machineTextB);

        const machineTextBValue = document.createElement("span");
        machineTextBValue.classList.add(
            "text-lg",         // Large text size
            "font-semibold",   // Semi-bold text
            "text-center",     // Centered text
        );
        if (bPresses !== null) {
            machineTextBValue.textContent = `Press ${bPresses} times`;
        }
        else {
            machineTextBValue.textContent = "No solution";
        }
        machineDivB.appendChild(machineTextBValue);

        return 1000;
    }

    private total(step: Part1TraceItemTotal): number {
        const total = step.total;

        this.answerNumber!.textContent = total.toString();

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
        );
        this.solutionDiv.appendChild(puzzleDiv);

        // Create the middle pad container
        const middlePad = document.createElement("div");
        middlePad.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
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

        // Create a col that will contain all the machines
        this.container = document.createElement("div");
        this.container.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "space-y-4",       // Vertical space between children
            "w-full",          // Full width
            "h-full",          // Full height
            "grow",            // Allow the container to grow
            "overflow-y-auto", // Allow vertical overflow
        );
        puzzleDiv.appendChild(this.container);

        this.solutions = [];
    }
}

type Part2TraceItem = Part1TraceItem;

class Part2Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): ClawMachine[] {
        const machines: ClawMachine[] = [];

        for (const group of input.split("\n\n")) {
            const lines = group.split("\n");

            const machine: ClawMachine = {
                xA: parseInt(lines[0].match(/X\+(\d+), Y\+(\d+)/)![1]),
                xB: parseInt(lines[1].match(/X\+(\d+), Y\+(\d+)/)![1]),
                yA: parseInt(lines[0].match(/X\+(\d+), Y\+(\d+)/)![2]),
                yB: parseInt(lines[1].match(/X\+(\d+), Y\+(\d+)/)![2]),
                xPrize: parseInt(lines[2].match(/X=(\d+), Y=(\d+)/)![1]),
                yPrize: parseInt(lines[2].match(/X=(\d+), Y=(\d+)/)![2]),
            };

            machines.push(machine);
        }

        return machines;
    }

    private solveMachine(index: number, machine: ClawMachine, offset: number, trace: Trace<Part1TraceItem>): number {
        const x = machine.xPrize + offset;
        const y = machine.yPrize + offset;

        const den = machine.xA * machine.yB - machine.yA * machine.xB;
        if (den === 0) {
            return 0;
        }

        const a = machine.yB * x - machine.xB * y;
        const b = -machine.yA * x + machine.xA * y;

        const aPresses = Math.floor(a / den);
        const bPresses = Math.floor(b / den);

        const xResult = aPresses * machine.xA + bPresses * machine.xB;
        const yResult = aPresses * machine.yA + bPresses * machine.yB;

        if (xResult === x && yResult === y) {
            trace.push({ kind: "solution", index, aPresses, bPresses });
            return aPresses * 3 + bPresses;
        }

        trace.push({ kind: "solution", index, aPresses: null, bPresses: null });
        return 0;
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const machines = this.parseInput(this.input);
        trace.push({ kind: "input", machines });

        let total = 0;
        for (let index = 0; index < machines.length; index++) {
            const machine = machines[index];
            total += this.solveMachine(index, machine, 10000000000000, trace);

            trace.push({ kind: "total", total });
        }

        return trace;
    }
}

class Part2Animator extends Part1Animator { }

const DESCRIPTION_PART1 = [
    utils.createParagraph("TODO"),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("TODO"),
];

const DEFAULT_INPUT_PART1 = "Button A: X+94, Y+34\nButton B: X+22, Y+67\nPrize: X=8400, Y=5400\n\nButton A: X+26, Y+66\nButton B: X+67, Y+21\nPrize: X=12748, Y=12176\n\nButton A: X+17, Y+86\nButton B: X+84, Y+37\nPrize: X=7870, Y=6450\n\nButton A: X+69, Y+23\nButton B: X+27, Y+71\nPrize: X=18641, Y=10279";
const DEFAULT_INPUT_PART2 = "Button A: X+94, Y+34\nButton B: X+22, Y+67\nPrize: X=8400, Y=5400\n\nButton A: X+26, Y+66\nButton B: X+67, Y+21\nPrize: X=12748, Y=12176\n\nButton A: X+17, Y+86\nButton B: X+84, Y+37\nPrize: X=7870, Y=6450\n\nButton A: X+69, Y+23\nButton B: X+27, Y+71\nPrize: X=18641, Y=10279";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
