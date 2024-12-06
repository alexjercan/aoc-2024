// Part1
class Part1TraceItem {
    leftIndex: number;
    rightIndex: number;
    l1Distance: number;
    accumulatedDistance: number;

    constructor(leftIndex: number, rightIndex: number, l1Distance: number, accumulatedDistance: number) {
        this.leftIndex = leftIndex;
        this.rightIndex = rightIndex;
        this.l1Distance = l1Distance;
        this.accumulatedDistance = accumulatedDistance;
    }
}

class Part1Trace {
    leftColumn: number[];
    rightColumn: number[];
    steps: Part1TraceItem[];

    constructor(leftColumn: number[], rightColumn: number[]) {
        this.leftColumn = leftColumn;
        this.rightColumn = rightColumn;
        this.steps = [];
    }

    addStep(leftIndex: number, rightIndex: number, l1Distance: number, accumulatedDistance: number) {
        this.steps.push(new Part1TraceItem(leftIndex, rightIndex, l1Distance, accumulatedDistance));
    }
}

class Part1Solution {
    private input: string;

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): [number[], number[]] {
        return input.split("\n").reduce(([xs, ys], line) => {
            const [x, y] = line.split("   ").map(Number);
            xs.push(x);
            ys.push(y);
            return [xs, ys];
        }, [[], []] as [number[], number[]]);
    }

    solve(): Part1Trace {
        const [xs, ys] = this.parseInput(this.input);
        const trace = new Part1Trace(xs, ys);

        const leftIndexes = xs
            .map((value, index) => ({ value, index }))
            .sort((a, b) => a.value - b.value)
            .map(item => item.index);

        const rightIndexes = ys
            .map((value, index) => ({ value, index }))
            .sort((a, b) => a.value - b.value)
            .map(item => item.index);

        let accumulatedDistance = 0;
        for (let i = 0; i < leftIndexes.length; i++) {
            const leftIndex = leftIndexes[i];
            const rightIndex = rightIndexes[i];

            const left = xs[leftIndex];
            const right = ys[rightIndex];
            const l1Distance = Math.abs(left - right);

            accumulatedDistance += l1Distance;
            trace.addStep(leftIndex, rightIndex, l1Distance, accumulatedDistance);
        }

        return trace;
    }
}

// Part2

class Part2TraceItem {
    leftIndex: number;
    rightIndices: number[];
    similarityScore: number;
    accumulatedScore: number;

    constructor(leftIndex: number, rightIndices: number[], similarityScore: number, accumulatedScore: number) {
        this.leftIndex = leftIndex;
        this.rightIndices = rightIndices;
        this.similarityScore = similarityScore;
        this.accumulatedScore = accumulatedScore;
    }
}

class Part2Trace {
    leftColumn: number[];
    rightColumn: number[];
    steps: Part2TraceItem[];

    constructor(leftColumn: number[], rightColumn: number[]) {
        this.leftColumn = leftColumn;
        this.rightColumn = rightColumn;
        this.steps = [];
    }

    addStep(leftIndex: number, rightIndices: number[], similarityScore: number, accumulatedScore: number) {
        this.steps.push(new Part2TraceItem(leftIndex, rightIndices, similarityScore, accumulatedScore));
    }
}

class Part2Solution {
    private input: string;

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): [number[], number[]] {
        return input.split("\n").reduce(([xs, ys], line) => {
            const [x, y] = line.split("   ").map(Number);
            xs.push(x);
            ys.push(y);
            return [xs, ys];
        }, [[], []] as [number[], number[]]);
    }

    solve(): Part2Trace {
        const [xs, ys] = this.parseInput(this.input);
        const trace = new Part2Trace(xs, ys);

        let accumulatedScore = 0;
        for (let leftIndex = 0; leftIndex < xs.length; leftIndex++) {
            // Find all the occurrences of the current value in the right column
            const rightIndices = ys
                .map((value, index) => ({ value, index }))
                .filter(item => item.value === xs[leftIndex])
                .map(item => item.index);

            // Calculate the similarity score = left * right occurrences
            const similarityScore = xs[leftIndex] * rightIndices.length;

            // Calculate the accumulated score
            accumulatedScore += similarityScore;

            trace.addStep(leftIndex, rightIndices, similarityScore, accumulatedScore);
        }

        return trace;
    }
}

