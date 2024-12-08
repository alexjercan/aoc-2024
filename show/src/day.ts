import { Solution, PartAnimator, Trace } from "./days/common";

function computeSpeed(value: number): number {
    if (value <= 0) {
        return 1;
    }

    return value * 2;
}

function speedEventListener(callback: (speed: number) => void) {
    const speedSlider = document.getElementById("settings-speed") as HTMLInputElement;
    speedSlider.addEventListener("input", () => {
        callback(computeSpeed(parseInt(speedSlider.value)));
    });
}

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

class Animator<T> {
    private abortController: AbortController;
    private part: PartAnimator<T>;
    private solution: Solution<T>;
    speed: number = 1;

    private state?: { trace: Trace<T>, stepIndex: number };

    constructor(solution: Solution<T>, part: PartAnimator<T>) {
        this.abortController = new AbortController();
        this.part = part;
        this.solution = solution;
        this.speed = 1;

        speedEventListener(speed => { this.speed = speed; });

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

            const timeout = this.part.step(step) * (1 / this.speed);
            this.state.stepIndex++;
            await new Promise(resolve => setTimeout(resolve, timeout));
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

export { computeSpeed, speedEventListener, Part, Animator };
