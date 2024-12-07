import { Animator, PartAnimator, Solution, Trace } from "./animator";
import { Part, utils } from "./html";

type Part1TraceItemInput = { kind: "input", reports: number[][] };
type Part1TraceItemCheckReport = { kind: "check-report", index: number };
type Part1TraceItemCheckLevels = { kind: "check-levels", index: number, lhsIndex: number, rhsIndex: number };
type Part1TraceItemCheckLevelsPut = { kind: "check-levels-put", index: number, lhsIndex: number, rhsIndex: number };
type Part1TraceItemCheckAscending = { kind: "check-ascending", ascending: boolean };
type Part1TraceItemSameOrder = { kind: "same-order" };
type Part1TraceItemDifferentOrder = { kind: "different-order" };
type Part1TraceItemCheckAscendingDone = { kind: "check-ascending-done" };
type Part1TraceItemAbsDiff = { kind: "abs-diff", absDiff: number };
type Part1TraceItemValidDiff = { kind: "valid-diff" };
type Part1TraceItemInvalidDiff = { kind: "invalid-diff" };
type Part1TraceItemAbsDiffDone = { kind: "abs-diff-done" };
type Part1TraceItemValidReport = { kind: "valid-report", index: number };
type Part1TraceItemTotal = { kind: "total", total: number };
type Part1TraceItemTotalDone = { kind: "total-done", total: number };
type Part1TraceItemInvalidReport = { kind: "invalid-report", index: number };
type Part1TraceItemDone = { kind: "report-done", index: number };

type Part1TraceItem = Part1TraceItemInput | Part1TraceItemCheckReport | Part1TraceItemCheckLevels | Part1TraceItemCheckLevelsPut | Part1TraceItemCheckAscending | Part1TraceItemSameOrder | Part1TraceItemDifferentOrder | Part1TraceItemCheckAscendingDone | Part1TraceItemAbsDiff | Part1TraceItemValidDiff | Part1TraceItemInvalidDiff | Part1TraceItemAbsDiffDone | Part1TraceItemValidReport | Part1TraceItemTotal | Part1TraceItemTotalDone | Part1TraceItemInvalidReport | Part1TraceItemDone;