// HTML
class Part {
    inputDiv: HTMLDivElement;
    textareaInput: HTMLTextAreaElement;
    solutionDiv: HTMLDivElement;
    controlDiv: HTMLDivElement;
    solveButton: HTMLButtonElement;
    stepButton: HTMLButtonElement;
    resetButton: HTMLButtonElement;

    constructor(name: string) {
        this.inputDiv = document.getElementById(`${name}-input`) as HTMLDivElement;
        this.textareaInput = document.getElementById(`${name}-textarea`) as HTMLTextAreaElement;
        this.solutionDiv = document.getElementById(`${name}-solution`) as HTMLDivElement;
        this.controlDiv = document.getElementById(`${name}-control`) as HTMLDivElement;
        this.solveButton = document.getElementById(`${name}-solve`) as HTMLButtonElement;
        this.stepButton = document.getElementById(`${name}-step`) as HTMLButtonElement;
        this.resetButton = document.getElementById(`${name}-reset`) as HTMLButtonElement;

        this.textareaInput.rows = 6;
        this.textareaInput.value = "3   4\n4   3\n2   5\n1   3\n3   9\n3   3";
    }
}

class Part1Animator {
    private abortController: AbortController;
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;
    private stepState?: { trace: Part1Trace, stepIndex: number, kind?: "in" | "out" };
    private animationState?: { answerNumber: HTMLSpanElement, leftItems: { item: HTMLLIElement, text: HTMLSpanElement }[], rightItems: { item: HTMLLIElement, text: HTMLSpanElement }[], lhsItem: { text: HTMLSpanElement }, rhsItem: { text: HTMLSpanElement }, l1Item: { text: HTMLSpanElement } };

    constructor(inputDiv: HTMLDivElement, solutionDiv: HTMLDivElement) {
        this.abortController = new AbortController();
        this.inputDiv = inputDiv;
        this.solutionDiv = solutionDiv;

        this.reset();
    }

    reset() {
        this.abortController.abort();
        this.abortController = new AbortController();

        this.inputDiv.classList.remove("hidden");
        this.solutionDiv.classList.add("hidden");
        this.solutionDiv.innerHTML = ""; // Clear previous animations

        this.stepState = undefined;
        this.animationState = undefined;
    }

    async solve(input: string) {
        if (!this.stepState) {
            this.reset();

            this.inputDiv.classList.add("hidden");
            this.solutionDiv.classList.remove("hidden");

            const trace = new Part1Solution(input).solve();
            this.stepState = { trace, stepIndex: 0 };

            this.animationState = this.beginAnimate();
        }

        const abortController = this.abortController;
        while (this.stepState.stepIndex < this.stepState.trace.steps.length) {
            if (abortController.signal.aborted) {
                return;
            }
            await this.animateStep();
        }
    }

    step(input: string) {
        if (this.stepState && this.stepState.stepIndex >= this.stepState.trace.steps.length) {
            return;
        }

        if (!this.stepState) {
            this.reset();

            this.inputDiv.classList.add("hidden");
            this.solutionDiv.classList.remove("hidden");

            const trace = new Part1Solution(input).solve();
            this.stepState = { trace, stepIndex: 0, kind: "in" };

            this.animationState = this.beginAnimate();
        }

        // Make sure to cancel the previous animation
        this.abortController.abort();
        this.abortController = new AbortController();

        if (this.stepState.kind === "in") {
            this.stepState.kind = "out";
            this.animateStepIn();
        } else {
            this.stepState.kind = "in";
            this.animateStepOut();
        }
    }

