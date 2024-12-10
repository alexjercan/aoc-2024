import { PartAnimator, Solution, Trace, utils } from "./common";

type Equation = { test: number, operators: number[] };

enum Part1Operator {
    Add = "+",
    Multiply = "*",
}

// "input" will generate the list (lu) of equations (each one will have a test and then a list of operators)
// we are going to generate a list then a equal sign that is gray (meaning we don't know yet if it is solveable)
// then we are going to have a list (another lu) of the operators and in between an empty square that can be turned into a + or a *
// also at the end of the row we will have a "=>" sign such that we can actually put there the result of the operators
type Part1TraceItemInput = { kind: "input", equations:  Equation[] };
// "select" an equation to test if it can be solved with + or *
// we are going to increase the size a bit of the row "scale-110" to show that we selected this row for testing
type Part1TraceItemSelect = { kind: "select", equationIndex: number };
// "select-out" will remove the selection from the equation
type Part1TraceItemSelectOut = { kind: "select-out", equationIndex: number };
// "select-operator" will select an operator to test if it can be solved with + or *
// we are going to place the operator in the empty square and change the color of the square to yellow to indicate "in progress"
type Part1TraceItemSelectOperator = { kind: "select-operator", equationIndex: number, operatorIndex: number, operator: Part1Operator };
// "select-operator-out" will remove the operator from the square and change it back to how it was before
type Part1TraceItemSelectOperatorOut = { kind: "select-operator-out", equationIndex: number, operatorIndex: number };
// "select-operator-result" will show the result of the currently generated expression (the total result we have so far)
type Part1TraceItemSelectOperatorResult = { kind: "select-operator-result", equationIndex: number, result: number };
// "select-operator-ok" will show the result of the final generated expression once we completed the test
type Part1TraceItemSelectOperatorOk = { kind: "select-operator-ok", equationIndex: number, ok: boolean };
type Part1TraceItemOverallOk = { kind: "overall-ok", equationIndex: number, ok: boolean };
type Part1TraceItemSolution = { kind: "solution", equationIndex: number, solution: Part1Operator[] };
// "total" will compute the total sum of the "test" values of the equations that were solved
type Part1TraceItemTotal = { kind: "total", total: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemSelect | Part1TraceItemSelectOut | Part1TraceItemSelectOperator | Part1TraceItemSelectOperatorOut | Part1TraceItemSelectOperatorResult | Part1TraceItemSelectOperatorOk | Part1TraceItemOverallOk | Part1TraceItemSolution | Part1TraceItemTotal;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    private parseInput(input: string): Equation[] {
        return input.split("\n").map((line) => {
            const parts = line.split(": ");
            const test = parseInt(parts[0]);
            const operators = parts[1].split(" ").map((op) => parseInt(op));
            return { test, operators };
        });
    }

    constructor(input: string) {
        this.input = input;
    }

    private isCalibrated(trace: Trace<Part1TraceItem>, equationIndex: number, equation: Equation, index: number, result: number, current: Part1Operator[], solutions: Part1Operator[][]): boolean {
        if (index === equation.operators.length) {
            const ok = equation.test === result;
            trace.push({ kind: "select-operator-ok", equationIndex, ok });
            if (ok) {
                solutions.push([...current]);
            }
            return ok;
        }

        trace.push({ kind: "select-operator", equationIndex, operatorIndex: index - 1, operator: Part1Operator.Add });
        const addResult = result + equation.operators[index];
        trace.push({ kind: "select-operator-result", equationIndex, result: addResult });
        current.push(Part1Operator.Add);
        const addi = this.isCalibrated(trace, equationIndex, equation, index + 1, addResult, current, solutions);
        current.pop();
        trace.push({ kind: "select-operator-result", equationIndex, result: result });
        trace.push({ kind: "select-operator-out", equationIndex, operatorIndex: index - 1 });

        trace.push({ kind: "select-operator", equationIndex, operatorIndex: index - 1, operator: Part1Operator.Multiply });
        const multResult = result * equation.operators[index];
        trace.push({ kind: "select-operator-result", equationIndex, result: multResult });
        current.push(Part1Operator.Multiply);
        const mult = this.isCalibrated(trace, equationIndex, equation, index + 1, multResult, current, solutions);
        current.pop();
        trace.push({ kind: "select-operator-result", equationIndex, result: result });
        trace.push({ kind: "select-operator-out", equationIndex, operatorIndex: index - 1 });

        return addi || mult;
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const equations = this.parseInput(this.input);
        trace.push({ kind: "input", equations });

        let total = 0;
        for (let index = 0; index < equations.length; index++) {
            const equation = equations[index];
            trace.push({ kind: "select", equationIndex: index });

            const solutions: Part1Operator[][] = [];
            const ok = this.isCalibrated(trace, index, equation, 1, equation.operators[0], [], solutions);
            trace.push({ kind: "overall-ok", equationIndex: index, ok });
            if (ok) {
                total += equation.test;
                trace.push({ kind: "solution", equationIndex: index, solution: solutions[0] });
                trace.push({ kind: "select-operator-result", equationIndex: index, result: equation.test });
                trace.push({ kind: "total", total });
            } else {
                trace.push({ kind: "select-operator-result", equationIndex: index, result: 0 });
            }

            trace.push({ kind: "select-out", equationIndex: index });
        }

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private testsColumn?: HTMLUListElement;
    private operatorsColumn?: HTMLUListElement;
    private operations?: { item: HTMLLIElement, text: HTMLSpanElement }[][];
    private equals?: { item: HTMLLIElement, text: HTMLSpanElement }[];
    private resultColumn?: HTMLUListElement;
    private results?: { item: HTMLLIElement, text: HTMLSpanElement }[];

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
        this.testsColumn = undefined;
        this.operatorsColumn = undefined;
        this.operations = undefined;
        this.equals = undefined;
        this.resultColumn = undefined;
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
        case "select-operator":
            return this.selectOperator(step);
        case "select-operator-out":
            return this.selectOperatorOut(step);
        case "select-operator-result":
            return this.selectOperatorResult(step);
        case "select-operator-ok":
            return this.selectOperatorOk(step);
        case "overall-ok":
            return this.selectOverallOk(step);
        case "solution":
            return this.solution(step);
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part1TraceItemInput): number {
        for (let i = 0; i < step.equations.length; i++) {
            const testRow = document.createElement("li");
            testRow.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-end",  // Center items horizontally
                "items-center",    // Center items vertically
                "py-2",             // Padding inside the container
                "rounded-lg",      // Rounded corners
            );
            this.testsColumn!.appendChild(testRow);

            const testRowList = document.createElement("ul");
            testRowList.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
            );
            testRow.appendChild(testRowList);

            const testItem = utils.createNumberItem(step.equations[i].test.toString(), { ratio: "aspect-auto" });
            testItem.item.classList.add(
                "mr-2", // Add margin to the item
                "px-2",  // Padding inside the container
            );
            testRowList.appendChild(testItem.item);

            const equalItem = utils.createNumberItem("=", { color: "text-gray-400" });
            equalItem.item.classList.add("mx-2"); // Add margin to the item
            testRowList.appendChild(equalItem.item);
            this.equals!.push(equalItem);
        }

        for (let i = 0; i < step.equations.length; i++) {
            const resultRow = document.createElement("li");
            resultRow.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
                "py-2",             // Padding inside the container
                "rounded-lg",      // Rounded corners
            );
            this.resultColumn!.appendChild(resultRow);

            const resultRowList = document.createElement("ul");
            resultRowList.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
            );
            resultRow.appendChild(resultRowList);

            const resultItem = utils.createNumberItem("?", { ratio: "aspect-auto" }); // We don't know the result yet
            resultItem.item.classList.add("mx-2"); // Add margin to the item
            resultRowList.appendChild(resultItem.item);
            this.results!.push(resultItem);
        }

        for (let i = 0; i < step.equations.length; i++) {
            const operatorsRow = document.createElement("li");
            operatorsRow.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
                "py-2",             // Padding inside the container
                "rounded-lg",      // Rounded corners
            );
            this.operatorsColumn!.appendChild(operatorsRow);

            const operatorsRowList = document.createElement("ul");
            operatorsRowList.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
            );
            operatorsRow.appendChild(operatorsRowList);

            operatorsRowList.innerHTML = ""; // Clear the container

            const operationItems = [];
            for (let j = 0; j < step.equations[i].operators.length; j++) {
                const valueString = step.equations[i].operators[j].toString();
                const item = utils.createNumberItem(valueString, { ratio: "aspect-auto" });
                item.item.classList.add("mx-2"); // Add margin to the item
                operatorsRowList.appendChild(item.item);

                if (j < step.equations[i].operators.length - 1) {
                    const operatorItem = utils.createNumberItem("?", { color: "text-gray-400" });
                    operatorItem.item.classList.add("mx-2"); // Add margin to the item
                    operatorsRowList.appendChild(operatorItem.item);
                    operationItems.push(operatorItem);
                }
            }

            this.operations!.push(operationItems);
        }

        return 1000;
    }

    private select(step: Part1TraceItemSelect): number {
        this.equals![step.equationIndex].item.classList.add("scale-110");

        this.equals![step.equationIndex].item.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

        return 1000;
    }

    private selectOut(step: Part1TraceItemSelectOut): number {
        this.equals![step.equationIndex].item.classList.remove("scale-110");
        return 1000;
    }

    private selectOperator(step: Part1TraceItemSelectOperator): number {
        const operation = this.operations![step.equationIndex][step.operatorIndex];

        operation.item.classList.remove("bg-neutral-700");
        operation.item.classList.add("bg-yellow-500");
        operation.text.textContent = step.operator.toString();
        return 1000;
    }

    private selectOperatorOut(step: Part1TraceItemSelectOperatorOut): number {
        const operation = this.operations![step.equationIndex][step.operatorIndex];

        operation.item.classList.remove("bg-yellow-500");
        operation.item.classList.add("bg-neutral-700");
        operation.text.textContent = "?";
        return 1000;
    }

    private selectOperatorResult(step: Part1TraceItemSelectOperatorResult): number {
        this.results![step.equationIndex].text.textContent = step.result.toString();
        return 1000;
    }

    private selectOperatorOk(step: Part1TraceItemSelectOperatorOk): number {
        const equals = this.equals![step.equationIndex];

        equals.item.classList.remove("text-gray-400", "text-red-500", "text-green-500");
        if (step.ok) {
            equals.item.classList.add("text-green-500");
        } else {
            equals.item.classList.add("text-red-500");
        }

        return 1000;
    }

    private selectOverallOk(step: Part1TraceItemOverallOk): number {
        const equals = this.equals![step.equationIndex];

        equals.item.classList.remove("text-gray-400", "text-red-500", "text-green-500");
        if (step.ok) {
            equals.item.classList.add("text-green-500");
        } else {
            equals.item.classList.add("text-red-500");
        }

        return 1000;
    }

    private solution(step: Part1TraceItemSolution): number {
        const operations = this.operations![step.equationIndex];

        for (let i = 0; i < step.solution.length; i++) {
            const operation = operations[i];

            operation.item.classList.remove("text-gray-400");
            operation.item.classList.add("text-white");
            operation.text.textContent = step.solution[i].toString();
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

        // Create a row that will contain all the tests and the operators
        const container = document.createElement("div");
        container.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a column
            "w-full",          // Full width
            "items-start",    // Center items vertically
            "mt-4",             // Margin top
            "overflow-y-auto"  // Allow vertical scrolling
        );
        puzzleDiv.appendChild(container);

        // Create the reports columns that will contain all the tests values
        this.testsColumn = document.createElement("ul");
        this.testsColumn.classList.add(
            "flex1",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-end",    // Center items vertically
        );
        container.appendChild(this.testsColumn);

        // Create a column for the result of each equation
        this.resultColumn = document.createElement("ul");
        this.resultColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-start",    // Center items vertically
        );
        container.appendChild(this.resultColumn);

        // Create the reports columns that will contain all the operators values
        this.operatorsColumn = document.createElement("ul");
        this.operatorsColumn.classList.add(
            "flex",            // Flex container
            "grow",            // Allow the container to grow
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-end",    // Center items vertically
        );
        container.appendChild(this.operatorsColumn);

        this.equals = [];
        this.operations = [];
        this.results = [];
    }
}

