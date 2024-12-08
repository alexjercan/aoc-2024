type Trace<T> = T[];

interface Solution<T> {
    setInput(input: string): void;
    solve(): Trace<T>;
}

interface PartAnimator<T> {
    reset(): void;
    begin(): void;
    step(step: T): number;
}

function createNumberItem(value: string): { item: HTMLLIElement, text: HTMLSpanElement } {
    const item = document.createElement("li");
    item.classList.add(
        "flex",            // Flex container
        "items-center",    // Center items vertically
        "justify-center",  // Center items horizontally
        "text-3xl",        // Large text size
        "font-extrabold",  // Extra bold text
        "min-w-16",            // Fixed width
        "aspect-square",    // Square aspect ratio
        "rounded-xl",      // Rounded corners
        "shadow-2xl",      // Shadow
        "transition-all",  // Smooth transition
        "ease-in-out",     // Ease-in-out timing function
        "duration-300",    // 300ms transition duration
        "bg-neutral-700",  // Background color
    );

    const text = document.createElement("span");
    text.textContent = value;
    item.appendChild(text);

    return { item, text };
}

function createCharItem(value: string): { item: HTMLLIElement, text: HTMLSpanElement } {
    const item = document.createElement("li");
    item.classList.add(
        "text-2xl",        // Large text size
        "font-semibold",   // Semi-bold text
        "aspect-square",    // Square aspect ratio
        "text-white",      // White text color
        "bg-neutral-800",  // Dark background
        "rounded-lg",      // Rounded corners
        "shadow-lg",       // Large shadow effect
        "px-2",             // Padding inside the container
        "transition-all",  // Smooth transition
        "ease-in-out",     // Ease-in-out timing function
        "duration-300",    // 300ms transition duration
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

function createRowCharItems(container: HTMLUListElement, values: string[]): { item: HTMLLIElement, text: HTMLSpanElement }[] {
    container.innerHTML = ""; // Clear the container
    return values.map(value => {
        const item = createCharItem(value.toString());
        item.item.classList.add(
            "flex", // Enable flex layout
            "items-center", // Center items vertically
            "justify-center", // Center items horizontally
            "p-2",            // Padding inside the container
            "mx-2",           // Add margin to the item
        );
        container.appendChild(item.item);
        return item;
    });
}

function createRowItems(container: HTMLUListElement, values: number[] | string[]): { item: HTMLLIElement, text: HTMLSpanElement }[] {
    container.innerHTML = ""; // Clear the container
    return values.map(value => {
        const valueString = value.toString();
        const item = createNumberItem(valueString);
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
    createCharItem,
    createColumnItems,
    createRowItems,
    createRowCharItems,
    // Animation
    highlightItemIn,
    highlightItemOut,
    highlightItemPopOut,
    // Text
    createParagraph,
    createOrderedList
};

export { Trace, Solution, PartAnimator, utils };
