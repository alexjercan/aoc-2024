const part1 = document.getElementById("part1")!;

// Create a div that will take in the input
const inputDiv = document.createElement("div");
inputDiv.classList.add("flex", "flex-col", "items-center", "space-y-4", "w-full");
part1.appendChild(inputDiv);

// Create and style the input container multiline text area
const inputContainer = document.createElement("textarea");
inputContainer.rows = 6;
inputContainer.value = "3   4\n4   3\n2   5\n1   3\n3   9\n3   3";
inputContainer.classList.add("p-2", "w-full", "text-center", "border", "border-gray-300", "rounded", "focus:outline-none", "focus:border-blue-500", "text-black");
inputDiv.appendChild(inputContainer);

// Create a div that will show the solution (hidden by default)
const solutionDiv = document.createElement("div");
solutionDiv.classList.add("hidden", "flex", "flex-col", "items-center", "space-y-4", "w-full");
part1.appendChild(solutionDiv);

// Create and style the control container (buttons)
const controlDiv = document.createElement("div");
controlDiv.classList.add("flex", "flex-col", "items-center", "space-y-4", "w-full");
part1.appendChild(controlDiv);

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

class Part1Animator {
    private abortController: AbortController;
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

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
    }

    solve(input: string) {
        this.reset();

        this.inputDiv.classList.add("hidden");
        this.solutionDiv.classList.remove("hidden");

        const solution = new Part1Solution(input);
        const trace = solution.solve();
        this.animate(trace, this.abortController);
    }

    private createNumberItem(value: string): { item: HTMLLIElement, text: HTMLSpanElement } {
        const item = document.createElement("li");
        item.classList.add(
            "flex",
            "items-center",
            "justify-center",
            "text-3xl",
            "font-extrabold",
            "w-16",
            "h-16",
            "rounded-xl",
            "shadow-2xl",
            "transition-all",
            "ease-in-out",
            "duration-300",
            "bg-neutral-700"
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

    private async animate(trace: Part1Trace, ac: AbortController) {
        // Create UI containers
        const answerNumber = this.createAnswerContainer();
        const { leftColumn, rightColumn, lhsItem, rhsItem, l1Item } = this.createPuzzleLayout();

        const leftItems = this.createColumnItems(leftColumn, trace.leftColumn);
        const rightItems = this.createColumnItems(rightColumn, trace.rightColumn);

        // Animate steps
        for (const step of trace.steps) {
            if (ac.signal.aborted) break;

            const { leftIndex, rightIndex, l1Distance, accumulatedDistance } = step;

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

            // Update accumulated distance
            answerNumber.textContent = accumulatedDistance.toString();

            await new Promise(resolve => setTimeout(resolve, 1000));

            this.highlighItemPopOut(leftItems, leftIndex);
            this.highlighItemPopOut(rightItems, rightIndex);

            // Clear middle pad
            this.updateMiddlePad(lhsItem, rhsItem, l1Item, "", "", "");
        }
    }

    private highlighItemIn(elements: { item: HTMLLIElement, text: HTMLSpanElement }[], index: number) {
        elements[index].item.classList.remove("bg-neutral-700");
        elements[index].item.classList.add(
            "bg-green-500",
            "transform",
            "scale-110"
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
        answerDiv.classList.add("text-2xl", "font-semibold", "text-center", "mb-4", "text-green-500");
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
        const puzzleDiv = document.createElement("div");
        puzzleDiv.classList.add("flex", "flex-row", "justify-between", "items-center", "space-x-4", "w-full", "py-4");
        this.solutionDiv.appendChild(puzzleDiv);

        const leftColumn = document.createElement("ul");
        leftColumn.classList.add("flex", "flex-col", "space-y-2", "items-center", "w-1/3", "p-4", "bg-neutral-800", "rounded-lg", "shadow-lg", "transition-all", "ease-in-out", "duration-300");
        puzzleDiv.appendChild(leftColumn);

        const middlePad = document.createElement("div");
        middlePad.classList.add("flex", "flex-col", "items-center", "w-1/3", "p-4", "bg-neutral-800", "rounded-lg", "shadow-lg");
        puzzleDiv.appendChild(middlePad);

        const rightColumn = document.createElement("ul");
        rightColumn.classList.add("flex", "flex-col", "space-y-2", "items-center", "w-1/3", "p-4", "bg-neutral-800", "rounded-lg", "shadow-lg", "transition-all", "ease-in-out", "duration-300");
        puzzleDiv.appendChild(rightColumn);

        const middleTopRow = document.createElement("ul");
        middleTopRow.classList.add("flex", "flex-row", "justify-center", "items-center", "space-x-2", "mb-4");
        middlePad.appendChild(middleTopRow);

        const lhsItem = this.createNumberItem("");
        middleTopRow.appendChild(lhsItem.item);

        const minusItem = document.createElement("li");
        minusItem.classList.add("text-3xl", "font-extrabold", "text-red-500");
        minusItem.textContent = "-";
        middleTopRow.appendChild(minusItem);

        const rhsItem = this.createNumberItem("");
        middleTopRow.appendChild(rhsItem.item);

        const middleBottomRow = document.createElement("ul");
        middleBottomRow.classList.add("flex", "flex-row", "justify-center", "items-center", "space-x-2", "mt-4");
        middlePad.appendChild(middleBottomRow);

        const equalItem = document.createElement("li");
        equalItem.classList.add("text-3xl", "font-extrabold", "text-yellow-500");
        equalItem.textContent = "=";
        middleBottomRow.appendChild(equalItem);

        const l1Item = this.createNumberItem("");
        middleBottomRow.appendChild(l1Item.item);

        return { leftColumn, rightColumn, lhsItem, rhsItem, l1Item };
    }
}

const part1Animator = new Part1Animator(inputDiv, solutionDiv);

// Create and style the solve button
const solveButton = document.createElement("button");
solveButton.textContent = "Solve";
solveButton.classList.add("p-2", "bg-green-500", "text-white", "rounded", "hover:bg-green-600", "transition-colors", "w-32");
solveButton.onclick = () => part1Animator.solve(inputContainer.value);

// Create and style the reset button
const resetButton = document.createElement("button");
resetButton.textContent = "Reset";
resetButton.classList.add("p-2", "bg-red-500", "text-white", "rounded", "hover:bg-red-600", "transition-colors", "w-32");
resetButton.onclick = () => part1Animator.reset();

// Create a container for the buttons
const buttonDiv = document.createElement("div");
buttonDiv.classList.add("flex", "space-x-4", "mt-4");
buttonDiv.appendChild(solveButton);
buttonDiv.appendChild(resetButton);
controlDiv.appendChild(buttonDiv);
