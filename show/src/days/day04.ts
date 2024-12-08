import { PartAnimator, Solution, Trace, utils } from "./common";

type Part1TraceItem = undefined;

class Part1Solution implements Solution<Part1TraceItem> {
    solve(): Trace<Part1TraceItem> {
        return [];
    }
}

class Part1Animator implements PartAnimator<Part1TraceItem> {
    reset(): void {
    }

    begin(): void {
    }

    step(step: Part1TraceItem): number {
        return 0;
    }
}

type Part2TraceItem = undefined;

class Part2Solution implements Solution<Part1TraceItem> {
    solve(): Trace<Part2TraceItem> {
        return [];
    }
}

class Part2Animator implements PartAnimator<Part1TraceItem> {
    reset(): void {
    }

    begin(): void {
    }

    step(step: Part2TraceItem): number {
        return 0;
    }
}

const DESCRIPTION_PART1 = [
    utils.createParagraph("TODO"),
];

const DESCRIPTION_PART2 = [
    utils.createParagraph("TODO"),
];

const DEFAULT_INPUT = "TODO";

export { Part1Solution, Part1Animator, Part2Solution, Part2Animator, DESCRIPTION_PART1, DESCRIPTION_PART2, DEFAULT_INPUT };