class Part1Solution implements Solution<Part1TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): number[][] {
        return input.split("\n").map(line => line.split(" ").map(Number));
    }

    solve(): Trace<Part1TraceItem> {
        const trace: Trace<Part1TraceItem> = [];

        const reports = this.parseInput(this.input);
        trace.push({kind: "input", reports});

        let total = 0;
        for (let index = 0; index < reports.length; index++) {
            const report = reports[index];
            trace.push({kind: "check-report", index});

            let reportValid = true;
            const ascending = report[0] < report[1];
            for (let i = 0; i < report.length - 1; i++) {
                trace.push({kind: "check-levels", index, lhsIndex: i, rhsIndex: i + 1});
                trace.push({kind: "check-levels-put", index, lhsIndex: i, rhsIndex: i + 1});

                const absDiff = Math.abs(report[i] - report[i + 1]);
                trace.push({kind: "abs-diff", absDiff});
                if (1 <= absDiff && absDiff <= 3) {
                    trace.push({kind: "valid-diff"});
                } else {
                    trace.push({kind: "invalid-diff"});
                    reportValid = false;
                }
                trace.push({kind: "abs-diff-done"});
                if (!reportValid) {
                    break;
                }

                const newAscending = report[i] < report[i + 1];
                trace.push({kind: "check-ascending", ascending: newAscending});
                if (ascending === newAscending) {
                    trace.push({kind: "same-order"});
                } else {
                    trace.push({kind: "different-order"});
                    reportValid = false;
                }
                trace.push({kind: "check-ascending-done"});
                if (!reportValid) {
                    break;
                }
            }

            if (reportValid) {
                trace.push({kind: "valid-report", index});

                total += 1;
                trace.push({kind: "total", total});
                trace.push({kind: "total-done", total});
            } else {
                trace.push({kind: "invalid-report", index});
            }
            trace.push({kind: "report-done", index});
        }

        return trace;
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private lhsItem?: HTMLSpanElement;
    private rhsItem?: HTMLSpanElement;
    private orderItem?: HTMLSpanElement;
    private diffItem?: HTMLSpanElement;
    private reportsColumn?: HTMLUListElement;
    private reports?: { item: HTMLLIElement, text: HTMLSpanElement }[][];

    constructor(inputDiv: HTMLDivElement, solutionDiv: HTMLDivElement) {
        this.inputDiv = inputDiv;
        this.solutionDiv = solutionDiv;

        this.reset();
    }

    reset(): void {
        this.inputDiv.classList.remove("hidden");
        this.solutionDiv.classList.add("hidden");
        this.solutionDiv.innerHTML = "";
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
        case "check-report":
            this.checkReport(step);
            break;
        case "check-levels":
            this.checkLevels(step);
            break;
        case "check-levels-put":
            this.checkLevelsPut(step);
            break;
        case "abs-diff":
            this.absDiff(step);
            break;
        case "valid-diff":
            this.validDiff(step);
            break;
        case "invalid-diff":
            this.invalidDiff(step);
            break;
        case "abs-diff-done":
            this.absDiffDone(step);
            break;
        case "check-ascending":
            this.checkAscending(step);
            break;
        case "same-order":
            this.sameOrder(step);
            break;
        case "different-order":
            this.differentOrder(step);
            break;
        case "check-ascending-done":
            this.checkAscendingDone(step);
            break;
        case "valid-report":
            this.validReport(step);
            break;
        case "total":
            this.total(step);
            break;
        case "total-done":
            this.totalDone(step);
            break;
        case "invalid-report":
            this.invalidReport(step);
            break;
        case "report-done":
            this.reportDone(step);
            break;
        }
    }

    private createInput(step: Part1TraceItemInput) {
        for (let i = 0; i < step.reports.length; i++) {
            const reportRow = document.createElement("li");
            reportRow.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
                "p-2",             // Padding inside the container
                "rounded-lg",      // Rounded corners
            );
            this.reportsColumn!.appendChild(reportRow);

            const reportRowList = document.createElement("ul");
            reportRowList.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
            );
            reportRow.appendChild(reportRowList);

            const reportItems = utils.createRowItems(reportRowList, step.reports[i]);
            this.reports!.push(reportItems);
        }
    }

    private checkReport(step: Part1TraceItemCheckReport) {
        this.reportsColumn!.children[step.index].classList.add("transition-all", "duration-500", "ease-in-out", "scale-110");
    }

    private checkLevels(step: Part1TraceItemCheckLevels) {
        utils.highlightItemIn(this.reports![step.index][step.lhsIndex]);
        utils.highlightItemIn(this.reports![step.index][step.rhsIndex]);
    }

    private checkLevelsPut(step: Part1TraceItemCheckLevelsPut) {
        const lhs = this.reports![step.index][step.lhsIndex];
        this.lhsItem!.textContent = lhs.text.textContent;
        utils.highlightItemOut(lhs);

        const rhs = this.reports![step.index][step.rhsIndex];
        this.rhsItem!.textContent = rhs.text.textContent;
        utils.highlightItemOut(rhs);
    }

    private absDiff(step: Part1TraceItemAbsDiff) {
        this.diffItem!.textContent = step.absDiff.toString();
    }

    private validDiff(_step: Part1TraceItemValidDiff) {
        this.diffItem!.classList.add("text-green-500");
    }

    private invalidDiff(_step: Part1TraceItemInvalidDiff) {
        this.diffItem!.classList.add("text-red-500");
    }

    private absDiffDone(_step: Part1TraceItemAbsDiffDone) {
        this.diffItem!.classList.remove("text-green-500", "text-red-500");
    }

    private checkAscending(step: Part1TraceItemCheckAscending) {
        if (step.ascending) {
            this.orderItem!.textContent = "increasing";
        } else {
            this.orderItem!.textContent = "decreasing";
        }
    }

    private sameOrder(_step: Part1TraceItemSameOrder) {
        this.orderItem!.classList.remove("text-red-500", "text-gray-500");
        this.orderItem!.classList.add("text-green-500");
    }

    private differentOrder(_step: Part1TraceItemDifferentOrder) {
        this.orderItem!.classList.remove("text-green-500", "text-gray-500");
        this.orderItem!.classList.add("text-red-500");
    }

    private checkAscendingDone(_step: Part1TraceItemCheckAscendingDone) {
        this.orderItem!.classList.remove("text-green-500", "text-red-500");
        this.orderItem!.classList.add("text-gray-500");
    }

    private validReport(step: Part1TraceItemValidReport) {
        this.reportsColumn!.children[step.index].classList.add("bg-green-500");
    }

    private total(step: Part1TraceItemTotal) {
        this.answerNumber!.textContent = step.total.toString();
        this.answerNumber!.classList.add("font-bold", "text-yellow-500");
    }

    private totalDone(_step: Part1TraceItemTotalDone) {
        this.answerNumber!.classList.remove("font-bold", "text-yellow-500");
    }

    private invalidReport(step: Part1TraceItemInvalidReport) {
        this.reportsColumn!.children[step.index].classList.add("bg-red-500");
    }

    private reportDone(step: Part1TraceItemDone) {
        this.reportsColumn!.children[step.index].classList.remove("scale-110", "bg-green-500");
        this.reportsColumn!.children[step.index].classList.add("opacity-0", "scale-0");

        setTimeout(() => {
            this.reportsColumn!.children[step.index].classList.add("hidden");
        }, 500);
    }

    private create() {
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
            "overflow-y-auto"  // Allow vertical scrolling
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

        // Create the top row of the middle pad
        const middleRow1 = document.createElement("ul");
        middleRow1.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mb-4"             // Margin bottom
        );
        middlePad.appendChild(middleRow1);

        // Create a vertical bar for the absolute value in the top row
        const absBarL = document.createElement("li");
        absBarL.classList.add(
            "h-16",            // Fixed height
            "w-1",             // Fixed width
            "bg-red-500"       // Background color
        );
        middleRow1.appendChild(absBarL);

        // Create left-hand side number item in the top row
        const lhsItem = utils.createNumberItem("");
        this.lhsItem = lhsItem.text;
        middleRow1.appendChild(lhsItem.item);

        // Create minus sign item in the top row
        const minusItem = document.createElement("li");
        minusItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-red-500"     // Red color for minus sign
        );
        minusItem.textContent = "-";
        middleRow1.appendChild(minusItem);

        // Create right-hand side number item in the top row
        const rhsItem = utils.createNumberItem("");
        this.rhsItem = rhsItem.text;
        middleRow1.appendChild(rhsItem.item);

        // Create a vertical bar for the absolute value in the top row
        const absBarR = document.createElement("li");
        absBarR.classList.add(
            "h-16",            // Fixed height
            "w-1",             // Fixed width
            "bg-red-500"       // Background color
        );
        middleRow1.appendChild(absBarR);

        // Create the middle row of the middle pad (2nd row with = and Abs Diff)
        const middleRow2 = document.createElement("ul");
        middleRow2.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mt-4"             // Margin top
        );
        middlePad.appendChild(middleRow2);

        // Create equal sign item
        const equalItem = document.createElement("li");
        equalItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-yellow-500"  // Yellow color for equal sign
        );
        equalItem.textContent = "=";
        middleRow2.appendChild(equalItem);

        // Create L1 distance item
        const diffItem = utils.createNumberItem("");
        this.diffItem = diffItem.text;
        middleRow2.appendChild(diffItem.item);

        // Create the bottom row of the middle pad with "increasing" or "decreasing" text
        const middleRow3 = document.createElement("ul");
        middleRow3.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mt-4"             // Margin top
        );
        middlePad.appendChild(middleRow3);

        // Create increasing or decreasing text item in the bottom row
        this.orderItem = document.createElement("li");
        this.orderItem.classList.add(
            "text-md",         // Medium text size
            "font-extrabold",  // Extra bold text
            "text-gray-500"    // Gray text color
        );
        this.orderItem.textContent = "increasing";
        middleRow3.appendChild(this.orderItem);

        // Create the reports columns that will contain all the reports in the puzzle
        this.reportsColumn = document.createElement("ul");
        this.reportsColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "mt-4"             // Margin top
        );
        puzzleDiv.appendChild(this.reportsColumn);

        this.reports = [];
    }
}

