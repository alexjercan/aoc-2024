import { PartAnimator, Solution, Trace, utils } from "./common";

type Part1TraceItemInput = { kind: "input", content: string };
type Part1TraceItemOutput = { kind: "output", value: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemOutput;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(content: string): [Map<string, number>, Map<string, Set<string>>, Map<string, number>, Map<string, [string, string, string]>] {
        const [initial, rules] = content.split("\n\n");
        const inputs = initial.trim().split("\n");
        const rulesArray = rules.trim().split("\n");

        const values = new Map<string, number>();
        for (const input of inputs) {
            const [name, value] = input.split(": ");
            values.set(name, parseInt(value, 10));
        }

        const neighbors = new Map<string, Set<string>>();
        const incoming = new Map<string, number>();
        const operands = new Map<string, [string, string, string]>();
        for (const rule of rulesArray) {
            const [lhs, op, rhs, _, output] = rule.split(" ");
            const [a, b] = lhs > rhs ? [rhs, lhs] : [lhs, rhs];

            if (!neighbors.has(a)) {
                neighbors.set(a, new Set<string>());
            }
            neighbors.get(a)!.add(output);

            if (!neighbors.has(b)) {
                neighbors.set(b, new Set<string>());
            }
            neighbors.get(b)!.add(output);

            incoming.set(output, 0);
            if (!values.has(lhs)) {
                incoming.set(output, (incoming.get(output) || 0) + 1);
            }
            if (!values.has(rhs)) {
                incoming.set(output, (incoming.get(output) || 0) + 1);
            }

            operands.set(output, [lhs, rhs, op]);
        }

        return [values, neighbors, incoming, operands];
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];
        trace.push({ kind: "input", content: this.input });

        const [values, neighbors, incoming, operands] = this.parseInput(this.input);

        const queue: string[] = [];
        for (const [wire, count] of incoming) {
            if (count === 0) {
                queue.push(wire);
            }
        }

        while (queue.length > 0) {
            const current = queue.shift()!;
            const [lhs, rhs, op] = operands.get(current)!;
            const lhsValue = values.get(lhs)!;
            const rhsValue = values.get(rhs)!;

            let value = 0;
            if (op === "AND") {
                value = lhsValue & rhsValue;
            } else if (op === "OR") {
                value = lhsValue | rhsValue;
            } else if (op === "XOR") {
                value = lhsValue ^ rhsValue;
            } else {
                throw new Error("oops");
            }

            values.set(current, value);

            for (const neighbor of neighbors.get(current)! || new Set<string>()) {
                incoming.set(neighbor, (incoming.get(neighbor) || 0) - 1);
                if (incoming.get(neighbor) === 0) {
                    queue.push(neighbor);
                }
            }
        }

        const outputs: [string, number][] = [];
        for (const [wire, value] of values) {
            if (wire.startsWith("z")) {
                outputs.push([wire, value]);
            }
        }

        outputs.sort((a, b) => b[0].localeCompare(a[0]));

        let output = "";
        for (const [, value] of outputs) {
            output += value.toString();
        }

        const result = parseInt(output, 2);
        trace.push({ kind: "output", value: result });

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private contentDiv?: HTMLDivElement;

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
        case "output":
            return this.output(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        this.contentDiv!.textContent = step.content;

        return 1000;
    }

    private output(step: Part1TraceItemOutput): number {
        this.answerNumber!.textContent = step.value.toString();

        return 1000;
    }

    private create(): void {
        // Create the main puzzle container
        const puzzleDiv = document.createElement("div");
        puzzleDiv.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-start",   // Align items to the start
            "items-center",    // Center items horizontally
            "space-y-4",       // Vertical spacing between children
            "w-full",          // Full width
            "h-full",          // Full height
            "grow",            // Allow the container to grow
            "py-4",            // Vertical padding
            "overflow-hidden"  // Prevent content overflow
        );
        this.solutionDiv.appendChild(puzzleDiv);

        // Create the middle pad container
        const middlePad = document.createElement("div");
        middlePad.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
            "max-h-full",      // Restrict height to parent
            "p-4",             // Padding inside the container
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
            "overflow-hidden"  // Prevent content overflow
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
        const containerDiv = document.createElement("div");
        containerDiv.classList.add(
            "flex",              // Flex container
            "flex-col",          // Arrange children in a column
            "items-center",      // Center items horizontally
            "w-full",            // Full width
            "h-full",            // Full height
            "p-4",               // Padding inside the container
            "bg-neutral-800",    // Dark background
            "rounded-lg",        // Rounded corners
            "shadow-lg",         // Large shadow effect
            "overflow-y-auto",   // Scroll if needed
            "max-h-64"           // Limit height to prevent full-page overflow
        );
        puzzleDiv.appendChild(containerDiv);

        this.contentDiv = document.createElement("div");
        this.contentDiv.classList.add(
            "text-sm",         // Small text size
            "text-left",       // Left-aligned text
            "text-white",      // White text color
        );
        containerDiv.appendChild(this.contentDiv);
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

const DEFAULT_INPUT_PART1 = "x00: 1\nx01: 0\nx02: 1\nx03: 1\nx04: 0\ny00: 1\ny01: 1\ny02: 1\ny03: 1\ny04: 1\n\nntg XOR fgs -> mjb\ny02 OR x01 -> tnw\nkwq OR kpj -> z05\nx00 OR x03 -> fst\ntgd XOR rvg -> z01\nvdt OR tnw -> bfw\nbfw AND frj -> z10\nffh OR nrd -> bqk\ny00 AND y03 -> djm\ny03 OR y00 -> psh\nbqk OR frj -> z08\ntnw OR fst -> frj\ngnj AND tgd -> z11\nbfw XOR mjb -> z00\nx03 OR x00 -> vdt\ngnj AND wpb -> z02\nx04 AND y00 -> kjc\ndjm OR pbm -> qhw\nnrd AND vdt -> hwm\nkjc AND fst -> rvg\ny04 OR y02 -> fgs\ny01 AND x02 -> pbm\nntg OR kjc -> kwq\npsh XOR fgs -> tgd\nqhw XOR tgd -> z09\npbm OR djm -> kpj\nx03 XOR y03 -> ffh\nx00 XOR y04 -> ntg\nbfw OR bqk -> z06\nnrd XOR fgs -> wpb\nfrj XOR qhw -> z04\nbqk OR frj -> z07\ny03 OR x01 -> nrd\nhwm AND bqk -> z03\ntgd XOR rvg -> z12\ntnw OR pbm -> gnj\n";
const DEFAULT_INPUT_PART2 = "TODO";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