    private createNumberItem(value: string): { item: HTMLLIElement, text: HTMLSpanElement } {
        const item = document.createElement("li");
        item.classList.add(
            "flex",            // Flex container
            "items-center",    // Center items vertically
            "justify-center",  // Center items horizontally
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "w-16",            // Fixed width
            "h-16",            // Fixed height
            "rounded-xl",      // Rounded corners
            "shadow-2xl",      // Shadow
            "transition-all",  // Smooth transition
            "ease-in-out",     // Ease-in-out timing function
            "duration-300",    // 300ms transition duration
            "bg-neutral-700"   // Background color
        );

        const text = document.createElement("span");
        text.textContent = value;
        item.appendChild(text);

        return { item, text };
    }

    private createColumnItems(container: HTMLUListElement, values: number[]): { item: HTMLLIElement, text: HTMLSpanElement }[] {
        container.innerHTML = ""; // Clear the container
        return values.map(value => {
            const item = this.createNumberItem(value.toString());
            container.appendChild(item.item);
            return item;
        });
    }

    private updateMiddlePad(
        lhsItem: { text: HTMLSpanElement },
        rhsItem: { text: HTMLSpanElement },
        l1Item: { text: HTMLSpanElement },
        leftValue: string,
        rightValue: string,
        l1Value: string
    ) {
        lhsItem.text.textContent = leftValue;
        rhsItem.text.textContent = rightValue;
        l1Item.text.textContent = l1Value;
    }

    private beginAnimate() {
        const trace = this.stepState!.trace;

        const answerNumber = this.createAnswerContainer();
        const { leftColumn, rightColumn, lhsItem, rhsItem, l1Item } = this.createPuzzleLayout();

        const leftItems = this.createColumnItems(leftColumn, trace.leftColumn);
        const rightItems = this.createColumnItems(rightColumn, trace.rightColumn);

        return { answerNumber, leftItems, rightItems, lhsItem, rhsItem, l1Item };
    }

    private async animateStep() {
        this.animateStepIn();
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.animateStepOut();
    }

    private animateStepIn() {
        // Deconstruct the step
        const { trace, stepIndex } = this.stepState!;
        const { leftIndex, rightIndex, l1Distance } = trace.steps[stepIndex];
        const { leftItems, rightItems, lhsItem, rhsItem, l1Item } = this.animationState!;

        // Highlight the current selected items and increase the scale of them a little
        this.highlighItemIn(leftItems, leftIndex);
        this.highlighItemIn(rightItems, rightIndex);

        // Update middle pad
        this.updateMiddlePad(
            lhsItem,
            rhsItem,
            l1Item,
            trace.leftColumn[leftIndex].toString(),
            trace.rightColumn[rightIndex].toString(),
            l1Distance.toString()
        );
    }

    private animateStepOut() {
        // Deconstruct the step
        const { trace, stepIndex } = this.stepState!;
        const { leftIndex, rightIndex, accumulatedDistance } = trace.steps[stepIndex];
        const { answerNumber, leftItems, rightItems, lhsItem, rhsItem, l1Item } = this.animationState!;

        // Update accumulated distance
        answerNumber.textContent = accumulatedDistance.toString();

        this.highlighItemPopOut(leftItems, leftIndex);
        this.highlighItemPopOut(rightItems, rightIndex);

        // Clear middle pad
        this.updateMiddlePad(lhsItem, rhsItem, l1Item, "", "", "");

        this.stepState!.stepIndex++;
    }

    private highlighItemIn(elements: { item: HTMLLIElement, text: HTMLSpanElement }[], index: number) {
        elements[index].item.classList.remove("bg-neutral-700");
        elements[index].item.classList.add(
            "bg-green-500",    // Green background on highlight
            "transform",       // Enable scaling
            "scale-110"        // Slightly enlarge the item
        );
    }