// For part2 we just need 2 extra trace items, the rest are the same as part1
type Part2TraceItemRemoveLevel = { kind: "remove-level", index: number, item: number };
type Part2TraceItemRemoveLevelDone = { kind: "remove-level-done", index: number, item: number };

type Part2TraceItem = Part1TraceItemInput | Part1TraceItemCheckReport | Part1TraceItemCheckLevels | Part1TraceItemCheckLevelsPut | Part1TraceItemCheckAscending | Part1TraceItemSameOrder | Part1TraceItemDifferentOrder | Part1TraceItemCheckAscendingDone | Part1TraceItemAbsDiff | Part1TraceItemValidDiff | Part1TraceItemInvalidDiff | Part1TraceItemAbsDiffDone | Part1TraceItemValidReport | Part1TraceItemTotal | Part1TraceItemTotalDone | Part1TraceItemInvalidReport | Part1TraceItemDone | Part2TraceItemRemoveLevel | Part2TraceItemRemoveLevelDone;

class Part2Solution implements Solution<Part2TraceItem> {
    private input: string;

    setInput(input: string): void {
        this.input = input;
    }

    constructor(input: string) {
        this.input = input;
    }

    private parseInput(input: string): number[][] {
        return input.split("\n").map(line => line.split(" ").map(Number));
    }

