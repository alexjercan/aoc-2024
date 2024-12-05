const part1 = document.getElementById("part1")!;

const leftNumbers = [3, 4, 2, 1, 3, 3];
const rightNumbers = [4, 3, 5, 3, 9, 3];

// Create and style the answer container (Distance text) at the top of part1
const answerDiv = document.createElement("div");
answerDiv.classList.add("text-2xl", "font-semibold", "text-center", "mb-4", "text-green-500");
answerDiv.textContent = "Distance: 0";
part1.appendChild(answerDiv);

// Create and style the puzzle container
const puzzleDiv = document.createElement("div");
puzzleDiv.classList.add("flex", "justify-between", "items-center", "space-x-4", "w-full", "py-4");
part1.appendChild(puzzleDiv);

// Create and style the control container (buttons)
const controlDiv = document.createElement("div");
controlDiv.classList.add("flex", "flex-col", "items-center", "space-y-4", "w-full");
part1.appendChild(controlDiv);

// Helper function to create and style list items
function createItems(container: HTMLElement, numbers: number[]) {
    container.innerHTML = ""; // Clear the container
    return numbers.map((num) => {
        const item = document.createElement("li");
        item.textContent = num.toString();
        item.classList.add(
            "transition-all", "duration-500", "transform", "bg-neutral-600", "p-4", "rounded-lg", "text-xl",
            "border", "border-neutral-500", "cursor-pointer", "hover:bg-neutral-700"
        );
        container.appendChild(item);
        return item;
    });
}

// Create containers for left and right columns
const leftColumn = document.createElement("ul");
leftColumn.classList.add("flex", "flex-col", "space-y-2", "items-center", "w-1/3", "p-4", "bg-neutral-800", "rounded-lg", "shadow-lg");
const middleDiv = document.createElement("div");
middleDiv.classList.add("flex", "justify-center", "items-center", "w-full");
const rightColumn = document.createElement("ul");
rightColumn.classList.add("flex", "flex-col", "space-y-2", "items-center", "w-1/3", "p-4", "bg-neutral-800", "rounded-lg", "shadow-lg");

puzzleDiv.appendChild(leftColumn);
puzzleDiv.appendChild(middleDiv);
puzzleDiv.appendChild(rightColumn);

// Create items for left and right columns
let leftItems = createItems(leftColumn, leftNumbers);
let rightItems = createItems(rightColumn, rightNumbers);

// Sleep function for smooth transitions
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function createMiddleDisplay(left: number, right: number) {
    middleDiv.innerHTML = "";

    const middleDisplayContainer = document.createElement("div");
    middleDisplayContainer.classList.add("flex", "flex-col", "items-center", "p-4", "bg-neutral-800", "rounded-lg", "shadow-lg");
    middleDiv.appendChild(middleDisplayContainer);

    const l1Distance = Math.abs(left - right);
    const l1DistanceDiv = document.createElement("div");
    l1DistanceDiv.classList.add("text-lg", "font-semibold", "text-blue-500");
    l1DistanceDiv.textContent = `L1 Distance: ${l1Distance}`;
    middleDisplayContainer.appendChild(l1DistanceDiv);

    const middleLeft = document.createElement("div");
    middleLeft.textContent = left.toString();
    middleLeft.classList.add("bg-neutral-600", "p-4", "rounded-lg", "text-xl", "border", "border-neutral-500");
    middleDisplayContainer.appendChild(middleLeft);

    const middleRight = document.createElement("div");
    middleRight.textContent = right.toString();
    middleRight.classList.add("bg-neutral-600", "p-4", "rounded-lg", "text-xl", "border", "border-neutral-500");
    middleDisplayContainer.appendChild(middleRight);

    return l1Distance;
}

// Function to run the sorting and distance calculation animation
async function part1Solution() {
    const leftSortedIndex = leftNumbers.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    const rightSortedIndex = rightNumbers.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

    let distance = 0;

    for (let i = 0; i < leftSortedIndex.length; i++) {
        const leftIndex = leftSortedIndex[i];
        const rightIndex = rightSortedIndex[i];

        leftItems[leftIndex].classList.add("translate-x-[120%]");
        rightItems[rightIndex].classList.add("-translate-x-[120%]");
        leftItems[leftIndex].classList.add("text-green-500");
        rightItems[rightIndex].classList.add("text-green-500");

        const l1Distance = createMiddleDisplay(leftNumbers[leftIndex], rightNumbers[rightIndex]);
        distance += l1Distance;
        answerDiv.textContent = `Distance: ${distance}`;

        leftItems[leftIndex].classList.add("bg-green-600", "text-white", "line-through");
        rightItems[rightIndex].classList.add("bg-green-600", "text-white", "line-through");

        await sleep(1500);

        leftItems[leftIndex].classList.remove("translate-x-[120%]", "text-green-500");
        rightItems[rightIndex].classList.remove("-translate-x-[120%]", "text-green-500");
    }
}

// Function to reset the puzzle
async function part1Reset() {
    answerDiv.textContent = "Distance: 0";
    middleDiv.innerHTML = "";

    leftItems = createItems(leftColumn, leftNumbers);
    rightItems = createItems(rightColumn, rightNumbers);
}

// Create and style the solve button
const solveButton = document.createElement("button");
solveButton.textContent = "Solve";
solveButton.classList.add("p-2", "bg-green-500", "text-white", "rounded", "hover:bg-green-600", "transition-colors", "w-32");
solveButton.onclick = part1Solution;

// Create and style the reset button
const resetButton = document.createElement("button");
resetButton.textContent = "Reset";
resetButton.classList.add("p-2", "bg-red-500", "text-white", "rounded", "hover:bg-red-600", "transition-colors", "w-32");
resetButton.onclick = part1Reset;

// Create a container for the buttons
const buttonDiv = document.createElement("div");
buttonDiv.classList.add("flex", "space-x-4", "mt-4");
buttonDiv.appendChild(solveButton);
buttonDiv.appendChild(resetButton);
controlDiv.appendChild(buttonDiv);

