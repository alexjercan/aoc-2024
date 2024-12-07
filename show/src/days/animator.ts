import { speedEventListener } from "../day";

type Trace<T> = T[];

interface Solution<T> {
    solve(): Trace<T>;
}

interface PartAnimator<T> {
    reset(): void;
    begin(): void;
    step(step: T): number;
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

export { Animator, Solution, PartAnimator, Trace };