    private highlighItemPopOut(elements: { item: HTMLLIElement, text: HTMLSpanElement }[], index: number) {
        const item = elements[index].item;

        // Add a transition to scale and opacity, then shrink the item
        item.classList.add(
            "transform", // Enable scaling
            "scale-0", // Shrink the item to 0
            "opacity-0", // Fade the item out
        );

        // After the transition ends, hide the element to make space
        setTimeout(() => {
            item.classList.add("hidden");
        }, 300); // Match the duration of the transition
    }

    private createAnswerContainer(): HTMLSpanElement {
        const answerDiv = document.createElement("div");
        answerDiv.classList.add(
            "text-2xl",       // Large text size
            "font-semibold",  // Semi-bold text
            "text-center",    // Centered text
            "mb-4",           // Margin bottom
            "text-green-500"  // Green text color
        );
        this.solutionDiv.appendChild(answerDiv);

        const answerText = document.createElement("span");
        answerText.textContent = "Answer: ";
        answerDiv.appendChild(answerText);

        const answerNumber = document.createElement("span");
        answerNumber.textContent = "0";
        answerDiv.appendChild(answerNumber);

        return answerNumber;
    }

    private createPuzzleLayout() {
        // Create the main puzzle container
        const puzzleDiv = document.createElement("div");
        puzzleDiv.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-between", // Space between the columns
            "items-start",     // Align items to the start (top)
            "space-x-4",       // Horizontal space between children
            "w-full",          // Full width
            "grow",            // Allow the container to grow
            "py-4"             // Vertical padding
        );
        this.solutionDiv.appendChild(puzzleDiv);

        // Create the left column container
        const leftColumn = document.createElement("ul");
        leftColumn.classList.add(
            "flex",            // Flex container
            "grow",            // Allow the container to grow
            "flex-col",        // Arrange children in a column
            "space-y-2",       // Vertical space between items
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
            "p-4",             // Padding inside the column
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
            "transition-all",  // Smooth transition effect
            "ease-in-out",     // Timing function for transition
            "duration-300"     // 300ms duration for transitions
        );
        puzzleDiv.appendChild(leftColumn);

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
            "shadow-lg"        // Large shadow effect
        );
        puzzleDiv.appendChild(middlePad);

        // Create the right column container
        const rightColumn = document.createElement("ul");
        rightColumn.classList.add(
            "flex",            // Flex container
            "grow",            // Allow the container to grow
            "flex-col",        // Arrange children in a column
            "space-y-2",       // Vertical space between items
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
            "p-4",             // Padding inside the column
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
            "transition-all",  // Smooth transition effect
            "ease-in-out",     // Timing function for transition
            "duration-300"     // 300ms duration for transitions
        );
        puzzleDiv.appendChild(rightColumn);

        // Create the top row of the middle pad
        const middleTopRow = document.createElement("ul");
        middleTopRow.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mb-4"             // Margin bottom
        );
        middlePad.appendChild(middleTopRow);

        const absBarL = document.createElement("li");
        absBarL.classList.add(
            "h-16",            // Fixed height
            "w-1",             // Fixed width
            "bg-red-500"       // Background color
        );
        middleTopRow.appendChild(absBarL);


        // Create left-hand side number item
        const lhsItem = this.createNumberItem("");
        middleTopRow.appendChild(lhsItem.item);

        // Create minus sign item
        const minusItem = document.createElement("li");
        minusItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-red-500"     // Red color for minus sign
        );
        minusItem.textContent = "-";
        middleTopRow.appendChild(minusItem);

        // Create right-hand side number item
        const rhsItem = this.createNumberItem("");
        middleTopRow.appendChild(rhsItem.item);

        const absBarR = document.createElement("li");
        absBarR.classList.add(
            "h-16",            // Fixed height
            "w-1",             // Fixed width
            "bg-red-500"       // Background color
        );
        middleTopRow.appendChild(absBarR);

        // Create the bottom row of the middle pad
        const middleBottomRow = document.createElement("ul");
        middleBottomRow.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mt-4"             // Margin top
        );
        middlePad.appendChild(middleBottomRow);

        // Create equal sign item
        const equalItem = document.createElement("li");
        equalItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-yellow-500"  // Yellow color for equal sign
        );
        equalItem.textContent = "=";
        middleBottomRow.appendChild(equalItem);

        // Create L1 distance item
        const l1Item = this.createNumberItem("");
        middleBottomRow.appendChild(l1Item.item);

        return { leftColumn, rightColumn, lhsItem, rhsItem, l1Item };
    }
}

