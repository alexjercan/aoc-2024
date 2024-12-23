import { PartAnimator, Solution, Trace, utils } from "./common";

type Part1TraceItemInput = { kind: "input", edges: [string, string][] };
type Part1TraceItemTotal = { kind: "total", total: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemTotal;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): [string, string][] {
        const edges = input.trim().split("\n").map((line) => {
            const vertices = line.split("-");
            return [vertices[0], vertices[1]] as [string, string];
        });

        return edges;
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];
        const edges = this.parseInput(this.input);
        trace.push({ kind: "input", edges });

        const connections: Map<string, string[]> = new Map();
        for (const [a, b] of edges) {
            connections.set(a, (connections.get(a) || []).concat(b));
            connections.set(b, (connections.get(b) || []).concat(a));
        }

        let counter = 0;
        const visited = new Set<string>();

        for (const [computer, neighbors] of connections) {
            for (const neighbor of neighbors) {
                for (const other of neighbors.filter((n) => connections.get(neighbor)!.includes(n))) {
                    const trio = [computer, neighbor, other];
                    const hash = trio.sort().join("-");
                    if (!visited.has(hash) && trio.some((s) => s.startsWith("t"))) {
                        counter += 1;
                        visited.add(hash);
                    }
                }
            }
        }

        trace.push({ kind: "total", total: counter });

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private inputCodes?: HTMLDivElement;

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
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        this.inputCodes!.innerHTML = "";
        for (const code of step.edges.map((edge) => edge.join("-"))) {
            const codeDiv = document.createElement("div");
            codeDiv.classList.add(
                "text-2xl",       // Large text size
                "font-semibold",  // Semi-bold text
                "text-center",    // Centered text
                "text-white"      // White text color
            );
            codeDiv.textContent = code;
            this.inputCodes!.appendChild(codeDiv);
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

        // Column for the input
        this.inputCodes = document.createElement("div");
        this.inputCodes.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
            "p-4",             // Padding inside the container
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
            "overflow-auto",   // Scroll if needed
        );
        puzzleDiv.appendChild(this.inputCodes);
    }
}

type Part2TraceItemInput = { kind: "input", edges: [string, string][] };
type Part2TraceItemTotal = { kind: "total", total: string };

type Part2TraceItem = Part2TraceItemInput | Part2TraceItemTotal;

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): [string, string][] {
        const edges = input.trim().split("\n").map((line) => {
            const vertices = line.split("-");
            return [vertices[0], vertices[1]] as [string, string];
        });

        return edges;
    }

    private choose<T>(a: T[], numChoose: number): T[][] {
        const chosen: T[] = [];
        const result: T[][] = [];
        let i = 0;
        const iStack: number[] = [];

        while (true) {
            if (chosen.length === numChoose) {
                result.push(chosen.slice());
                chosen.pop();
                i = iStack.pop()! + 1;
            } else if (i !== a.length) {
                chosen.push(a[i]);
                iStack.push(i);
                i += 1;
            } else if (iStack.length > 0) {
                chosen.pop();
                i = iStack.pop()! + 1;
            } else {
                break;
            }
        }

        return result;
    }

    solve(): Trace<Part2TraceItem> {
        const trace: Trace<Part2TraceItem> = [];
        const edges = this.parseInput(this.input);
        trace.push({ kind: "input", edges });

        const connections: Map<string, string[]> = new Map();
        for (const [a, b] of edges) {
            connections.set(a, (connections.get(a) || []).concat(b));
            connections.set(b, (connections.get(b) || []).concat(a));
        }

        let maxComponent = 0;
        let largestComponent: string[] = [];

        for (const [computer, neighbors] of connections) {
            let potential = neighbors.length;
            while (potential >= maxComponent) {
                for (const selected of this.choose(neighbors, potential)) {
                    let clique = selected.concat(computer);
                    for (const s of selected) {
                        const newClique = connections.get(s)!.concat(s);
                        clique = clique.filter((c) => newClique.includes(c));
                    }

                    if (clique.length > maxComponent) {
                        maxComponent = clique.length;
                        largestComponent = clique;
                    }
                }

                potential -= 1;
            }
        }

        largestComponent.sort();
        const total = largestComponent.join(",");
        trace.push({ kind: "total", total });

        return trace;
    }
}

class Part2Animator implements PartAnimator<Part2TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private inputCodes?: HTMLDivElement;

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
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part2TraceItem).kind}`);
        }
    }

    private createInput(step: Part2TraceItemInput): number {
        this.inputCodes!.innerHTML = "";
        for (const code of step.edges.map((edge) => edge.join("-"))) {
            const codeDiv = document.createElement("div");
            codeDiv.classList.add(
                "text-2xl",       // Large text size
                "font-semibold",  // Semi-bold text
                "text-center",    // Centered text
                "text-white"      // White text color
            );
            codeDiv.textContent = code;
            this.inputCodes!.appendChild(codeDiv);
        }

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
            "justify-start", // Space between the columns
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

        // Column for the input
        this.inputCodes = document.createElement("div");
        this.inputCodes.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
            "p-4",             // Padding inside the container
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
            "overflow-auto",   // Scroll if needed
        );
        puzzleDiv.appendChild(this.inputCodes);
    }
}

const DESCRIPTION_PART1 = [
    utils.createParagraph("TODO"),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("TODO"),
];

const DEFAULT_INPUT_PART1 = "kh-tc\nqp-kh\nde-cg\nka-co\nyn-aq\nqp-ub\ncg-tb\nvc-aq\ntb-ka\nwh-tc\nyn-cg\nkh-ub\nta-co\nde-co\ntc-td\ntb-wq\nwh-td\nta-ka\ntd-qp\naq-cg\nwq-ub\nub-vc\nde-ta\nwq-aq\nwq-vc\nwh-yn\nka-de\nkh-ta\nco-tc\nwh-qp\ntb-vc\ntd-yn";
const DEFAULT_INPUT_PART2 = "kh-tc\nqp-kh\nde-cg\nka-co\nyn-aq\nqp-ub\ncg-tb\nvc-aq\ntb-ka\nwh-tc\nyn-cg\nkh-ub\nta-co\nde-co\ntc-td\ntb-wq\nwh-td\nta-ka\ntd-qp\naq-cg\nwq-ub\nub-vc\nde-ta\nwq-aq\nwq-vc\nwh-yn\nka-de\nkh-ta\nco-tc\nwh-qp\ntb-vc\ntd-yn";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
