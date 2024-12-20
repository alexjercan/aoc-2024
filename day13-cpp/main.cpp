#include <iostream>
#include <ostream>
#include <string>
#include <vector>

typedef struct {
    long x_a;
    long y_a;
    long x_b;
    long y_b;
    long x;
    long y;
} claw_machine;

std::string read_input() {
    std::string buffer;
    std::string line;
    while (std::getline(std::cin, line)) {
        buffer.append(line);
        buffer.append("\n");
    }

    buffer.pop_back();
    return buffer;
}

std::vector<std::string> split_string(const std::string& str,
                                      const std::string& delimiter) {
    std::vector<std::string> strings;

    std::string::size_type pos = 0;
    std::string::size_type prev = 0;
    while ((pos = str.find(delimiter, prev)) != std::string::npos)
    {
        strings.push_back(str.substr(prev, pos - prev));
        prev = pos + delimiter.size();
    }

    // To get the last substring (or only, if delimiter is not found)
    strings.push_back(str.substr(prev));

    return strings;
}

std::vector<claw_machine> parse_input(std::string buffer) {
    std::vector<claw_machine> machines;
    std::vector<std::string> lines, tokens;

    auto parts = split_string(buffer, "\n\n");
    for (auto & part : parts) {
        lines = split_string(part, "\n");
        tokens = split_string(lines[0], ",");
        auto xa = std::stoi(split_string(tokens[0], "+")[1]);
        auto ya = std::stoi(split_string(tokens[1], "+")[1]);
        tokens = split_string(lines[1], ",");
        auto xb = std::stoi(split_string(tokens[0], "+")[1]);
        auto yb = std::stoi(split_string(tokens[1], "+")[1]);
        tokens = split_string(lines[2], ",");
        auto x = std::stoi(split_string(tokens[0], "=")[1]);
        auto y = std::stoi(split_string(tokens[1], "=")[1]);

        claw_machine machine = (claw_machine){
            .x_a = xa,
            .y_a = ya,
            .x_b = xb,
            .y_b = yb,
            .x = x,
            .y = y,
        };

        machines.push_back(machine);
    }

    return machines;
}

long solve_machine(claw_machine machine, long offset) {
    machine.x += offset;
    machine.y += offset;

    long den = machine.x_a * machine.y_b -  machine.y_a * machine.x_b;
    if (den == 0) {
        return 0;
    }

    long a = machine.y_b * machine.x - machine.x_b * machine.y;
    long b = - machine.y_a * machine.x + machine.x_a * machine.y;

    long a_presses = a / den;
    long b_presses = b / den;

    long x = a_presses * machine.x_a + b_presses * machine.x_b;
    long y = a_presses * machine.y_a + b_presses * machine.y_b;

    if (x == machine.x && y == machine.y) {
        return a_presses * 3 + b_presses;
    }

    return 0;
}

int main() {
    std::string input = read_input();
    std::vector<claw_machine> machines = parse_input(input);

    long total = 0;
    for (auto & machine : machines) {
        total += solve_machine(machine, 0);
    }

    std::cout << "Part1: " << total << std::endl;

    total = 0;
    for (auto & machine : machines) {
        total += solve_machine(machine, 10000000000000);
    }

    std::cout << "Part2: " << total << std::endl;

    return 0;
}