    solve(): Trace<Part2TraceItem> {
        const trace: Trace<Part2TraceItem> = [];

        const reports = this.parseInput(this.input);
        trace.push({kind: "input", reports});

        let total = 0;
        // Same solution as for part1, but we have to check that the report is valid except for one element, so one extra loop for each report
        for (let index = 0; index < reports.length; index++) {
            const report = reports[index];
            trace.push({kind: "check-report", index});

            let reportValidAny = false;
            for (let j = 0; j < report.length; j++) { // we will skip the j index
                trace.push({kind: "remove-level", index, item: j});

                let reportValid = true;
                const firstReport = j === 0 ? 1 : 0;
                const secondReport = j === 1 ? 1 : 2;
                const ascending = report[firstReport] < report[secondReport];
                for (let i = 0; i < report.length - 1; i++) {
                    if (i === j) {
                        continue;
                    }

                    const lhsIndex = i;
                    const rhsIndex = lhsIndex + 1 === j ? lhsIndex + 2 : lhsIndex + 1;
                    if (rhsIndex >= report.length) {
                        break;
                    }

                    trace.push({kind: "check-levels", index, lhsIndex, rhsIndex});
                    trace.push({kind: "check-levels-put", index, lhsIndex, rhsIndex});

                    const absDiff = Math.abs(report[lhsIndex] - report[rhsIndex]);
                    trace.push({kind: "abs-diff", absDiff});
                    if (1 <= absDiff && absDiff <= 3) {
                        trace.push({kind: "valid-diff"});
                    } else {
                        trace.push({kind: "invalid-diff"});
                        reportValid = false;
                    }
                    trace.push({kind: "abs-diff-done"});
                    if (!reportValid) {
                        break;
                    }

                    const newAscending = report[lhsIndex] < report[rhsIndex];
                    trace.push({kind: "check-ascending", ascending: newAscending});
                    if (ascending === newAscending) {
                        trace.push({kind: "same-order"});
                    } else {
                        trace.push({kind: "different-order"});
                        reportValid = false;
                    }
                    trace.push({kind: "check-ascending-done"});
                    if (!reportValid) {
                        break;
                    }
                }

                trace.push({kind: "remove-level-done", index, item: j});

                if (reportValid) {
                    reportValidAny = true;
                    break;
                }
            }

            if (reportValidAny) {
                trace.push({kind: "valid-report", index});

                total += 1;
                trace.push({kind: "total", total});
                trace.push({kind: "total-done", total});
            } else {
                trace.push({kind: "invalid-report", index});
            }

            trace.push({kind: "report-done", index});
        }

        return trace;
    }
}

