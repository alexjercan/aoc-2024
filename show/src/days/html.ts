class Part {
    inputDiv: HTMLDivElement;
    textareaInput: HTMLTextAreaElement;
    solutionDiv: HTMLDivElement;
    controlDiv: HTMLDivElement;
    solveButton: HTMLButtonElement;
    stepButton: HTMLButtonElement;
    resetButton: HTMLButtonElement;
    descriptionDiv: HTMLDivElement;

    constructor(name: string) {
        this.inputDiv = document.getElementById(`${name}-input`) as HTMLDivElement;
        this.textareaInput = document.getElementById(`${name}-textarea`) as HTMLTextAreaElement;
        this.solutionDiv = document.getElementById(`${name}-solution`) as HTMLDivElement;
        this.controlDiv = document.getElementById(`${name}-control`) as HTMLDivElement;
        this.solveButton = document.getElementById(`${name}-solve`) as HTMLButtonElement;
        this.stepButton = document.getElementById(`${name}-step`) as HTMLButtonElement;
        this.resetButton = document.getElementById(`${name}-reset`) as HTMLButtonElement;
        this.descriptionDiv = document.getElementById(`${name}-description`) as HTMLDivElement;

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

function createRowItems(container: HTMLUListElement, values: number[]): { item: HTMLLIElement, text: HTMLSpanElement }[] {
    container.innerHTML = ""; // Clear the container
    return values.map(value => {
        const item = createNumberItem(value.toString());
        item.item.classList.add("mx-2"); // Add margin to the item
        container.appendChild(item.item);
        return item;
    });
}

function highlightItemIn(element: { item: HTMLLIElement, text: HTMLSpanElement }, options: { color: string } = { color: "bg-green-500" }) {
    element.item.classList.remove("bg-neutral-700");
    element.item.classList.add(
        options.color,     // Highlight the item with the specified color
        "transform",       // Enable scaling
        "scale-110"        // Slightly enlarge the item
    );
}

function highlightItemOut(element: { item: HTMLLIElement, text: HTMLSpanElement }, options: { color: string } = { color: "bg-green-500" }) {
    element.item.classList.remove(options.color, "transform", "scale-110");
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

function createParagraph(text: string): HTMLParagraphElement {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    return paragraph;
}

function createOrderedList(items: string[]): HTMLOListElement {
    const list = document.createElement("ol");
    list.classList.add(
        "list-decimal", // Use decimal numbers
        "list-inside",  // Place the numbers inside the list
    );

    items.forEach(item => {
        const listItem = document.createElement("li");
        listItem.classList.add(
        );
        listItem.textContent = item;
        list.appendChild(listItem);
    });
    return list;
}

const utils = {
    // Elements
    createNumberItem,
    createColumnItems,
    createRowItems,
    // Animation
    highlightItemIn,
    highlightItemOut,
    highlightItemPopOut,
    // Text
    createParagraph,
    createOrderedList
};

export { Part, utils };
