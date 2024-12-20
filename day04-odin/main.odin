package main

import "core:os"
import "core:strings"
import "core:fmt"

get_puzzle :: proc() -> [dynamic]string {
    data, _ := os.read_entire_file_from_handle(os.stdin)
    it := string(data)
    puzzle := [dynamic]string{};
    for line in strings.split_lines_iterator(&it) {
        append(&puzzle, line)
    }

    return puzzle
}

part1 :: proc(puzzle: [dynamic]string, cols: int, rows: int) -> int {
    // XMAS
    answer := 0
    for row := 0; row < rows; row += 1 {
        for col := 0; col < cols; col += 1 {
            // - >
            if col <= cols - 4 {
                line := puzzle[row]
                slice := line[col:col+4]
                if "XMAS" == slice do answer += 1
            }

            // - <
            if col >= 3 {
                slice := string([]u8{puzzle[row][col], puzzle[row][col-1], puzzle[row][col-2], puzzle[row][col-3]})
                if "XMAS" == slice do answer += 1
            }

            // | v
            if row <= rows - 4 {
                slice := string([]u8{puzzle[row][col], puzzle[row+1][col], puzzle[row+2][col], puzzle[row+3][col]})
                if "XMAS" == slice do answer += 1
            }

            // | ^
            if row >= 3 {
                slice := string([]u8{puzzle[row][col], puzzle[row-1][col], puzzle[row-2][col], puzzle[row-3][col]})
                if "XMAS" == slice do answer += 1
            }

            // >v
            if col <= cols - 4 && row <= rows - 4 {
                slice := string([]u8{puzzle[row][col], puzzle[row+1][col+1], puzzle[row+2][col+2], puzzle[row+3][col+3]})
                if "XMAS" == slice do answer += 1
            }

            // >^
            if col <= cols - 4 && row >= 3 {
                slice := string([]u8{puzzle[row][col], puzzle[row-1][col+1], puzzle[row-2][col+2], puzzle[row-3][col+3]})
                if "XMAS" == slice do answer += 1
            }

            // <v
            if col >= 3 && row <= rows - 4 {
                slice := string([]u8{puzzle[row][col], puzzle[row+1][col-1], puzzle[row+2][col-2], puzzle[row+3][col-3]})
                if "XMAS" == slice do answer += 1
            }

            // <^
            if col >= 3 && row >= 3 {
                slice := string([]u8{puzzle[row][col], puzzle[row-1][col-1], puzzle[row-2][col-2], puzzle[row-3][col-3]})
                if "XMAS" == slice do answer += 1
            }
        }
    }

    return answer
}

part2 :: proc(puzzle: [dynamic]string, cols: int, rows: int) -> int {
    // XMAS
    answer := 0
    for row := 0; row < rows; row += 1 {
        for col := 0; col < cols; col += 1 {
            ok1 := false
            ok2 := false

            // >v
            if col >= 1 && row >= 1 && col <= cols - 2 && row <= rows - 2 {
                slice := string([]u8{puzzle[row-1][col-1], puzzle[row][col], puzzle[row+1][col+1]})
                if "MAS" == slice || "SAM" == slice do ok1 = true
            }

            // >^
            if col >= 1 && row <= rows - 2 && col <= cols - 2 && row >= 1 {
                slice := string([]u8{puzzle[row+1][col-1], puzzle[row][col], puzzle[row-1][col+1]})
                if "MAS" == slice || "SAM" == slice do ok2 = true
            }

            if ok1 && ok2 do answer += 1
        }
    }

    return answer
}

main :: proc() {
    puzzle := get_puzzle()

    height := len(puzzle)
    width := len(puzzle[0])

    answer1 := part1(puzzle, height, width)
    answer2 := part2(puzzle, height, width)

    fmt.println("Part1: ", answer1);
    fmt.println("Part2: ", answer2);
}