class Part2Animator implements PartAnimator<Part2TraceItem> {
    private inputDiv: HTMLDivElement;
    private solutionDiv: HTMLDivElement;

    private answerNumber?: HTMLSpanElement;
    private lhsItem?: HTMLSpanElement;
    private rhsItem?: HTMLSpanElement;
    private orderItem?: HTMLSpanElement;
    private diffItem?: HTMLSpanElement;
    private reportsColumn?: HTMLUListElement;
    private reports?: { item: HTMLLIElement, text: HTMLSpanElement }[][];

    constructor(inputDiv: HTMLDivElement, solutionDiv: HTMLDivElement) {
        this.inputDiv = inputDiv;
        this.solutionDiv = solutionDiv;

        this.reset();
    }

    reset(): void {
        this.inputDiv.classList.remove("hidden");
        this.solutionDiv.classList.add("hidden");
        this.solutionDiv.innerHTML = "";
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
        case "check-report":
            this.checkReport(step);
            break;
        case "check-levels":
            this.checkLevels(step);
            break;
        case "check-levels-put":
            this.checkLevelsPut(step);
            break;
        case "abs-diff":
            this.absDiff(step);
            break;
        case "valid-diff":
            this.validDiff(step);
            break;
        case "invalid-diff":
            this.invalidDiff(step);
            break;
        case "abs-diff-done":
            this.absDiffDone(step);
            break;
        case "check-ascending":
            this.checkAscending(step);
            break;
        case "same-order":
            this.sameOrder(step);
            break;
        case "different-order":
            this.differentOrder(step);
            break;
        case "check-ascending-done":
            this.checkAscendingDone(step);
            break;
        case "valid-report":
            this.validReport(step);
            break;
        case "total":
            this.total(step);
            break;
        case "total-done":
            this.totalDone(step);
            break;
        case "invalid-report":
            this.invalidReport(step);
            break;
        case "report-done":
            this.reportDone(step);
            break;
        case "remove-level":
            this.removeLevel(step);
            break;
        case "remove-level-done":
            this.removeLevelDone(step);
            break;
        }
    }

    private createInput(step: Part1TraceItemInput) {
        for (let i = 0; i < step.reports.length; i++) {
            const reportRow = document.createElement("li");
            reportRow.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
                "p-2",             // Padding inside the container
                "rounded-lg",      // Rounded corners
            );
            this.reportsColumn!.appendChild(reportRow);

            const reportRowList = document.createElement("ul");
            reportRowList.classList.add(
                "flex",            // Flex container
                "flex-row",        // Arrange children in a row
                "justify-center",  // Center items horizontally
                "items-center",    // Center items vertically
            );
            reportRow.appendChild(reportRowList);

            const reportItems = utils.createRowItems(reportRowList, step.reports[i]);
            this.reports!.push(reportItems);
        }
    }

    private checkReport(step: Part1TraceItemCheckReport) {
        this.reportsColumn!.children[step.index].classList.add("transition-all", "duration-500", "ease-in-out", "scale-110");
    }

    private checkLevels(step: Part1TraceItemCheckLevels) {
        utils.highlightItemIn(this.reports![step.index][step.lhsIndex]);
        utils.highlightItemIn(this.reports![step.index][step.rhsIndex]);
    }

    private checkLevelsPut(step: Part1TraceItemCheckLevelsPut) {
        const lhs = this.reports![step.index][step.lhsIndex];
        this.lhsItem!.textContent = lhs.text.textContent;
        utils.highlightItemOut(lhs);

        const rhs = this.reports![step.index][step.rhsIndex];
        this.rhsItem!.textContent = rhs.text.textContent;
        utils.highlightItemOut(rhs);
    }

    private absDiff(step: Part1TraceItemAbsDiff) {
        this.diffItem!.textContent = step.absDiff.toString();
    }

    private validDiff(_step: Part1TraceItemValidDiff) {
        this.diffItem!.classList.add("text-green-500");
    }

    private invalidDiff(_step: Part1TraceItemInvalidDiff) {
        this.diffItem!.classList.add("text-red-500");
    }

    private absDiffDone(_step: Part1TraceItemAbsDiffDone) {
        this.diffItem!.classList.remove("text-green-500", "text-red-500");
    }

    private checkAscending(step: Part1TraceItemCheckAscending) {
        if (step.ascending) {
            this.orderItem!.textContent = "increasing";
        } else {
            this.orderItem!.textContent = "decreasing";
        }
    }

    private sameOrder(_step: Part1TraceItemSameOrder) {
        this.orderItem!.classList.remove("text-red-500", "text-gray-500");
        this.orderItem!.classList.add("text-green-500");
    }

    private differentOrder(_step: Part1TraceItemDifferentOrder) {
        this.orderItem!.classList.remove("text-green-500", "text-gray-500");
        this.orderItem!.classList.add("text-red-500");
    }

    private checkAscendingDone(_step: Part1TraceItemCheckAscendingDone) {
        this.orderItem!.classList.remove("text-green-500", "text-red-500");
        this.orderItem!.classList.add("text-gray-500");
    }

    private validReport(step: Part1TraceItemValidReport) {
        this.reportsColumn!.children[step.index].classList.add("bg-green-500");
    }

    private total(step: Part1TraceItemTotal) {
        this.answerNumber!.textContent = step.total.toString();
        this.answerNumber!.classList.add("font-bold", "text-yellow-500");
    }

    private totalDone(_step: Part1TraceItemTotalDone) {
        this.answerNumber!.classList.remove("font-bold", "text-yellow-500");
    }

    private invalidReport(step: Part1TraceItemInvalidReport) {
        this.reportsColumn!.children[step.index].classList.add("bg-red-500");
    }

    private reportDone(step: Part1TraceItemDone) {
        this.reportsColumn!.children[step.index].classList.remove("scale-110", "bg-green-500");
        this.reportsColumn!.children[step.index].classList.add("opacity-0", "scale-0");

        setTimeout(() => {
            this.reportsColumn!.children[step.index].classList.add("hidden");
        }, 500);
    }

    private removeLevel(step: Part2TraceItemRemoveLevel) {
        const report = this.reports![step.index];
        utils.highlightItemIn(report[step.item], { color: "bg-red-500" });
    }

    private removeLevelDone(step: Part2TraceItemRemoveLevelDone) {
        const report = this.reports![step.index];
        utils.highlightItemOut(report[step.item], { color: "bg-red-500" });
    }

    private create() {
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
            "overflow-y-auto"  // Allow vertical scrolling
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

        // Create the top row of the middle pad
        const middleRow1 = document.createElement("ul");
        middleRow1.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mb-4"             // Margin bottom
        );
        middlePad.appendChild(middleRow1);

        // Create a vertical bar for the absolute value in the top row
        const absBarL = document.createElement("li");
        absBarL.classList.add(
            "h-16",            // Fixed height
            "w-1",             // Fixed width
            "bg-red-500"       // Background color
        );
        middleRow1.appendChild(absBarL);

        // Create left-hand side number item in the top row
        const lhsItem = utils.createNumberItem("");
        this.lhsItem = lhsItem.text;
        middleRow1.appendChild(lhsItem.item);

        // Create minus sign item in the top row
        const minusItem = document.createElement("li");
        minusItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-red-500"     // Red color for minus sign
        );
        minusItem.textContent = "-";
        middleRow1.appendChild(minusItem);

        // Create right-hand side number item in the top row
        const rhsItem = utils.createNumberItem("");
        this.rhsItem = rhsItem.text;
        middleRow1.appendChild(rhsItem.item);

        // Create a vertical bar for the absolute value in the top row
        const absBarR = document.createElement("li");
        absBarR.classList.add(
            "h-16",            // Fixed height
            "w-1",             // Fixed width
            "bg-red-500"       // Background color
        );
        middleRow1.appendChild(absBarR);

        // Create the middle row of the middle pad (2nd row with = and Abs Diff)
        const middleRow2 = document.createElement("ul");
        middleRow2.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mt-4"             // Margin top
        );
        middlePad.appendChild(middleRow2);

        // Create equal sign item
        const equalItem = document.createElement("li");
        equalItem.classList.add(
            "text-3xl",        // Large text size
            "font-extrabold",  // Extra bold text
            "text-yellow-500"  // Yellow color for equal sign
        );
        equalItem.textContent = "=";
        middleRow2.appendChild(equalItem);

        // Create L1 distance item
        const diffItem = utils.createNumberItem("");
        this.diffItem = diffItem.text;
        middleRow2.appendChild(diffItem.item);

        // Create the bottom row of the middle pad with "increasing" or "decreasing" text
        const middleRow3 = document.createElement("ul");
        middleRow3.classList.add(
            "flex",            // Flex container
            "flex-row",        // Arrange children in a row
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "space-x-2",       // Horizontal space between items
            "mt-4"             // Margin top
        );
        middlePad.appendChild(middleRow3);

        // Create increasing or decreasing text item in the bottom row
        this.orderItem = document.createElement("li");
        this.orderItem.classList.add(
            "text-md",         // Medium text size
            "font-extrabold",  // Extra bold text
            "text-gray-500"    // Gray text color
        );
        this.orderItem.textContent = "increasing";
        middleRow3.appendChild(this.orderItem);

        // Create the reports columns that will contain all the reports in the puzzle
        this.reportsColumn = document.createElement("ul");
        this.reportsColumn.classList.add(
            "flex",            // Flex container
            "flex-col",        // Arrange children in a column
            "justify-center",  // Center items horizontally
            "items-center",    // Center items vertically
            "mt-4"             // Margin top
        );
        puzzleDiv.appendChild(this.reportsColumn);

        this.reports = [];
    }
}

