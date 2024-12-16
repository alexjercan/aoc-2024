import math
import sys
import heapq
from collections import defaultdict

DIRECTIONS = [(0, 1), (0, -1), (1, 0), (-1, 0)]


def point_add(point_a, point_b):
    return (point_a[0] + point_b[0], point_a[1] + point_b[1])


def neighbors(point, d):
    ns = []
    for nd in DIRECTIONS:
        if d == nd:
            ns.append(((point_add(point, nd), d), 1))
        elif (-d[0], -d[1]) == nd:
            continue
        else:
            ns.append(((point, nd), 1000))

    return ns


def parse_input(input: str):
    lines = input.strip().splitlines()
    height = len(lines)
    width = len(lines[0])

    def is_bounded(nc):
        (n, _), _ = nc
        return 0 <= n[0] and n[0] < height and 0 <= n[1] and n[1] < width

    def is_empty(nc):
        (n, _), _ = nc
        ch = lines[n[0]][n[1]]
        return ch == "." or ch == "S" or ch == "E"

    puzzle = dict()
    start = None
    end = None
    for row in range(len(lines)):
        line = lines[row]
        for col in range(len(line)):
            point = (row, col)

            if lines[row][col] == "S":
                start = point

            if lines[row][col] == "E":
                end = point

            if not is_empty(((point, 0), 0)):
                continue

            for d in DIRECTIONS:
                ns = neighbors(point, d)
                ns = list(filter(is_bounded, ns))
                ns = list(filter(is_empty, ns))
                puzzle[(point, d)] = ns

    return puzzle, (start, DIRECTIONS[0]), end, width, height


def part1(puzzle, start, end):
    dist = dict()
    Q = [(0, start)]

    while len(Q) > 0:
        c, u = heapq.heappop(Q)
        if u in dist:
            continue

        dist[u] = c
        for v, weight in puzzle[u]:
            if v not in dist:
                heapq.heappush(Q, (c + weight, v))

    return min([dist[(end, d)] for d in DIRECTIONS])


def reconstruct_paths(prev, end):
    paths = []
    q = [end]
    while len(q) > 0:
        u = q.pop(0)
        paths.append(u)
        us = prev.get(u, [])
        for s in us:
            q.append(s)

    return paths

def part2(puzzle, start, end, width, height):
    dist = dict()
    prev = defaultdict(list)
    Q = [(0, start)]

    while len(Q) > 0:
        c, u = heapq.heappop(Q)
        if u in dist:
            continue

        dist[u] = c
        for v, weight in puzzle[u]:
            if v in dist and dist[v] == c + weight:
                prev[v].append(u)

            if v not in dist:
                prev[v].append(u)
                heapq.heappush(Q, (c + weight, v))

    paths = []
    m = min([dist[(end, d)] for d in DIRECTIONS])
    for d in DIRECTIONS:
        if m == dist[(end, d)]:
            paths.extend(reconstruct_paths(prev, (end, d)))

    paths = list(set([p[0] for p in paths]))
    return len(paths)


if __name__ == "__main__":
    lines = sys.stdin.read()
    puzzle, start, end, width, height = parse_input(lines)
    result1 = part1(puzzle, start, end)
    print(f"Part1: {result1}")
    result2 = part2(puzzle, start, end, width, height)
    print(f"Part2: {result2}")
