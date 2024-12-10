const std = @import("std");
var gpa = std.heap.GeneralPurposeAllocator(.{}){};
const allocator = gpa.allocator();
const IVec2 = struct { i64, i64 };
const Directions = [4]IVec2{ .{ -1, 0 }, .{ 1, 0 }, .{ 0, -1 }, .{ 0, 1 } };

fn parse_input() ![][]u8 {
    const stdin = std.io.getStdIn().reader();

    var buf: [1024]u8 = undefined;
    var list = std.ArrayList([]u8).init(allocator);

    while (try stdin.readUntilDelimiterOrEof(buf[0..], '\n')) |line| {
        const bytes = try allocator.alloc(u8, line.len);
        for (0.., line) |i, ch| {
            bytes[i] = ch - '0';
        }
        try list.append(bytes);
    }

    return list.items;
}

fn isBounded(pos: IVec2, map: [][]u8) bool {
    return 0 <= pos[0] and pos[0] < map.len and 0 <= pos[1] and pos[1] < map[0].len;
}

fn ivec2Add(a: IVec2, b: IVec2) IVec2 {
    return .{ a[0] + b[0], a[1] + b[1] };
}

fn mapGet(map: [][]u8, pos: IVec2) u8 {
    return map[@intCast(pos[0])][@intCast(pos[1])];
}

fn hike(map: [][]u8, pos: IVec2) ![]IVec2 {
    if (mapGet(map, pos) == 9) {
        const xs = try allocator.alloc(IVec2, 1);
        xs[0] = pos;
        return xs;
    } else {
        var list = std.ArrayList(IVec2).init(allocator);
        for (Directions) |dir| {
            const newPos = ivec2Add(pos, dir);
            if (isBounded(newPos, map) and mapGet(map, pos) + 1 == mapGet(map, newPos)) {
                const results = try hike(map, newPos);
                try list.appendSlice(results);
            }
        }

        return list.items;
    }
}

fn trailhead(map: [][]u8, row: i64, col: i64) !u64 {
    const results = try hike(map, .{ row, col });

    var dups = std.AutoHashMap(IVec2, bool).init(allocator);
    for (results) |result| {
        try dups.put(result, true);
    }

    return dups.count();
}

fn rating(map: [][]u8, row: i64, col: i64) !u64 {
    const results = try hike(map, .{ row, col });

    return results.len;
}

fn part1(map: [][]u8) !u64 {
    var total: u64 = 0;

    for (0..map.len) |row| {
        for (0..map[row].len) |col| {
            if (map[row][col] == 0) {
                total += try trailhead(map, @intCast(row), @intCast(col));
            }
        }
    }

    return total;
}

fn part2(map: [][]u8) !u64 {
    var total: u64 = 0;

    for (0..map.len) |row| {
        for (0..map[row].len) |col| {
            if (map[row][col] == 0) {
                total += try rating(map, @intCast(row), @intCast(col));
            }
        }
    }

    return total;
}

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    const map = try parse_input();

    const result1 = try part1(map);
    try stdout.print("Part1: {}\n", .{result1});

    const result2 = try part2(map);
    try stdout.print("Part2: {}\n", .{result2});
}
