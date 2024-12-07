type Trace<T> = T[];

interface Solution<T> {
    solve(): Trace<T>;
}

interface PartAnimator<T> {
    reset(): void;
    begin(): void;
    step(step: T): void;
}

class Animator<T> {
    private abortController: AbortController;
    private part: PartAnimator<T>;
    private solution: Solution<T>;

    private state?: { trace: Trace<T>, stepIndex: number };

    constructor(solution: Solution<T>, part: PartAnimator<T>) {
        this.abortController = new AbortController();
        this.part = part;
        this.solution = solution;

        this.reset();
    }

    reset() {
        this.abortController.abort();
        this.abortController = new AbortController();

        this.state = undefined;

        this.part.reset();
    }

    async solve() {
        if (this.state && this.state.stepIndex >= this.state.trace.length || !this.state) {
            this.reset();

            const trace = this.solution.solve();
            this.state = { trace, stepIndex: 0 };

            this.part.begin();
        }

        const abortController = this.abortController;
        while (!abortController.signal.aborted && this.state.stepIndex < this.state.trace.length) {
            const step = this.state.trace[this.state.stepIndex];

            this.part.step(step);
            this.state.stepIndex++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    step() {
        if (this.state && this.state.stepIndex >= this.state.trace.length) {
            this.reset();
        }

        if (!this.state) {
            this.reset();

            const trace = this.solution.solve();
            this.state = { trace, stepIndex: 0 };

            this.part.begin();
        }

        this.abortController.abort();
        this.part.step(this.state.trace[this.state.stepIndex]);
        this.state.stepIndex++;
        this.abortController = new AbortController();
    }
}

function createNumberItem(value: string): { item: HTMLLIElement, text: HTMLSpanElement } {
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

function createColumnItems(container: HTMLUListElement, values: number[]): { item: HTMLLIElement, text: HTMLSpanElement }[] {
    container.innerHTML = ""; // Clear the container
    return values.map(value => {
        const item = createNumberItem(value.toString());
        container.appendChild(item.item);
        return item;
    });
}

function highlightItemIn(element: { item: HTMLLIElement, text: HTMLSpanElement }) {
    element.item.classList.remove("bg-neutral-700");
    element.item.classList.add(
        "bg-green-500",    // Green background on highlight
        "transform",       // Enable scaling
        "scale-110"        // Slightly enlarge the item
    );
}

function highlightItemOut(element: { item: HTMLLIElement, text: HTMLSpanElement }) {
    element.item.classList.remove("bg-green-500");
    element.item.classList.add("bg-neutral-700");
}

function highlightItemPopOut(element: { item: HTMLLIElement, text: HTMLSpanElement }) {
    const item = element.item;

    // Add a transition to scale and opacity, then shrink the item
    item.classList.add(
        "transform-all", // Enable scaling
        "scale-0", // Shrink the item to 0
        "opacity-0", // Fade the item out
    );

    // After the transition ends, hide the element to make space
    setTimeout(() => {
        item.classList.add("hidden");
    }, 300); // Match the duration of the transition
}

type Part1TraceItemInput = {
    kind: "input";
    leftColumn: number[];
    rightColumn: number[];
};

type Part1TraceItemSelect = {
    kind: "select";
    leftIndex: number;
    rightIndex: number;
};

type Part1TraceItemPop = {
    kind: "pop";
    leftIndex: number;
    rightIndex: number;
};

type Part1TraceItemL1Distance = {
    kind: "l1-distance";
    leftNumber: number;
    rightNumber: number;
    l1Distance: number;
};

type Part1TraceItemAccumulatedDistance = {
    kind: "accumulated-distance";
    accumulatedDistance: number;
};

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemSelect | Part1TraceItemPop | Part1TraceItemL1Distance | Part1TraceItemAccumulatedDistance;

class Part1Solution implements Solution<Part1TraceItem> {
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

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const [xs, ys] = this.parseInput(this.input);
        trace.push({ kind: "input", leftColumn: xs, rightColumn: ys });

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
            trace.push({ kind: "select", leftIndex, rightIndex });

            const left = xs[leftIndex];
            const right = ys[rightIndex];
            trace.push({ kind: "pop", leftIndex, rightIndex });

            const l1Distance = Math.abs(left - right);
            trace.push({ kind: "l1-distance", leftNumber: left, rightNumber: right, l1Distance });

            accumulatedDistance += l1Distance;
            trace.push({ kind: "accumulated-distance", accumulatedDistance });
        }

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private leftColumn?: HTMLUListElement;
    private rightColumn?: HTMLUListElement;
    private leftItems?: { item: HTMLLIElement, text: HTMLSpanElement }[];
    private rightItems?: { item: HTMLLIElement, text: HTMLSpanElement }[];
    private lhsItem?: HTMLSpanElement;
    private rhsItem?: HTMLSpanElement;
    private l1Item?: HTMLSpanElement;

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
        this.leftColumn = undefined;
        this.rightColumn = undefined;
        this.leftItems = undefined;
        this.rightItems = undefined;
        this.lhsItem = undefined;
        this.rhsItem = undefined;
        this.l1Item = undefined;
    }

    begin(): void {
        this.reset();

        this.create();

        this.inputDiv.classList.add("hidden");
        this.solutionDiv.classList.remove("hidden");
    }

    step(step: Part1TraceItem): void {
        switch (step.kind) {
        case "input":
            this.createInput(step);
            break;
        case "select":
            this.animateSelect(step);
            break;
        case "pop":
            this.animatePop(step);
            break;
        case "l1-distance":
            this.animateL1Distance(step);
            break;
        case "accumulated-distance":
            this.animateAccumulatedDistance(step);
            break;
        }
    }

    private createInput(input: Part1TraceItemInput) {
        this.leftItems = createColumnItems(this.leftColumn!, input.leftColumn);
        this.rightItems = createColumnItems(this.rightColumn!, input.rightColumn);
    }

    private animateSelect(select: Part1TraceItemSelect) {
        highlightItemIn(this.leftItems![select.leftIndex]);
        highlightItemIn(this.rightItems![select.rightIndex]);
    }

    private animatePop(pop: Part1TraceItemPop) {
        highlightItemPopOut(this.leftItems![pop.leftIndex]);
        highlightItemPopOut(this.rightItems![pop.rightIndex]);
    }

    private animateL1Distance(l1Distance: Part1TraceItemL1Distance) {
        this.lhsItem!.textContent = l1Distance.leftNumber.toString();
        this.rhsItem!.textContent = l1Distance.rightNumber.toString();
        this.l1Item!.textContent = l1Distance.l1Distance.toString();
    }

    private animateAccumulatedDistance(accumulatedDistance: Part1TraceItemAccumulatedDistance) {
        this.lhsItem!.textContent = "";
        this.rhsItem!.textContent = "";
        this.l1Item!.textContent = "";
        this.answerNumber!.textContent = accumulatedDistance.accumulatedDistance.toString();
    }

    private create() {
        // Create the answer container
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

        this.answerNumber = document.createElement("span");
        this.answerNumber.textContent = "0";
        answerDiv.appendChild(this.answerNumber);

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
        this.leftColumn = document.createElement("ul");
        this.leftColumn.classList.add(
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
        puzzleDiv.appendChild(this.leftColumn);

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
        this.rightColumn = document.createElement("ul");
        this.rightColumn.classList.add(
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
        puzzleDiv.appendChild(this.rightColumn);

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
        const lhsItem = createNumberItem("");
        this.lhsItem = lhsItem.text;
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
        const rhsItem = createNumberItem("");
        this.rhsItem = rhsItem.text;
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
        const l1Item = createNumberItem("");
        this.l1Item = l1Item.text;
        middleBottomRow.appendChild(l1Item.item);

        this.leftItems = [];
        this.rightItems = [];
    }
}



// Part2

type Part2TraceItemInput = {
    kind: "input";
    leftColumn: number[];
    rightColumn: number[];
};

type Part2TraceItemSelect = {
    kind: "select";
    leftIndex: number;
};

type Part2TraceItemFind = {
    kind: "find";
    rightIndices: number[];
};

type Part2TraceItemPop = {
    kind: "pop";
    leftIndex: number;
    rightIndices: number[];
};

type Part2TraceItemSimilarity = {
    kind: "similarity";
    leftNumber: number;
    rightNumber: number;
    similarityScore: number;
};

type Part2TraceItemAccumulated = {
    kind: "accumulated";
    accumulatedScore: number;
};

type Part2TraceItem = Part2TraceItemInput | Part2TraceItemSelect | Part2TraceItemFind | Part2TraceItemPop | Part2TraceItemSimilarity | Part2TraceItemAccumulated;

class Part2Solution implements Solution<Part2TraceItem> {
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

    solve(): Trace<Part2TraceItem> {
        const trace: Trace<Part2TraceItem> = [];

        const [xs, ys] = this.parseInput(this.input);
        trace.push({ kind: "input", leftColumn: xs, rightColumn: ys });

        let accumulatedScore = 0;
        for (let leftIndex = 0; leftIndex < xs.length; leftIndex++) {
            trace.push({ kind: "select", leftIndex });

            // Find all the occurrences of the current value in the right column
            const rightIndices = ys
                .map((value, index) => ({ value, index }))
                .filter(item => item.value === xs[leftIndex])
                .map(item => item.index);
            trace.push({ kind: "find", rightIndices });

            trace.push({ kind: "pop", leftIndex, rightIndices });

            // Calculate the similarity score = left * right occurrences
            const similarityScore = xs[leftIndex] * rightIndices.length;
            trace.push({ kind: "similarity", leftNumber: xs[leftIndex], rightNumber: rightIndices.length, similarityScore });

            // Calculate the accumulated score
            accumulatedScore += similarityScore;
            trace.push({ kind: "accumulated", accumulatedScore });
        }

        return trace;
    }
}

class Part2Animator implements PartAnimator<Part2TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private leftColumn?: HTMLUListElement;
    private rightColumn?: HTMLUListElement;
    private leftItems?: { item: HTMLLIElement, text: HTMLSpanElement }[];
    private rightItems?: { item: HTMLLIElement, text: HTMLSpanElement }[];
    private lhsItem?: HTMLSpanElement;
    private rhsItem?: HTMLSpanElement;
    private similarityItem?: HTMLSpanElement;

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
        this.leftColumn = undefined;
        this.rightColumn = undefined;
        this.leftItems = undefined;
        this.rightItems = undefined;
        this.lhsItem = undefined;
        this.rhsItem = undefined;
        this.similarityItem = undefined;
    }

    begin(): void {
        this.reset();

        this.create();

        this.inputDiv.classList.add("hidden");
        this.solutionDiv.classList.remove("hidden");
    }

    step(step: Part2TraceItem): void {
        switch (step.kind) {
        case "input":
            this.createInput(step);
            break;
        case "select":
            this.animateSelect(step);
            break;
        case "find":
            this.animateFind(step);
            break;
        case "pop":
            this.animatePop(step);
            break;
        case "similarity":
            this.animateSimilarity(step);
            break;
        case "accumulated":
            this.animateAccumulated(step);
            break;
        }
    }

    private createInput(input: Part2TraceItemInput) {
        this.leftItems = createColumnItems(this.leftColumn!, input.leftColumn);
        this.rightItems = createColumnItems(this.rightColumn!, input.rightColumn);
    }

    private animateSelect(select: Part2TraceItemSelect) {
        highlightItemIn(this.leftItems![select.leftIndex]);
    }

    private animateFind(find: Part2TraceItemFind) {
        find.rightIndices.forEach(rightIndex => highlightItemIn(this.rightItems![rightIndex]));
    }

    private animatePop(pop: Part2TraceItemPop) {
        highlightItemPopOut(this.leftItems![pop.leftIndex]);
        pop.rightIndices.forEach(rightIndex => highlightItemOut(this.rightItems![rightIndex]));
    }

    private animateSimilarity(similarity: Part2TraceItemSimilarity) {
        this.lhsItem!.textContent = similarity.leftNumber.toString();
        this.rhsItem!.textContent = similarity.rightNumber.toString();
        this.similarityItem!.textContent = similarity.similarityScore.toString();
    }

    private animateAccumulated(accumulated: Part2TraceItemAccumulated) {
        this.lhsItem!.textContent = "";
        this.rhsItem!.textContent = "";
        this.similarityItem!.textContent = "";
        this.answerNumber!.textContent = accumulated.accumulatedScore.toString();
    }

    private create() {
        // Create the answer container
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

        this.answerNumber = document.createElement("span");
        this.answerNumber.textContent = "0";
        answerDiv.appendChild(this.answerNumber);

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
        this.leftColumn = document.createElement("ul");
        this.leftColumn.classList.add(
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
        puzzleDiv.appendChild(this.leftColumn);

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
        this.rightColumn = document.createElement("ul");
        this.rightColumn.classList.add(
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
        puzzleDiv.appendChild(this.rightColumn);

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
        const lhsItem = createNumberItem("");
        this.lhsItem = lhsItem.text;
        middleTopRow.appendChild(lhsItem.item);

        // Create multiply sign item
        const minusItem = document.createElement("li");
        minusItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-red-500"     // Red color for minus sign
        );
        minusItem.textContent = "x";
        middleTopRow.appendChild(minusItem);

        // Create right-hand side number item
        const rhsItem = createNumberItem("");
        this.rhsItem = rhsItem.text;
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

        // Create similarity score item
        const similarityItem = createNumberItem("");
        this.similarityItem = similarityItem.text;
        middleBottomRow.appendChild(similarityItem.item);

        this.leftItems = [];
        this.rightItems = [];
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

const part1 = new Part("part1");
const part1Solution = new Part1Solution(part1.textareaInput.value);
const part1Animator = new Part1Animator(part1.inputDiv, part1.solutionDiv);
const animator1 = new Animator(part1Solution, part1Animator);
part1.solveButton.onclick = () => animator1.solve();
part1.stepButton.onclick = () => animator1.step();
part1.resetButton.onclick = () => animator1.reset();

const part2 = new Part("part2");
const part2Solution = new Part2Solution(part2.textareaInput.value);
const part2Animator = new Part2Animator(part2.inputDiv, part2.solutionDiv);
const animator2 = new Animator(part2Solution, part2Animator);
part2.solveButton.onclick = () => animator2.solve();
part2.stepButton.onclick = () => animator2.step();
part2.resetButton.onclick = () => animator2.reset();
