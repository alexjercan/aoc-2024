const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const map = [];
rl.on("line", (line) => {
    map.push(line);
});

rl.once("close", () => {
    main(map);
});

const UP = "^";
const RIGHT = ">";
const DOWN = "v";
const LEFT = "<";

function guardPosition(map) {
    let row = -1;
    let col = -1;
    for (let i = 0; i < map.length; i++) {
        col = map[i].search("\\^");
        if (col !== -1) {
            row = i;
            break;
        }
    }

    return [row, col];
}

function placablePositions(map) {
    let ps = [];
    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            if (map[row][col] === ".") {
                ps.push([row, col]);
            }
        }
    }

    return ps;
}

class Guard {
    constructor(map) {
        let [row, col] = guardPosition(map);

        this.map = map;
        this.row = row;
        this.col = col;
        this.facing = UP;
    }

    isBounded() {
        return this.isBounded0(this.row, this.col);
    }

    isBounded0(row, col) {
        return row >= 0 && col >= 0 && row < this.map.length && col < this.map[0].length;
    }

    isValid(row, col) {
        if (!this.isBounded0(row, col)) return true;

        return this.map[row][col] !== '#';
    }

    stepUp() {
        const newRow = this.row - 1;
        const newCol = this.col;

        if (this.isValid(newRow, newCol)) {
            this.row = newRow;
            this.col = newCol;
            this.facing = UP;
        } else {
            this.stepRight();
        }
    }

    stepRight() {
        const newRow = this.row;
        const newCol = this.col + 1;

        if (this.isValid(newRow, newCol)) {
            this.row = newRow;
            this.col = newCol;
            this.facing = RIGHT;
        } else {
            this.stepDown();
        }
    }

    stepDown() {
        const newRow = this.row + 1;
        const newCol = this.col;

        if (this.isValid(newRow, newCol)) {
            this.row = newRow;
            this.col = newCol;
            this.facing = DOWN;
        } else {
            this.stepLeft();
        }
    }

    stepLeft() {
        const newRow = this.row;
        const newCol = this.col - 1;

        if (this.isValid(newRow, newCol)) {
            this.row = newRow;
            this.col = newCol;
            this.facing = LEFT;
        } else {
            this.stepUp();
        }
    }

    step() {
        if (this.facing === UP) { this.stepUp(); }
        else if (this.facing === RIGHT) { this.stepRight(); }
        else if (this.facing === DOWN) { this.stepDown(); }
        else if (this.facing === LEFT) { this.stepLeft(); }
    }

    stepOutside() {
        let steps = new Set();
        while (this.isBounded()) {
            steps.add(`${this.row}_${this.col}`);
            this.step();
        }

        return steps.size;
    }

    isCycle() {
        let steps = new Set();
        while (this.isBounded()) {
            const item = `${this.row}_${this.col}_${this.facing}`;
            if (steps.has(item)) return true;
            steps.add(item);
            this.step();
        }

        return false;
    }
}

function main(map) {
    let part1 = new Guard(map).stepOutside();
    console.log(`Part1: ${part1}`);

    let part2 = placablePositions(map).map(([row, col]) => {
        let map2 = structuredClone(map);
        line = map2[row];
        map2[row] = line.substring(0, col) + "#" + line.substring(col+1);
        if (new Guard(map2).isCycle()) { return 1; } else { return 0; }
    }).reduce((acc, x) => acc + x);
    console.log(`Part2: ${part2}`);
}
