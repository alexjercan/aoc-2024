const part1 = document.getElementById("part1")!;

// Create a div that will take in the input
const inputDiv = document.createElement("div");
inputDiv.classList.add(
    "flex",         // Flex container
    "flex-col",     // Arrange children in a column
    "items-center", // Center items horizontally
    "space-y-4",    // Vertical space between items
    "w-full",       // Full width
    "grow"          // Allow the container to grow
);
part1.appendChild(inputDiv);

// Create and style the input container multiline text area
const inputContainer = document.createElement("textarea");
inputContainer.rows = 6;
inputContainer.value = "3   4\n4   3\n2   5\n1   3\n3   9\n3   3";
inputContainer.classList.add(
    "p-2",              // Padding
    "w-full",           // Full width
    "text-center",      // Center text
    "border",           // Border
    "border-gray-300",  // Gray border color
    "rounded",          // Rounded corners
    "focus:outline-none", // Remove outline on focus
    "focus:border-blue-500", // Blue border on focus
    "text-black"        // Black text color
);
inputDiv.appendChild(inputContainer);

// Create a div that will show the solution (hidden by default)
const solutionDiv = document.createElement("div");
solutionDiv.classList.add(
    "hidden",           // Hidden by default
    "flex",             // Flex container
    "flex-col",         // Arrange children in a column
    "items-center",     // Center items horizontally
    "space-y-4",        // Vertical space between items
    "w-full",           // Full width
    "grow"              // Allow the container to grow
);
part1.appendChild(solutionDiv);

// Create and style the control container (buttons)
const controlDiv = document.createElement("div");
controlDiv.classList.add(
    "flex",             // Flex container
    "flex-col",         // Arrange children in a column
    "items-center",     // Center items horizontally
    "space-y-4",        // Vertical space between items
    "w-full"            // Full width
);
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

const part1Animator = new Part1Animator(inputDiv, solutionDiv);

// Create and style the solve button
const solveButton = document.createElement("button");
solveButton.textContent = "Solve";  // Set button text to "Solve"
solveButton.classList.add(
    "p-2",             // Padding inside the button
    "bg-green-500",    // Green background color
    "text-white",      // White text color
    "rounded",         // Rounded corners
    "hover:bg-green-600", // Darker green on hover
    "transition-colors", // Smooth color transition on hover
    "w-32"             // Width of 32 units
);
solveButton.onclick = () => part1Animator.solve(inputContainer.value); // Trigger solve function on click

// Create and style the reset button
const resetButton = document.createElement("button");
resetButton.textContent = "Reset";  // Set button text to "Reset"
resetButton.classList.add(
    "p-2",             // Padding inside the button
    "bg-red-500",      // Red background color
    "text-white",      // White text color
    "rounded",         // Rounded corners
    "hover:bg-red-600", // Darker red on hover
    "transition-colors", // Smooth color transition on hover
    "w-32"             // Width of 32 units
);
resetButton.onclick = () => part1Animator.reset();  // Trigger reset function on click

// Create a container for the buttons
const buttonDiv = document.createElement("div");
buttonDiv.classList.add(
    "flex",           // Flex container for aligning items
    "space-x-4",      // Horizontal space between the buttons
    "mt-4"            // Margin top for spacing from previous elements
);
buttonDiv.appendChild(solveButton);  // Add solve button to the container
buttonDiv.appendChild(resetButton); // Add reset button to the container
controlDiv.appendChild(buttonDiv);  // Add the container to the parent div
