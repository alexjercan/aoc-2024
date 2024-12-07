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

const utils = {
    createNumberItem,
    createColumnItems,
    highlightItemIn,
    highlightItemOut,
    highlightItemPopOut,
};

export { Part, utils };