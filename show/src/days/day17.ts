import { PartAnimator, Solution, Trace, utils } from "./common";

type Combo = "A" | "B" | "C" | bigint;

// Will use Lua notation for operations
type InstructionADV = { kind: "adv", value: Combo }; // A = A / 2^(value)
type InstructionBXL = { kind: "bxl", value: bigint }; // B = B ~ (value)
type InstructionBST = { kind: "bst", value: Combo }; // B = (value) % 8
type InstructionJNZ = { kind: "jnz", value: bigint }; // Jump to (value) if A is not zero
type InstructionBXC = { kind: "bxc" }; // B = B ~ C -- value is ignored
type InstructionOUT = { kind: "out", value: Combo }; // Output (value) % 8
type InstructionBDV = { kind: "bdv", value: Combo }; // B = A / 2^(value)
type InstructionCDV = { kind: "cdv", value: Combo }; // C = A / 2^(value)
type Instruction = InstructionADV | InstructionBXL | InstructionBST | InstructionJNZ | InstructionBXC | InstructionOUT | InstructionBDV | InstructionCDV;

type Part1TraceItemInput = { kind: "input", program: Instruction[], registers: { A: bigint, B: bigint, C: bigint } };
type Part1TraceItemIP = { kind: "ip", from: number | undefined, to: number | undefined };
type Part1TraceItemOutput = { kind: "output", value: number };
type Part1TraceItemRegister = { kind: "register", register: "A" | "B" | "C", value: bigint };
type Part1TraceItemAnswer = { kind: "answer", value: string };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemIP | Part1TraceItemOutput | Part1TraceItemRegister | Part1TraceItemAnswer;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): { program: Instruction[], registers: { A: bigint, B: bigint, C: bigint} } {
        const [registers, program] = input.trim().split("\n\n");
        const [registerA, registerB, registerC] = registers.split("\n").map((line) => BigInt(parseInt(line.split(": ")[1])));

        const values = program.split(":" )[1].split(",").map((value) => parseInt(value));
        const instructions: Instruction[] = [];
        for (let i = 0; i < values.length; i += 2) {
            const opcode = values[i];
            const operand = values[i + 1];

            let combo: Combo = BigInt(-1);
            if (operand <= 3) {
                combo = BigInt(operand);
            } else if (operand == 4) {
                combo = "A";
            } else if (operand == 5) {
                combo = "B";
            } else if (operand == 6) {
                combo = "C";
            } else {
                throw new Error(`Operand: ${operand} is invalid!`);
            }

            if (opcode == 0) {
                instructions.push({ kind: "adv", value: combo });
            } else if (opcode == 1) {
                instructions.push({ kind: "bxl", value: BigInt(operand) });
            } else if (opcode == 2) {
                instructions.push({ kind: "bst", value: combo });
            } else if (opcode == 3) {
                instructions.push({ kind: "jnz", value: BigInt(operand) });
            } else if (opcode == 4) {
                instructions.push({ kind: "bxc" });
            } else if (opcode == 5) {
                instructions.push({ kind: "out", value: combo });
            } else if (opcode == 6) {
                instructions.push({ kind: "bdv", value: combo });
            } else if (opcode == 7) {
                instructions.push({ kind: "cdv", value: combo });
            } else {
                throw new Error(`Opcode: ${opcode} is invalid!`);
            }
        }

        return { program: instructions, registers: { A: registerA, B: registerB, C: registerC } };
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const { program, registers } = this.parseInput(this.input);
        trace.push({ kind: "input", program, registers: { ...registers } });

        const output = [];

        let ip = 0;
        trace.push({ kind: "ip", from: undefined, to: ip });
        while (ip < program.length) {
            const instruction = program[ip];
            switch (instruction.kind) {
            case "adv":
                {
                    const { value } = instruction;
                    const v = typeof value == "bigint" ? value : registers[value];
                    registers.A = registers.A / (2n ** v);
                    trace.push({ kind: "register", register: "A", value: registers.A });
                }
                break;
            case "bxl":
                {
                    registers.B = registers.B ^ instruction.value;
                    trace.push({ kind: "register", register: "B", value: registers.B });
                }
                break;
            case "bst":
                {
                    const { value } = instruction;
                    const v = typeof value == "bigint" ? value : registers[value];
                    registers.B = v & 7n;
                    trace.push({ kind: "register", register: "B", value: registers.B });
                }
                break;
            case "jnz":
                if (registers.A != 0n) {
                    if (instruction.value < program.length) {
                        trace.push({ kind: "ip", from: ip, to: Number(instruction.value) });
                    } else {
                        trace.push({ kind: "ip", from: ip, to: undefined });
                    }
                    ip = Number(instruction.value);
                    continue;
                }
                break;
            case "bxc":
                {
                    registers.B = registers.B ^ registers.C;
                    trace.push({ kind: "register", register: "B", value: registers.B });
                }
                break;
            case "out":
                {
                    const { value } = instruction;
                    const v = typeof value == "bigint" ? value : registers[value];
                    output.push(Number(v & 7n));
                    trace.push({ kind: "output", value: Number(v & 7n) });
                }
                break;
            case "bdv":
                {
                    const { value } = instruction;
                    const v = typeof value == "bigint" ? value : registers[value];
                    registers.B = registers.A / (2n ** v);
                    trace.push({ kind: "register", register: "B", value: registers.B });
                }
                break;
            case "cdv":
                {
                    const { value } = instruction;
                    const v = typeof value == "bigint" ? value : registers[value];
                    registers.C = registers.A / (2n ** v);
                    trace.push({ kind: "register", register: "C", value: registers.C });
                }
                break;
            default:
                throw new Error(`Unknown instruction kind: ${(instruction as Instruction).kind}`);
            }

            if (ip + 1 < program.length) {
                trace.push({ kind: "ip", from: ip, to: ip + 1 });
            } else {
                trace.push({ kind: "ip", from: ip, to: undefined });
            }
            ip++;
        }

        const outputString = output.join(",");
        trace.push({ kind: "answer", value: outputString });

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private programColumn?: HTMLUListElement;
    private program?: HTMLUListElement[];
    private registersColumn?: HTMLUListElement;
    private registers?: { text: HTMLSpanElement }[];
    private outputColumn?: HTMLUListElement;
    private outputRow?: { item: HTMLLIElement, text: HTMLSpanElement }[];
    private answerNumber?: HTMLSpanElement;

    constructor(inputDiv: HTMLDivElement, solutionDiv: HTMLDivElement) {
        this.inputDiv = inputDiv;
        this.solutionDiv = solutionDiv;

        this.reset();
    }

    reset(): void {
        this.inputDiv.classList.remove("hidden");
        this.solutionDiv.classList.add("hidden");
        this.solutionDiv.innerHTML = "";

        this.programColumn = undefined;
        this.program = undefined;
        this.registersColumn = undefined;
        this.registers = undefined;
        this.outputColumn = undefined;
        this.outputRow = undefined;
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
        case "ip":
            return this.ip(step);
        case "output":
            return this.output(step);
        case "register":
            return this.register(step);
        case "answer":
            return this.answer(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private answer(step: Part1TraceItemAnswer): number {
        this.answerNumber!.textContent = step.value;

        return 1000;
    }

    private ip(step: Part1TraceItemIP): number {
        const { from, to } = step;

        if (from != undefined) {
            this.program![from].classList.remove("bg-yellow-500");
        }

        if (to != undefined) {
            this.program![to].classList.add("bg-yellow-500");
        }

        return 1000;
    }

    private output(step: Part1TraceItemOutput): number {
        const item = utils.createCharItem(step.value.toString());
        item.item.classList.add(
            "flex",
            "flex-row",
            "justify-center", // Center items vertically
            "w-8", // Fixed width
            "h-8", // Fixed height
            "m-1" // Add margin to the item
        );
        this.outputColumn!.appendChild(item.item);
        this.outputRow!.push({ item: item.item, text: item.text });

        return 1000;
    }

    private register(step: Part1TraceItemRegister): number {
        const { register, value } = step;

        switch (register) {
        case "A":
            this.registers![0].text.textContent = `${value}`;
            break;
        case "B":
            this.registers![1].text.textContent = `${value}`;
            break;
        case "C":
            this.registers![2].text.textContent = `${value}`;
            break;
        default:
            throw new Error(`Unknown register: ${register}`);
        }

        return 1000;
    }

    private createInput(step: Part1TraceItemInput): number {
        const { program, registers } = step;

        for (const instruction of program) {
            const li = document.createElement("li");
            li.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-start",  // Center items horizontally
                "items-start",    // Center items horizontally
                "w-full",          // Full width
            );
            this.programColumn!.appendChild(li);

            const ul = document.createElement("ul");
            ul.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
                "space-x-2",       // Horizontal space between items
                "mb-2"             // Margin bottom
            );
            li.appendChild(ul);
            this.program!.push(ul);

            switch (instruction.kind) {
            case "adv":
                {
                    const item1Text = document.createElement("span");
                    item1Text.textContent = "A";
                    ul.appendChild(item1Text);

                    const assignText = document.createElement("span");
                    assignText.textContent = "=";
                    ul.appendChild(assignText);

                    const item2Text = document.createElement("span");
                    item2Text.textContent = "A";
                    ul.appendChild(item2Text);

                    const divText = document.createElement("span");
                    divText.textContent = "DIV";
                    ul.appendChild(divText);

                    const valueText = document.createElement("span");
                    valueText.textContent = `POW(2, ${instruction.value})`;
                    ul.appendChild(valueText);
                }
                break;
            case "bxl":
                {
                    const item1Text = document.createElement("span");
                    item1Text.textContent = "B";
                    ul.appendChild(item1Text);

                    const assignText = document.createElement("span");
                    assignText.textContent = "=";
                    ul.appendChild(assignText);

                    const item2Text = document.createElement("span");
                    item2Text.textContent = "B";
                    ul.appendChild(item2Text);

                    const divText = document.createElement("span");
                    divText.textContent = "XOR";
                    ul.appendChild(divText);

                    const valueText = document.createElement("span");
                    valueText.textContent = `${instruction.value}`;
                    ul.appendChild(valueText);
                }
                break;
            case "bst":
                {
                    const item1Text = document.createElement("span");
                    item1Text.textContent = "B";
                    ul.appendChild(item1Text);

                    const assignText = document.createElement("span");
                    assignText.textContent = "=";
                    ul.appendChild(assignText);

                    const valueText = document.createElement("span");
                    valueText.textContent = `${instruction.value} MOD 8`;
                    ul.appendChild(valueText);
                }
                break;
            case "jnz":
                {
                    const item1Text = document.createElement("span");
                    item1Text.textContent = "JNZ";
                    ul.appendChild(item1Text);

                    const valueText = document.createElement("span");
                    valueText.textContent = `${instruction.value}`;
                    ul.appendChild(valueText);
                }
                break;
            case "bxc":
                {
                    const item1Text = document.createElement("span");
                    item1Text.textContent = "B";
                    ul.appendChild(item1Text);

                    const assignText = document.createElement("span");
                    assignText.textContent = "=";
                    ul.appendChild(assignText);

                    const item2Text = document.createElement("span");
                    item2Text.textContent = "B";
                    ul.appendChild(item2Text);

                    const divText = document.createElement("span");
                    divText.textContent = "XOR";
                    ul.appendChild(divText);

                    const item3Text = document.createElement("span");
                    item3Text.textContent = "C";
                    ul.appendChild(item3Text);
                }
                break;
            case "out":
                {
                    const item1Text = document.createElement("span");
                    item1Text.textContent = "OUTPUT";
                    ul.appendChild(item1Text);

                    const valueText = document.createElement("span");
                    valueText.textContent = `${instruction.value} MOD 8`;
                    ul.appendChild(valueText);
                }
                break;
            case "bdv":
                {
                    const item1Text = document.createElement("span");
                    item1Text.textContent = "B";
                    ul.appendChild(item1Text);

                    const assignText = document.createElement("span");
                    assignText.textContent = "=";
                    ul.appendChild(assignText);

                    const item2Text = document.createElement("span");
                    item2Text.textContent = "A";
                    ul.appendChild(item2Text);

                    const divText = document.createElement("span");
                    divText.textContent = "DIV";
                    ul.appendChild(divText);

                    const valueText = document.createElement("span");
                    valueText.textContent = `POW(2, ${instruction.value})`;
                    ul.appendChild(valueText);
                }
                break;
            case "cdv":
                {
                    const item1Text = document.createElement("span");
                    item1Text.textContent = "C";
                    ul.appendChild(item1Text);

                    const assignText = document.createElement("span");
                    assignText.textContent = "=";
                    ul.appendChild(assignText);

                    const item2Text = document.createElement("span");
                    item2Text.textContent = "A";
                    ul.appendChild(item2Text);

                    const divText = document.createElement("span");
                    divText.textContent = "DIV";
                    ul.appendChild(divText);

                    const valueText = document.createElement("span");
                    valueText.textContent = `POW(2, ${instruction.value})`;
                    ul.appendChild(valueText);
                }
                break;
            default:
                throw new Error(`Unknown instruction kind: ${(instruction as Instruction).kind}`);
            }
        }

        const li = document.createElement("li");
        li.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a row
            "justify-start",  // Center items horizontally
            "items-start",    // Center items horizontally
            "w-full",          // Full width
        );
        this.registersColumn!.appendChild(li);

        const ulA = document.createElement("ul");
        ulA.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mb-2"             // Margin bottom
        );
        li.appendChild(ulA);

        const registerAText = document.createElement("span");
        registerAText.textContent = "A";
        ulA.appendChild(registerAText);

        const valueText = document.createElement("span");
        valueText.textContent = `${registers.A}`;
        ulA.appendChild(valueText);
        this.registers!.push({ text: valueText });

        const ulB = document.createElement("ul");
        ulB.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mb-2"             // Margin bottom
        );
        li.appendChild(ulB);

        const registerBText = document.createElement("span");
        registerBText.textContent = "B";
        ulB.appendChild(registerBText);

        const valueBText = document.createElement("span");
        valueBText.textContent = `${registers.B}`;
        ulB.appendChild(valueBText);
        this.registers!.push({ text: valueBText });

        const ulC = document.createElement("ul");
        ulC.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mb-2"             // Margin bottom
        );
        li.appendChild(ulC);

        const registerCText = document.createElement("span");
        registerCText.textContent = "C";
        ulC.appendChild(registerCText);

        const valueCText = document.createElement("span");
        valueCText.textContent = `${registers.C}`;
        ulC.appendChild(valueCText);
        this.registers!.push({ text: valueCText });

        return 1000;
    }

    private create() {
        // Create the main puzzle container
        const puzzleDiv = document.createElement("div");
        puzzleDiv.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-between", // Space between the columns
            "items-start",     // Align items to the start (top)
            "space-x-4",       // Horizontal space between children
            "w-full",          // Full width
            "h-full",          // Full height
            "grow",            // Allow the container to grow
            "py-4",            // Vertical padding
        );
        this.solutionDiv.appendChild(puzzleDiv);

        // left column
        const leftContainer = document.createElement("div");
        leftContainer.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
            "h-full",          // Full height
            "grow",            // Allow the container to grow
            "justify-start",   // Center items horizontally
        );
        puzzleDiv.appendChild(leftContainer);

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
        leftContainer.appendChild(middlePad);

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

        const leftContainerTitle = document.createElement("div");
        leftContainerTitle.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "w-full",          // Full width
            "items-center",    // Center items horizontally
            "justify-center",  // Center items vertically
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
            "mb-4",            // Margin bottom
            "p-4",             // Padding inside the container
            "sticky",          // Stick to the top
            "top-0",           // Stick to the top
        );
        leftContainer.appendChild(leftContainerTitle);

        // Add the title with the "Program" text
        const programTitle = document.createElement("h2");
        programTitle.textContent = "Program";
        programTitle.classList.add(
            "text-2xl",        // Large text size
            "font-semibold",   // Semi-bold text
            "text-white",      // White text color
        );
        leftContainerTitle.appendChild(programTitle);

        // Create the left column container for the befores list
        this.programColumn = document.createElement("ul");
        this.programColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "space-y-2",       // Vertical space between items
            "items-center",    // Center items horizontally
            "max-h-full",      // Maximum height
            "w-full",          // Full width
            "p-4",             // Padding inside the column
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
            "transition-all",  // Smooth transition effect
            "ease-in-out",     // Timing function for transition
            "duration-300",    // 300ms duration for transitions
            "overflow-y-auto"  // Allow vertical scrolling
        );
        leftContainer.appendChild(this.programColumn);

        this.program = [];

        // Create the right column
        const rightContainer = document.createElement("div");
        rightContainer.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-center",    // Center items horizontally
            "w-2/3",           // Width is 1/3 of the parent container
            "h-full",          // Full height
            "grow",            // Allow the container to grow
            "justify-start",   // Center items horizontally
        );
        puzzleDiv.appendChild(rightContainer);

        // Create the top section for registers
        const topContainer = document.createElement("div");
        topContainer.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "w-full",          // Full width
            "h-1/3",           // Half height
            "grow",            // Allow the container to grow
            "justify-start",   // Center items horizontally
        );
        rightContainer.appendChild(topContainer);

        const registersContainerTitle = document.createElement("div");
        registersContainerTitle.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "w-full",          // Full width
            "items-center",    // Center items horizontally
            "justify-center",  // Center items vertically
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
            "mb-4",            // Margin bottom
            "p-4",             // Padding inside the container
        );
        topContainer.appendChild(registersContainerTitle);

        // Add the title with the "Registers" text
        const registersTitle = document.createElement("h2");
        registersTitle.textContent = "Registers";
        registersTitle.classList.add(
            "text-2xl",        // Large text size
            "font-semibold",   // Semi-bold text
            "text-white",      // White text color
        );
        registersContainerTitle.appendChild(registersTitle);

        // Create the left column container for the befores list
        this.registersColumn = document.createElement("ul");
        this.registersColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "space-y-2",       // Vertical space between items
            "items-center",    // Center items horizontally
            "max-h-full",      // Maximum height
            "w-full",          // Full width
            "p-4",             // Padding inside the column
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
            "transition-all",  // Smooth transition effect
            "ease-in-out",     // Timing function for transition
            "duration-300",    // 300ms duration for transitions
            "overflow-y-auto"  // Allow vertical scrolling
        );
        topContainer.appendChild(this.registersColumn);

        this.registers = [];

        // Create the bottom section for output
        const bottomContainer = document.createElement("div");
        bottomContainer.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "w-full",          // Full width
            "h-2/3",           // Half height
            "grow",            // Allow the container to grow
            "justify-start",   // Center items horizontally
        );
        rightContainer.appendChild(bottomContainer);

        const outputContainerTitle = document.createElement("div");
        outputContainerTitle.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "w-full",          // Full width
            "items-center",    // Center items horizontally
            "justify-center",  // Center items vertically
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
            "mb-4",            // Margin bottom
            "p-4",             // Padding inside the container
        );
        bottomContainer.appendChild(outputContainerTitle);

        // Add the title with the "Output" text
        const outputTitle = document.createElement("h2");
        outputTitle.textContent = "Output";
        outputTitle.classList.add(
            "text-2xl",        // Large text size
            "font-semibold",   // Semi-bold text
            "text-white",      // White text color
        );
        outputContainerTitle.appendChild(outputTitle);

        this.outputColumn = document.createElement("ul");
        this.outputColumn.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a column
            "justify-start",   // Start items horizontally
            "items-center",    // Center items horizontally
            "flex-wrap",       // Wrap items when they overflow
            "max-h-full",      // Maximum height
            "w-full",          // Full width
            "p-4",             // Padding inside the column
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
            "transition-all",  // Smooth transition effect
            "ease-in-out",     // Timing function for transition
            "duration-300",    // 300ms duration for transitions
            "overflow-y-auto"  // Allow vertical scrolling
        );
        bottomContainer.appendChild(this.outputColumn);

        this.outputRow = [];
    }
}