const part1 = new Part("part1");
part1.textareaInput.value = "7 6 4 2 1\n1 2 7 8 9\n9 7 6 2 1\n1 3 2 4 5\n8 6 4 4 1\n1 3 6 7 9";
const part1Solution = new Part1Solution(part1.textareaInput.value);
const part1Animator = new Part1Animator(part1.inputDiv, part1.solutionDiv);
const animator1 = new Animator(part1Solution, part1Animator);
part1.textareaInput.onchange = () => part1Solution.setInput(part1.textareaInput.value);
part1.solveButton.onclick = () => animator1.solve();
part1.stepButton.onclick = () => animator1.step();
part1.resetButton.onclick = () => animator1.reset();

const part2 = new Part("part2");
part2.textareaInput.value = "7 6 4 2 1\n1 2 7 8 9\n9 7 6 2 1\n1 3 2 4 5\n8 6 4 4 1\n1 3 6 7 9";
const part2Solution = new Part2Solution(part2.textareaInput.value);
const part2Animator = new Part2Animator(part2.inputDiv, part2.solutionDiv);
const animator2 = new Animator(part2Solution, part2Animator);
part2.textareaInput.onchange = () => part2Solution.setInput(part2.textareaInput.value);
part2.solveButton.onclick = () => animator2.solve();
part2.stepButton.onclick = () => animator2.step();
part2.resetButton.onclick = () => animator2.reset();

part1.descriptionDiv.appendChild(utils.createParagraph("For part1, we need to find the middle element of each report that satisfies the following conditions:"));
part1.descriptionDiv.appendChild(utils.createOrderedList([
    "The absolute difference between adjacent elements is 1, 2, or 3.",
    "The elements are in increasing or decreasing order (monotonic).",
]));

part2.descriptionDiv.appendChild(utils.createParagraph("For part2, we needed to find the \"almost\" valid reports. These are reports that are valid except for one element that is out of order."));