enum Part2Operator {
    Add = "+",
    Multiply = "*",
    Concatenate = "||",
}

type Part2TraceItemInput = { kind: "input", equations:  Equation[] };
type Part2TraceItemSelect = { kind: "select", equationIndex: number };
type Part2TraceItemSelectOut = { kind: "select-out", equationIndex: number };
type Part2TraceItemSelectOperator = { kind: "select-operator", equationIndex: number, operatorIndex: number, operator: Part2Operator };
type Part2TraceItemSelectOperatorOut = { kind: "select-operator-out", equationIndex: number, operatorIndex: number };
type Part2TraceItemSelectOperatorResult = { kind: "select-operator-result", equationIndex: number, result: number };
type Part2TraceItemSelectOperatorOk = { kind: "select-operator-ok", equationIndex: number, ok: boolean };
type Part2TraceItemOverallOk = { kind: "overall-ok", equationIndex: number, ok: boolean };
type Part2TraceItemSolution = { kind: "solution", equationIndex: number, solution: Part2Operator[] };
type Part2TraceItemTotal = { kind: "total", total: number };

type Part2TraceItem = Part2TraceItemInput | Part2TraceItemSelect | Part2TraceItemSelectOut | Part2TraceItemSelectOperator | Part2TraceItemSelectOperatorOut | Part2TraceItemSelectOperatorResult | Part2TraceItemSelectOperatorOk | Part2TraceItemOverallOk | Part2TraceItemSolution | Part2TraceItemTotal;

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    private parseInput(input: string): Equation[] {
        return input.split("\n").map((line) => {
            const parts = line.split(": ");
            const test = parseInt(parts[0]);
            const operators = parts[1].split(" ").map((op) => parseInt(op));
            return { test, operators };
        });
    }

    constructor(input: string) {
        this.input = input;
    }

    private isCalibrated(trace: Trace<Part2TraceItem>, equationIndex: number, equation: Equation, index: number, result: number, current: Part2Operator[], solutions: Part2Operator[][]): boolean {
        if (index === equation.operators.length) {
            const ok = equation.test === result;
            trace.push({ kind: "select-operator-ok", equationIndex, ok });
            if (ok) {
                solutions.push([...current]);
            }
            return ok;
        }

        trace.push({ kind: "select-operator", equationIndex, operatorIndex: index - 1, operator: Part2Operator.Add });
        const addResult = result + equation.operators[index];
        trace.push({ kind: "select-operator-result", equationIndex, result: addResult });
        current.push(Part2Operator.Add);
        const addi = this.isCalibrated(trace, equationIndex, equation, index + 1, addResult, current, solutions);
        current.pop();
        trace.push({ kind: "select-operator-result", equationIndex, result: result });
        trace.push({ kind: "select-operator-out", equationIndex, operatorIndex: index - 1 });

        trace.push({ kind: "select-operator", equationIndex, operatorIndex: index - 1, operator: Part2Operator.Multiply });
        const multResult = result * equation.operators[index];
        trace.push({ kind: "select-operator-result", equationIndex, result: multResult });
        current.push(Part2Operator.Multiply);
        const mult = this.isCalibrated(trace, equationIndex, equation, index + 1, multResult, current, solutions);
        current.pop();
        trace.push({ kind: "select-operator-result", equationIndex, result: result });
        trace.push({ kind: "select-operator-out", equationIndex, operatorIndex: index - 1 });

        trace.push({ kind: "select-operator", equationIndex, operatorIndex: index - 1, operator: Part2Operator.Concatenate });
        const concatResult = parseInt(result.toString() + equation.operators[index].toString());
        trace.push({ kind: "select-operator-result", equationIndex, result: concatResult });
        current.push(Part2Operator.Concatenate);
        const concat = this.isCalibrated(trace, equationIndex, equation, index + 1, concatResult, current, solutions);
        current.pop();
        trace.push({ kind: "select-operator-result", equationIndex, result: result });
        trace.push({ kind: "select-operator-out", equationIndex, operatorIndex: index - 1 });

        return addi || mult || concat;
    }

    solve(): Trace<Part2TraceItem> {
        const trace: Trace<Part2TraceItem> = [];

        const equations = this.parseInput(this.input);
        trace.push({ kind: "input", equations });

        let total = 0;
        for (let index = 0; index < equations.length; index++) {
            const equation = equations[index];
            trace.push({ kind: "select", equationIndex: index });

            const solutions: Part2Operator[][] = [];
            const ok = this.isCalibrated(trace, index, equation, 1, equation.operators[0], [], solutions);
            trace.push({ kind: "overall-ok", equationIndex: index, ok });
            if (ok) {
                total += equation.test;
                trace.push({ kind: "solution", equationIndex: index, solution: solutions[0] });
                trace.push({ kind: "select-operator-result", equationIndex: index, result: equation.test });
                trace.push({ kind: "total", total });
            } else {
                trace.push({ kind: "select-operator-result", equationIndex: index, result: 0 });
            }

            trace.push({ kind: "select-out", equationIndex: index });
        }

        return trace;
    }
}