class Part2Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): { asis: number[], program: Instruction[], registers: { A: bigint, B: bigint, C: bigint} } {
        const [registers, program] = input.trim().split("\n\n");
        const [registerA, registerB, registerC] = registers.split("\n").map((line) => BigInt(parseInt(line.split(": ")[1])));

        const values = program.split(":" )[1].split(",").map((value) => parseInt(value));
        const instructions: Instruction[] = [];
        for (let i = 0; i < values.length; i += 2) {
            const opcode = values[i];
            const operand = values[i + 1];

            let combo: Combo = BigInt(-1);
            if (operand <= 3) {
                combo = BigInt(operand);
            } else if (operand == 4) {
                combo = "A";
            } else if (operand == 5) {
                combo = "B";
            } else if (operand == 6) {
                combo = "C";
            } else {
                throw new Error(`Operand: ${operand} is invalid!`);
            }

            if (opcode == 0) {
                instructions.push({ kind: "adv", value: combo });
            } else if (opcode == 1) {
                instructions.push({ kind: "bxl", value: BigInt(operand) });
            } else if (opcode == 2) {
                instructions.push({ kind: "bst", value: combo });
            } else if (opcode == 3) {
                instructions.push({ kind: "jnz", value: BigInt(operand) });
            } else if (opcode == 4) {
                instructions.push({ kind: "bxc" });
            } else if (opcode == 5) {
                instructions.push({ kind: "out", value: combo });
            } else if (opcode == 6) {
                instructions.push({ kind: "bdv", value: combo });
            } else if (opcode == 7) {
                instructions.push({ kind: "cdv", value: combo });
            } else {
                throw new Error(`Opcode: ${opcode} is invalid!`);
            }
        }

