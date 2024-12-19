import * as readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const input: string[] = [];
rl.on("line", (line) => {
    input.push(line);
});

rl.once("close", () => {
    main(input.join("\n"));
});


function parseInput(input: string): [string[], string[]] {
    const [towelsLine, puzzleBlock] = input.trim().split("\n\n");

    const towels = towelsLine.trim().split(", ");
    const patterns = puzzleBlock.trim().split("\n");

    return [towels, patterns];
}

function countDeisgns(pattern: string, towels: string[], memo: Map<string, number>): number {
    if (pattern === "") {
        return 1;
    }

    if (memo.has(pattern)) {
        return memo.get(pattern)!;
    }

    let count = 0;
    for (let i = 0; i < towels.length; i++) {
        const towel = towels[i];
        const patternPrefix = pattern.slice(0, towel.length);

        if (towel === patternPrefix) {
            const patternSuffix = pattern.slice(towel.length, pattern.length);

            count = count + countDeisgns(patternSuffix, towels, memo);
        }
    }

    memo.set(pattern, count);
    return count;
}

function main(input: string) {
    const [towels, patterns] = parseInput(input);

    let answer1 = 0;
    let answer2 = 0;
    for (let i = 0; i < patterns.length; i++) {
        const map = new Map<string, number>();
        const count = countDeisgns(patterns[i], towels, map);
        if (count) { answer1 += 1; }
        answer2 += count;
    }

    console.log(`Part1: ${answer1}`);
    console.log(`Part2: ${answer2}`);
}