class Part2Animator {
    private abortController: AbortController;
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;
    private stepState?: { trace: Part2Trace, stepIndex: number, kind?: "in" | "out" };
    private animationState?: { answerNumber: HTMLSpanElement, leftItems: { item: HTMLLIElement, text: HTMLSpanElement }[], rightItems: { item: HTMLLIElement, text: HTMLSpanElement }[], lhsItem: { text: HTMLSpanElement }, rhsItem: { text: HTMLSpanElement }, l1Item: { text: HTMLSpanElement } };

    constructor(inputDiv: HTMLDivElement, solutionDiv: HTMLDivElement) {
        this.abortController = new AbortController();
        this.inputDiv = inputDiv;
        this.solutionDiv = solutionDiv;

        this.reset();
    }

    reset() {
        this.abortController.abort();
        this.abortController = new AbortController();

        this.inputDiv.classList.remove("hidden");
        this.solutionDiv.classList.add("hidden");
        this.solutionDiv.innerHTML = ""; // Clear previous animations

        this.stepState = undefined;
        this.animationState = undefined;
    }

    async solve(input: string) {
        if (!this.stepState) {
            this.reset();

            this.inputDiv.classList.add("hidden");
            this.solutionDiv.classList.remove("hidden");


            const trace = new Part2Solution(input).solve();
            this.stepState = { trace, stepIndex: 0 };

            this.animationState = this.beginAnimate();
        }

        const abortController = this.abortController;
        while (this.stepState.stepIndex < this.stepState.trace.steps.length) {
            if (abortController.signal.aborted) {
                return;
            }
            await this.animateStep();
        }
    }

    step(input: string) {
        if (this.stepState && this.stepState.stepIndex >= this.stepState.trace.steps.length) {
            return;
        }

        if (!this.stepState) {
            this.reset();

            this.inputDiv.classList.add("hidden");
            this.solutionDiv.classList.remove("hidden");

            const trace = new Part2Solution(input).solve();
            this.stepState = { trace, stepIndex: 0, kind: "in" };

            this.animationState = this.beginAnimate();
        }

        // Make sure to cancel the previous animation
        this.abortController.abort();
        this.abortController = new AbortController();

        if (this.stepState.kind === "in") {
            this.stepState.kind = "out";
            this.animateStepIn();
        } else {
            this.stepState.kind = "in";
            this.animateStepOut();
        }
    }

    private createNumberItem(value: string): { item: HTMLLIElement, text: HTMLSpanElement } {
        const item = document.createElement("li");
        item.classList.add(
            "flex",            // Flex container
            "items-center",    // Center items vertically
            "justify-center",  // Center items horizontally
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "w-16",            // Fixed width
            "h-16",            // Fixed height
            "rounded-xl",      // Rounded corners
            "shadow-2xl",      // Shadow
            "transition-all",  // Smooth transition
            "ease-in-out",     // Ease-in-out timing function
            "duration-300",    // 300ms transition duration
            "bg-neutral-700"   // Background color
        );

        const text = document.createElement("span");
        text.textContent = value;
        item.appendChild(text);

        return { item, text };
    }

    private createColumnItems(container: HTMLUListElement, values: number[]): { item: HTMLLIElement, text: HTMLSpanElement }[] {
        container.innerHTML = ""; // Clear the container
        return values.map(value => {
            const item = this.createNumberItem(value.toString());
            container.appendChild(item.item);
            return item;
        });
    }