        return { asis: values, program: instructions, registers: { A: registerA, B: registerB, C: registerC } };
    }

    solve1full(program: Instruction[], registers: { A: bigint, B: bigint, C: bigint }): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];
        const a = registers.A;

        trace.push({ kind: "input", program, registers: { ...registers } });

        const output = [];

        let ip = 0;
        trace.push({ kind: "ip", from: undefined, to: ip });
        while (ip < program.length) {
            const instruction = program[ip];
            switch (instruction.kind) {
            case "adv":
                {
                    const { value } = instruction;
                    const v = typeof value == "bigint" ? value : registers[value];
                    registers.A = registers.A / (2n ** v);
                    trace.push({ kind: "register", register: "A", value: registers.A });
                }
                break;
            case "bxl":
                {
                    registers.B = registers.B ^ instruction.value;
                    trace.push({ kind: "register", register: "B", value: registers.B });
                }
                break;
            case "bst":
                {
                    const { value } = instruction;
                    const v = typeof value == "bigint" ? value : registers[value];
                    registers.B = v & 7n;
                    trace.push({ kind: "register", register: "B", value: registers.B });
                }
                break;
            case "jnz":
                if (registers.A != 0n) {
                    if (instruction.value < program.length) {
                        trace.push({ kind: "ip", from: ip, to: Number(instruction.value) });
                    } else {
                        trace.push({ kind: "ip", from: ip, to: undefined });
                    }
                    ip = Number(instruction.value);
                    continue;
                }
                break;
            case "bxc":
                {
                    registers.B = registers.B ^ registers.C;
                    trace.push({ kind: "register", register: "B", value: registers.B });
                }
                break;
            case "out":
                {
                    const { value } = instruction;
                    const v = typeof value == "bigint" ? value : registers[value];
                    output.push(Number(v & 7n));
                    trace.push({ kind: "output", value: Number(v & 7n) });
                }
                break;
            case "bdv":
                {
                    const { value } = instruction;
                    const v = typeof value == "bigint" ? value : registers[value];
                    registers.B = registers.A / (2n ** v);
                    trace.push({ kind: "register", register: "B", value: registers.B });
                }
                break;
            case "cdv":
                {
                    const { value } = instruction;
                    const v = typeof value == "bigint" ? value : registers[value];
                    registers.C = registers.A / (2n ** v);
                    trace.push({ kind: "register", register: "C", value: registers.C });
                }
                break;
            default:
                throw new Error(`Unknown instruction kind: ${(instruction as Instruction).kind}`);
            }

            if (ip + 1 < program.length) {
                trace.push({ kind: "ip", from: ip, to: ip + 1 });
            } else {
                trace.push({ kind: "ip", from: ip, to: undefined });
            }
            ip++;
        }

        trace.push({ kind: "answer", value: a.toString() });

        return trace;
    }

    solve1(program: Instruction[], registers: { A: bigint, B: bigint, C: bigint }): bigint {
        let ip = 0;
        while (ip < program.length) {
            const instruction = program[ip];
            switch (instruction.kind) {
            case "adv":
                {
                    const { value } = instruction;
                    const v = typeof value == "bigint" ? value : registers[value];
                    registers.A = registers.A / (2n ** v);
                }
                break;
            case "bxl":
                {
                    registers.B = registers.B ^ instruction.value;
                }
                break;
            case "bst":
                {
                    const { value } = instruction;
                    const v = typeof value == "bigint" ? value : registers[value];
                    registers.B = v & 7n;
                }
                break;
            case "bxc":
                {
                    registers.B = registers.B ^ registers.C;
                }
                break;
            case "out":
            {
                const { value } = instruction;
                const v = typeof value == "bigint" ? value : registers[value];
                return v & 7n;
            }
            case "bdv":
                {
                    const { value } = instruction;
                    const v = typeof value == "bigint" ? value : registers[value];
                    registers.B = registers.A / (2n ** v);
                }
                break;
            case "cdv":
                {
                    const { value } = instruction;
                    const v = typeof value == "bigint" ? value : registers[value];
                    registers.C = registers.A / (2n ** v);
                }
                break;
            default:
                throw new Error(`Unknown instruction kind: ${(instruction as Instruction).kind}`);
            }

            ip++;
        }

        return 0n;
    }

    solve(): Trace<Part1TraceItem> {
        const { asis, program, registers } = this.parseInput(this.input);

        let prev = [0n];
        for (let i = 0; i < asis.length; i++) {
            const index = asis.length - i - 1;

            const newPrev = [];
            for (const prevA of prev) {
                for (let last = 0n; last < 8n; last++) {
                    if (last == 0n && prevA == 0n) {
                        continue;
                    }

                    const a = (prevA * 8n) + last;
                    registers.A = a;
                    const b3 = this.solve1(program, { ...registers });
                    if (b3 == BigInt(asis[index])) {
                        newPrev.push(a);
                    }
                }
            }

            prev = newPrev;
        }

        prev.sort((a, b) => Number(a - b));
        const answer = prev[0] ?? 0;

        return this.solve1full(program, { ...registers, A: answer });
    }
}

class Part2Animator extends Part1Animator { }

const DESCRIPTION_PART1 = [
    utils.createParagraph("TODO"),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("TODO"),
];

const DEFAULT_INPUT_PART1 = "Register A: 729\nRegister B: 0\nRegister C: 0\n\nProgram: 0,1,5,4,3,0";
const DEFAULT_INPUT_PART2 = "Register A: 2024\nRegister B: 0\nRegister C: 0\n\nProgram: 0,3,5,4,3,0";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
