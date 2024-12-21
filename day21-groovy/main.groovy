// https://github.com/ayoubzulfiqar/advent-of-code/tree/main/2024/Python/Day21

import java.nio.file.*
import java.util.stream.*
import java.util.*

class Vector {
    int x, y

    Vector(int x, int y) {
        this.x = x
        this.y = y
    }

    Vector plus(Vector other) {
        return new Vector(this.x + other.x, this.y + other.y)
    }

    Vector minus(Vector other) {
        return new Vector(this.x - other.x, this.y - other.y)
    }

    boolean equals(Vector other) {
        return this.x == other.x && this.y == other.y
    }

    @Override
    int hashCode() {
        return Objects.hash(x, y)
    }

    @Override
    String toString() {
        return "($x, $y)"
    }
}

class Solution {
    int robots

    Solution(int robots = 1) {
        this.robots = robots
    }

    def POSITIONS = [
        "7": new Vector(0, 0), "8": new Vector(0, 1), "9": new Vector(0, 2),
        "4": new Vector(1, 0), "5": new Vector(1, 1), "6": new Vector(1, 2),
        "1": new Vector(2, 0), "2": new Vector(2, 1), "3": new Vector(2, 2),
        "0": new Vector(3, 1), "A": new Vector(3, 2), "^": new Vector(0, 1),
        "a": new Vector(0, 2), "<": new Vector(1, 0), "v": new Vector(1, 1),
        ">": new Vector(1, 2)
    ]

    def DIRECTIONS = [
        "^": new Vector(-1, 0), "v": new Vector(1, 0),
        "<": new Vector(0, -1), ">": new Vector(0, 1)
    ]

    def memoization = [:]

    List<String> movesSet(Vector start, Vector fin, Vector avoid = new Vector(0, 0)) {
        def delta = fin.minus(start)
        def dx = delta.x
        def dy = delta.y

        StringBuilder string = new StringBuilder()
        if (dx < 0) string.append("^" * -dx)
        else string.append("v" * dx)

        if (dy < 0) string.append("<" * -dy)
        else string.append(">" * dy)

        def moves = string.toString().toList()

        if (moves.isEmpty()) return ["a"]
        def permutations = moves.permutations().findAll { perm ->
            !perm.indices.any { i ->
                def cumulative = perm.take(i).inject(new Vector(0, 0)) { acc, move ->
                    acc.plus(DIRECTIONS[move])
                }
                cumulative.plus(start).equals(avoid)
            }
        }.collect { it.join("") + "a" }

        return permutations
    }

    long minLength(String s, int depth = 0) {
        def key = [s, depth, robots]
        if (memoization.containsKey(key)) return memoization[key]

        def avoid = depth == 0 ? new Vector(3, 0) : new Vector(0, 0)
        def cur = depth == 0 ? POSITIONS["A"] : POSITIONS["a"]
        long length = 0

        s.each { ch ->
            def nextCurrent = POSITIONS[ch]
            def moveSet = movesSet(cur, nextCurrent, avoid)
            if (depth == robots) {
                length += moveSet[0].size()
            } else {
                length += moveSet.collect { minLength(it, depth + 1) }.min()
            }
            cur = nextCurrent
        }

        memoization[key] = length
        return length
    }
}

def solve(String code, int robots) {
    return new Solution(robots).minLength(code)
}

def toNumber(String s) {
    // 029A -> 29
    s.findAll(/\d/).join().toInteger()
}

def reader = System.in.newReader()

def codes = reader.readLines()

def part1 = codes.collect { line ->
    solve(line, 2) * toNumber(line)
}.sum()

def part2 = codes.collect { line ->
    solve(line, 25) * toNumber(line)
}.sum()

println "Part 1: $part1"
println "Part 2: $part2"
