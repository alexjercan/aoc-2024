fun prng(seed: Long): Long {
    val MASK = (1L shl 24) - 1
    var seed = seed
    seed = seed xor ((seed shl 6) and MASK)
    seed = seed xor ((seed shr 5) and MASK)
    seed = seed xor ((seed shl 11) and MASK)
    return seed
}

fun part1(numbers: List<Long>): Long {
    return numbers.fold(0) { sum, seed ->
        (0 until 2000).fold(seed) { acc, _ -> prng(acc) } + sum
    }
}

data class Quadruple(val a: Long, val b: Long, val c: Long, val d: Long) {
    fun push(x: Long): Quadruple {
        return Quadruple(b, c, d, x)
    }
}

fun part2(numbers: List<Long>): Long {
    return numbers.fold(mutableMapOf<Quadruple, Long>()) { prices, number ->
        var visited = mutableSetOf<Quadruple>()
        var quad = Quadruple(0, 0, 0, 0)
        var last = number % 10

        generateSequence(number) { prng(it) }
            .take(2000)
            .forEachIndexed { j, seed ->
                quad = quad.push(seed % 10 - last)
                last = seed % 10

                if (j >= 4 && quad !in visited) {
                    prices[quad] = prices.getOrDefault(quad, 0) + seed % 10
                    visited.add(quad)
                }
            }

        prices
    }.values.max()!!
}

fun main() {
    val numbers = generateSequence(::readLine).map { it.toLong() }.toList()

    val result1 = part1(numbers)
    println("Part 1: $result1")

    val result2 = part2(numbers)
    println("Part 2: $result2")
}