    private updateMiddlePad(
        lhsItem: { text: HTMLSpanElement },
        rhsItem: { text: HTMLSpanElement },
        l1Item: { text: HTMLSpanElement },
        leftValue: string,
        rightValue: string,
        l1Value: string
    ) {
        lhsItem.text.textContent = leftValue;
        rhsItem.text.textContent = rightValue;
        l1Item.text.textContent = l1Value;
    }

    private beginAnimate() {
        const trace = this.stepState!.trace;

        const answerNumber = this.createAnswerContainer();
        const { leftColumn, rightColumn, lhsItem, rhsItem, l1Item } = this.createPuzzleLayout();

        const leftItems = this.createColumnItems(leftColumn, trace.leftColumn);
        const rightItems = this.createColumnItems(rightColumn, trace.rightColumn);

        return { answerNumber, leftItems, rightItems, lhsItem, rhsItem, l1Item };
    }

    private async animateStep() {
        this.animateStepIn();
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.animateStepOut();
    }

    private animateStepIn() {
        // Deconstruct the step
        const { trace, stepIndex } = this.stepState!;
        const { leftIndex, rightIndices, similarityScore } = trace.steps[stepIndex];
        const { leftItems, rightItems, lhsItem, rhsItem, l1Item } = this.animationState!;

        // Highlight the current selected items and increase the scale of them a little
        this.highlighItemIn(leftItems, leftIndex);
        for (const rightIndex of rightIndices) {
            this.highlighItemIn(rightItems, rightIndex);
        }

        // Update middle pad
        this.updateMiddlePad(
            lhsItem,
            rhsItem,
            l1Item,
            trace.leftColumn[leftIndex].toString(),
            rightIndices.length.toString(),
            similarityScore.toString()
        );
    }

    private animateStepOut() {
        // Deconstruct the step
        const { trace, stepIndex } = this.stepState!;
        const { leftIndex, rightIndices, accumulatedScore } = trace.steps[stepIndex];
        const { answerNumber, leftItems, rightItems, lhsItem, rhsItem, l1Item } = this.animationState!;

        // Update accumulated distance
        answerNumber.textContent = accumulatedScore.toString();

        this.highlighItemPopOut(leftItems, leftIndex);
        for (const rightIndex of rightIndices) {
            this.highlightItemOut(rightItems, rightIndex);
        }

        // Clear middle pad
        this.updateMiddlePad(lhsItem, rhsItem, l1Item, "", "", "");

        this.stepState!.stepIndex++;
    }

    private highlighItemIn(elements: { item: HTMLLIElement, text: HTMLSpanElement }[], index: number) {
        elements[index].item.classList.remove("bg-neutral-700");
        elements[index].item.classList.add(
            "bg-green-500",    // Green background on highlight
            "transform",       // Enable scaling
            "scale-110"        // Slightly enlarge the item
        );
    }

    private highlighItemPopOut(elements: { item: HTMLLIElement, text: HTMLSpanElement }[], index: number) {
        const item = elements[index].item;

        // Add a transition to scale and opacity, then shrink the item
        item.classList.add(
            "transform", // Enable scaling
            "scale-0", // Shrink the item to 0
            "opacity-0", // Fade the item out
        );

        // After the transition ends, hide the element to make space
        setTimeout(() => {
            item.classList.add("hidden");
        }, 300); // Match the duration of the transition
    }

    private highlightItemOut(elements: { item: HTMLLIElement, text: HTMLSpanElement }[], index: number) {
        elements[index].item.classList.remove("bg-green-500");
        elements[index].item.classList.add("bg-neutral-700");
    }

    private createAnswerContainer(): HTMLSpanElement {
        const answerDiv = document.createElement("div");
        answerDiv.classList.add(
            "text-2xl",       // Large text size
            "font-semibold",  // Semi-bold text
            "text-center",    // Centered text
            "mb-4",           // Margin bottom
            "text-green-500"  // Green text color
        );
        this.solutionDiv.appendChild(answerDiv);

        const answerText = document.createElement("span");
        answerText.textContent = "Answer: ";
        answerDiv.appendChild(answerText);

        const answerNumber = document.createElement("span");
        answerNumber.textContent = "0";
        answerDiv.appendChild(answerNumber);

        return answerNumber;
    }

