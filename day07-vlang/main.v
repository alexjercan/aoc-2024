import os { get_lines }
import strconv { format_uint, parse_uint }

struct Equation {
	test u64
	ops  []u64
}

fn parse_line(line string) !Equation {
	parts := line.split(':')

	test := parse_uint(parts[0], 10, 64)!
	mut ops := []u64{}

	for w in parts[1].trim(' ').split(' ') {
		ops << parse_uint(w, 10, 64)!
	}

	return Equation{test, ops}
}

fn parse_input(lines []string) ![]Equation {
	mut equations := []Equation{}
	for line in lines {
		equations << parse_line(line)!
	}

	return equations
}

fn is_calibrated_rec(equation Equation, index u64, total u64) bool {
	if equation.ops.len <= index {
		return equation.test == total
	}

	addi := is_calibrated_rec(equation, index + 1, total + equation.ops[index])
	mult := is_calibrated_rec(equation, index + 1, total * equation.ops[index])

	return addi || mult
}

fn is_calibrated(equation Equation) bool {
	return is_calibrated_rec(equation, 1, equation.ops[0])
}

fn part1(equations []Equation) u64 {
	mut test := u64(0)
	for equation in equations {
		if is_calibrated(equation) {
			test = test + equation.test
		}
	}
	return test
}

fn is_calibrated_rec2(equation Equation, index u64, total u64) bool {
	if equation.ops.len <= index {
		return equation.test == total
	}

	addi := is_calibrated_rec2(equation, index + 1, total + equation.ops[index])
	mult := is_calibrated_rec2(equation, index + 1, total * equation.ops[index])

	c := format_uint(total, 10) + format_uint(equation.ops[index], 10)
	n := parse_uint(c, 10, 64) or { 0 }
	conc := is_calibrated_rec2(equation, index + 1, n)

	return addi || mult || conc
}

fn is_calibrated2(equation Equation) bool {
	return is_calibrated_rec2(equation, 1, equation.ops[0])
}

fn part2(equations []Equation) u64 {
	mut test := u64(0)
	for equation in equations {
		if is_calibrated2(equation) {
			test = test + equation.test
		}
	}
	return test
}

fn main() {
	lines := get_lines()
	equations := parse_input(lines)!

	result1 := part1(equations)
	println('Part1: ' + format_uint(result1, 10))
	result2 := part2(equations)
	println('Part2: ' + format_uint(result2, 10))
}