class Part2Animator implements PartAnimator<Part2TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private testsColumn?: HTMLUListElement;
    private operatorsColumn?: HTMLUListElement;
    private operations?: { item: HTMLLIElement, text: HTMLSpanElement }[][];
    private equals?: { item: HTMLLIElement, text: HTMLSpanElement }[];
    private resultColumn?: HTMLUListElement;
    private results?: { item: HTMLLIElement, text: HTMLSpanElement }[];

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
        this.testsColumn = undefined;
        this.operatorsColumn = undefined;
        this.operations = undefined;
        this.equals = undefined;
        this.resultColumn = undefined;
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
        case "select-operator":
            return this.selectOperator(step);
        case "select-operator-out":
            return this.selectOperatorOut(step);
        case "select-operator-result":
            return this.selectOperatorResult(step);
        case "select-operator-ok":
            return this.selectOperatorOk(step);
        case "overall-ok":
            return this.selectOverallOk(step);
        case "solution":
            return this.solution(step);
        case "total":
            return this.total(step);
        default:
            throw new Error(`Unknown step kind: ${(step as Part1TraceItem).kind}`);
        }
    }

    private createInput(step: Part2TraceItemInput): number {
        for (let i = 0; i < step.equations.length; i++) {
            const testRow = document.createElement("li");
            testRow.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-end",  // Center items horizontally
                "items-center",    // Center items vertically
                "py-2",             // Padding inside the container
                "rounded-lg",      // Rounded corners
            );
            this.testsColumn!.appendChild(testRow);

            const testRowList = document.createElement("ul");
            testRowList.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
            );
            testRow.appendChild(testRowList);

            const testItem = utils.createNumberItem(step.equations[i].test.toString(), { ratio: "aspect-auto" });
            testItem.item.classList.add(
                "mr-2", // Add margin to the item
                "px-2",  // Padding inside the container
            );
            testRowList.appendChild(testItem.item);

            const equalItem = utils.createNumberItem("=", { color: "text-gray-400" });
            equalItem.item.classList.add("mx-2"); // Add margin to the item
            testRowList.appendChild(equalItem.item);
            this.equals!.push(equalItem);
        }

        for (let i = 0; i < step.equations.length; i++) {
            const resultRow = document.createElement("li");
            resultRow.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
                "py-2",             // Padding inside the container
                "rounded-lg",      // Rounded corners
            );
            this.resultColumn!.appendChild(resultRow);

            const resultRowList = document.createElement("ul");
            resultRowList.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
            );
            resultRow.appendChild(resultRowList);

            const resultItem = utils.createNumberItem("?", { ratio: "aspect-auto" }); // We don't know the result yet
            resultItem.item.classList.add("mx-2"); // Add margin to the item
            resultRowList.appendChild(resultItem.item);
            this.results!.push(resultItem);
        }

        for (let i = 0; i < step.equations.length; i++) {
            const operatorsRow = document.createElement("li");
            operatorsRow.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
                "py-2",             // Padding inside the container
                "rounded-lg",      // Rounded corners
            );
            this.operatorsColumn!.appendChild(operatorsRow);

            const operatorsRowList = document.createElement("ul");
            operatorsRowList.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
            );
            operatorsRow.appendChild(operatorsRowList);

            operatorsRowList.innerHTML = ""; // Clear the container

            const operationItems = [];
            for (let j = 0; j < step.equations[i].operators.length; j++) {
                const valueString = step.equations[i].operators[j].toString();
                const item = utils.createNumberItem(valueString, { ratio: "aspect-auto" });
                item.item.classList.add("mx-2"); // Add margin to the item
                operatorsRowList.appendChild(item.item);

                if (j < step.equations[i].operators.length - 1) {
                    const operatorItem = utils.createNumberItem("?", { color: "text-gray-400" });
                    operatorItem.item.classList.add("mx-2"); // Add margin to the item
                    operatorsRowList.appendChild(operatorItem.item);
                    operationItems.push(operatorItem);
                }
            }

            this.operations!.push(operationItems);
        }

        return 1000;
    }

    private select(step: Part2TraceItemSelect): number {
        this.equals![step.equationIndex].item.classList.add("scale-110");

        this.equals![step.equationIndex].item.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

        return 1000;
    }

    private selectOut(step: Part2TraceItemSelectOut): number {
        this.equals![step.equationIndex].item.classList.remove("scale-110");
        return 1000;
    }

    private selectOperator(step: Part2TraceItemSelectOperator): number {
        const operation = this.operations![step.equationIndex][step.operatorIndex];

        operation.item.classList.remove("bg-neutral-700");
        operation.item.classList.add("bg-yellow-500");
        operation.text.textContent = step.operator.toString();
        return 1000;
    }

    private selectOperatorOut(step: Part2TraceItemSelectOperatorOut): number {
        const operation = this.operations![step.equationIndex][step.operatorIndex];

        operation.item.classList.remove("bg-yellow-500");
        operation.item.classList.add("bg-neutral-700");
        operation.text.textContent = "?";
        return 1000;
    }

    private selectOperatorResult(step: Part2TraceItemSelectOperatorResult): number {
        this.results![step.equationIndex].text.textContent = step.result.toString();
        return 1000;
    }

    private selectOperatorOk(step: Part2TraceItemSelectOperatorOk): number {
        const equals = this.equals![step.equationIndex];

        equals.item.classList.remove("text-gray-400", "text-red-500", "text-green-500");
        if (step.ok) {
            equals.item.classList.add("text-green-500");
        } else {
            equals.item.classList.add("text-red-500");
        }

        return 1000;
    }

    private selectOverallOk(step: Part2TraceItemOverallOk): number {
        const equals = this.equals![step.equationIndex];

        equals.item.classList.remove("text-gray-400", "text-red-500", "text-green-500");
        if (step.ok) {
            equals.item.classList.add("text-green-500");
        } else {
            equals.item.classList.add("text-red-500");
        }

        return 1000;
    }

    private solution(step: Part2TraceItemSolution): number {
        const operations = this.operations![step.equationIndex];

        for (let i = 0; i < step.solution.length; i++) {
            const operation = operations[i];

            operation.item.classList.remove("text-gray-400");
            operation.item.classList.add("text-white");
            operation.text.textContent = step.solution[i].toString();
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

        // Create a row that will contain all the tests and the operators
        const container = document.createElement("div");
        container.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a column
            "w-full",          // Full width
            "items-start",    // Center items vertically
            "mt-4",             // Margin top
            "overflow-y-auto"  // Allow vertical scrolling
        );
        puzzleDiv.appendChild(container);

        // Create the reports columns that will contain all the tests values
        this.testsColumn = document.createElement("ul");
        this.testsColumn.classList.add(
            "flex1",            // Flex container
            "flex-col",        // Arrange children in a column
            "items-end",    // Center items vertically
        );
        container.appendChild(this.testsColumn);

        // Create a column for the result of each equation
        this.resultColumn = document.createElement("ul");
        this.resultColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-start",    // Center items vertically
        );
        container.appendChild(this.resultColumn);

        // Create the reports columns that will contain all the operators values
        this.operatorsColumn = document.createElement("ul");
        this.operatorsColumn.classList.add(
            "flex",            // Flex container
            "grow",            // Allow the container to grow
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-end",    // Center items vertically
        );
        container.appendChild(this.operatorsColumn);

        this.equals = [];
        this.operations = [];
        this.results = [];
    }
}

const DESCRIPTION_PART1 = [
    utils.createParagraph("TODO"),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("TODO"),
];

const DEFAULT_INPUT_PART1 = "190: 10 19\n3267: 81 40 27\n83: 17 5\n156: 15 6\n7290: 6 8 6 15\n161011: 16 10 13\n192: 17 8 14\n21037: 9 7 18 13\n292: 11 6 16 20";
const DEFAULT_INPUT_PART2 = "190: 10 19\n3267: 81 40 27\n83: 17 5\n156: 15 6\n7290: 6 8 6 15\n161011: 16 10 13\n192: 17 8 14\n21037: 9 7 18 13\n292: 11 6 16 20";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT_PART1, DEFAULT_INPUT_PART2 };