    private createPuzzleLayout() {
        // Create the main puzzle container
        const puzzleDiv = document.createElement("div");
        puzzleDiv.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-between", // Space between the columns
            "items-start",     // Align items to the start (top)
            "space-x-4",       // Horizontal space between children
            "w-full",          // Full width
            "grow",            // Allow the container to grow
            "py-4"             // Vertical padding
        );
        this.solutionDiv.appendChild(puzzleDiv);

        // Create the left column container
        const leftColumn = document.createElement("ul");
        leftColumn.classList.add(
            "flex",            // Flex container
            "grow",            // Allow the container to grow
            "flex-col",        // Arrange children in a column
            "space-y-2",       // Vertical space between items
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
            "p-4",             // Padding inside the column
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
            "transition-all",  // Smooth transition effect
            "ease-in-out",     // Timing function for transition
            "duration-300"     // 300ms duration for transitions
        );
        puzzleDiv.appendChild(leftColumn);

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
            "shadow-lg"        // Large shadow effect
        );
        puzzleDiv.appendChild(middlePad);

        // Create the right column container
        const rightColumn = document.createElement("ul");
        rightColumn.classList.add(
            "flex",            // Flex container
            "grow",            // Allow the container to grow
            "flex-col",        // Arrange children in a column
            "space-y-2",       // Vertical space between items
            "items-center",    // Center items horizontally
            "w-1/3",           // Width is 1/3 of the parent container
            "p-4",             // Padding inside the column
            "bg-neutral-800",  // Dark background
            "rounded-lg",      // Rounded corners
            "shadow-lg",       // Large shadow effect
            "transition-all",  // Smooth transition effect
            "ease-in-out",     // Timing function for transition
            "duration-300"     // 300ms duration for transitions
        );
        puzzleDiv.appendChild(rightColumn);

        // Create the top row of the middle pad
        const middleTopRow = document.createElement("ul");
        middleTopRow.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mb-4"             // Margin bottom
        );
        middlePad.appendChild(middleTopRow);

        // Create left-hand side number item
        const lhsItem = this.createNumberItem("");
        middleTopRow.appendChild(lhsItem.item);

        // Create x sign item
        const multiplyItem = document.createElement("li");
        multiplyItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-red-500"     // Red color for minus sign
        );
        multiplyItem.textContent = "x";
        middleTopRow.appendChild(multiplyItem);

        // Create right-hand side number item
        const rhsItem = this.createNumberItem("");
        middleTopRow.appendChild(rhsItem.item);

        // Create the bottom row of the middle pad
        const middleBottomRow = document.createElement("ul");
        middleBottomRow.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mt-4"             // Margin top
        );
        middlePad.appendChild(middleBottomRow);

        // Create equal sign item
        const equalItem = document.createElement("li");
        equalItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-yellow-500"  // Yellow color for equal sign
        );
        equalItem.textContent = "=";
        middleBottomRow.appendChild(equalItem);

        // Create L1 distance item
        const l1Item = this.createNumberItem("");
        middleBottomRow.appendChild(l1Item.item);

        return { leftColumn, rightColumn, lhsItem, rhsItem, l1Item };
    }
}

const part1 = new Part("part1");
const part1Animator = new Part1Animator(part1.inputDiv, part1.solutionDiv);
part1.solveButton.onclick = () => part1Animator.solve(part1.textareaInput.value);
part1.stepButton.onclick = () => part1Animator.step(part1.textareaInput.value);
part1.resetButton.onclick = () => part1Animator.reset();

const part2 = new Part("part2");
const part2Animator = new Part2Animator(part2.inputDiv, part2.solutionDiv);
part2.solveButton.onclick = () => part2Animator.solve(part2.textareaInput.value);
part2.stepButton.onclick = () => part2Animator.step(part2.textareaInput.value);
part2.resetButton.onclick = () => part2Animator.reset();
