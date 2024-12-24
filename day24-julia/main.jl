function parse_input(content)
    initial, rules = split(strip(content), "\n\n")
    inputs = split(strip(initial), "\n")
    rules = split(strip(rules), "\n")

    values = Dict()
    for input in inputs
        name, value = split(strip(input), ": ")
        values[name] = parse(Int, value)
    end

    neighbors = Dict{String, Set}()  # String => Set(String[])
    incoming = Dict{String, Int}()  # String => Int
    operands = Dict()  # name => op
    for rule in rules
        lhs, op, rhs, _, output = split(strip(rule), " ")
        if lhs > rhs
            aux = lhs
            lhs = rhs
            rhs = aux
        end

        neighbors[lhs] = push!(get(neighbors, lhs, Set()), output)
        neighbors[rhs] = push!(get(neighbors, rhs, Set()), output)

        incoming[output] = 0
        if !haskey(values, lhs)
            incoming[output] = get(incoming, output, 0) + 1
        end
        if !haskey(values, rhs)
            incoming[output] = get(incoming, output, 0) + 1
        end

        operands[output] = (lhs, rhs, op)
    end

    return values, neighbors, incoming, operands
end

function part1(content)
    values, neighbors, incoming, operands = parse_input(content)

    queue = String[]
    for (wire, count) in incoming
        if count == 0
            push!(queue, wire)
        end
    end

    while length(queue) > 0
        current = popfirst!(queue)
        lhs, rhs, op = operands[current]
        lhs_value = values[lhs]
        rhs_value = values[rhs]

        value = 0
        if op == "AND"
            value = lhs_value & rhs_value
        elseif op == "OR"
            value = lhs_value | rhs_value
        elseif op == "XOR"
            value = lhs_value ⊻ rhs_value
        else
            throw("oops")
        end

        values[current] = value

        for n in get(neighbors, current, Set())
            incoming[n] = incoming[n] - 1
            if incoming[n] == 0
                push!(queue, n)
            end
        end
    end

    outputs = []
    for (wire, value) in values
        if startswith(wire, "z")
            push!(outputs, (wire, value))
        end
    end
    sort!(outputs, rev=true)
    output = ""
    for (_, value) in outputs
        output = output * string(value)
    end
    return parse(Int, output, base=2)
end

function search_operands(operands, wire1, wire2, opp)
    for (wire, (lhs, rhs, op)) in operands
        if ((wire1 == lhs && wire2 == rhs) || (wire1 == rhs && wire2 == lhs)) && op == opp
            return wire
        end
    end

    return ""
end

function search_outputs(operands, wire1, opp, wire2)
    for (wire, (lhs, rhs, op)) in operands
        if ((wire1 == lhs && wire2 == wire)) && op == opp
            return rhs
        end

        if ((wire1 == rhs && wire2 == wire)) && op == opp
            return lhs
        end
    end

    return ""
end

function part2(content)
    values, neighbors, incoming, operands = parse_input(content)

    zs = Set()
    for (wire, (lhs, rhs, op)) in operands
        if startswith(wire, "z")
            push!(zs, wire)
        end
    end
    adder_size = length(zs)

    @assert search_operands(operands, "x00", "y00", "XOR") == "z00"
    carry = search_operands(operands, "x00", "y00", "AND")

    swaps = Dict()
    for index in 1:adder_size-2
        x_name = "x" * lpad(index, 2, "0")
        y_name = "y" * lpad(index, 2, "0")
        z_name = "z" * lpad(index, 2, "0")

        inter1 = search_operands(operands, x_name, y_name, "XOR")
        inter1 = get(swaps, inter1, inter1)
        @assert inter1 != ""

        should_be_z = search_operands(operands, carry, inter1, "XOR")
        if (should_be_z == "")
            needed_inter1 = search_outputs(operands, carry, "XOR", z_name)
            swaps[inter1] = needed_inter1
            swaps[needed_inter1] = inter1
            inter1 = needed_inter1
        elseif (should_be_z != z_name)
            swaps[z_name] = should_be_z
            swaps[should_be_z] = z_name
        end

        inter2 = search_operands(operands, x_name, y_name, "AND")
        inter2 = get(swaps, inter2, inter2)
        @assert inter2 != ""
        inter3 = search_operands(operands, carry, inter1, "AND")
        inter3 = get(swaps, inter3, inter3)
        @assert inter3 != ""
        carry = search_operands(operands, inter2, inter3, "OR")
        carry = get(swaps, carry, carry)
        @assert carry != ""
    end

    return join(sort!(collect(keys(swaps))), ",")
end

content = read(stdin, String)
result1 = part1(content)
println("Part1: ", result1)
result2 = part2(content)
println("Part2: ", result2)
