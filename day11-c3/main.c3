module main;

import std::io;
import std::math;
import std::collections;

def ListInt = List(<int128>);
def StoneMap = HashMap(<int128, int128>);

fn ListInt parse_input(String input) {
    ListInt list;
    list.new_init();

    String[] stones = input.split(" ");

    foreach (item : stones)
    {
        int128! number = item.to_int();
        if (catch excuse = number) {
            io::printfn("error: %s", excuse);
            continue;
        }
        list.push(number);
    }

    return list;
}

fn void increment_stone(StoneMap *map, int128 stone) {
    int128 count = 1;

    if (map.has_key(stone)) {
        int128 value = map.get(stone)!!;
        count = value + 1;
    }

    map.set(stone, count);
}

fn int128 get_or_default(StoneMap map, int128 stone) {
    if (map.has_key(stone)) {
        return map.get(stone)!!;
    }

    return 0;
}

fn int128 count_digits(int128 number) {
    if (number == 0) return 1;

    int128 counter = 0;
    while (number > 0) {
        counter += 1;
        number /= 10;
    }

    return counter;
}

fn StoneMap step(StoneMap map) {
    StoneMap result;
    result.new_init();

    foreach (stone : map.tcopy_keys()) {
        int128 count = map.get(stone)!!;

        if (stone == 0) {
            int128 new_stone = 1;
            int128 new_count = get_or_default(result, new_stone) + count;
            result.set(new_stone, new_count);
        } else {
            int128 digits_len = count_digits(stone);
            if (digits_len % 2 == 0) {
                int128 half_len = digits_len / 2;
                int128 padding = (int128)math::pow((double)10, (int)half_len);

                int128 lower = stone / padding;
                int128 higher = stone % padding;

                int128 lower_count = get_or_default(result, lower) + count;
                result.set(lower, lower_count);

                int128 higher_count = get_or_default(result, higher) + count;
                result.set(higher, higher_count);
            } else {
                int128 new_stone = 2024 * stone;
                int128 new_count = get_or_default(result, new_stone) + count;
                result.set(new_stone, new_count);
            }
        }
    }

    return result;
}

fn int128 part(ListInt stones, int128 times) {
    StoneMap map;
    map.new_init();

    foreach (stone : stones) {
        increment_stone(&map, stone);
    }

    int128 index = 0;
    while (index < times) {
        map = step(map);
        index += 1;
    }

    int128 total = 0;
    foreach (count : map.value_tlist()) {
        total += count;
    }

    return total;
}

fn int128 part1(ListInt stones) {
    return part(stones, 25);
}

fn int128 part2(ListInt stones) {
    return part(stones, 75);
}

fn void! main()
{
    String! input = io::readline();
    if (catch excuse = input) {
        return excuse?;
    }

    ListInt stones = parse_input(input);
    io::printfn("Part1: %d", part1(stones));
    io::printfn("Part2: %d", part2(stones));
}
