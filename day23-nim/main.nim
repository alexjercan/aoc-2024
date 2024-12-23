import os
import tables
import sequtils
import strutils
import sets
import algorithm


iterator choose*[T](a: openarray[T], num_choose: int): seq[T] =
  var
    chosen = newSeqOfCap[T](num_choose)
    i = 0
    i_stack = newSeqOfCap[int](num_choose)

  while true:
    if chosen.len == num_choose:
      yield chosen
      discard chosen.pop()
      i = i_stack.pop() + 1
    elif i != a.len:
      chosen.add(a[i])
      i_stack.add(i)
      inc i
    elif i_stack.len > 0:
      discard chosen.pop()
      i = i_stack.pop() + 1
    else:
      break


proc parseInput(input: string): Table[string, seq[string]] =
    let edges = map(
        input.strip().split('\n'),
        proc(line: string): (string, string) =
            let vertices = line.split('-')
            (vertices[0], vertices[1])
    )
    var connections = initTable[string, seq[string]]()
    for i, (a, b) in edges:
        connections[a] = connections.getOrDefault(a, @[]) & @[b]
        connections[b] = connections.getOrDefault(b, @[]) & @[a]

    connections


proc startsWithT(trio: HashSet[string]): bool =
    any(toSeq(trio), proc(s: string): bool = s.startsWith('t'))


proc part1(connections: Table[string, seq[string]]): int =
    var counter = 0
    var visited = initHashSet[HashSet[string]]()

    for computer, neighbors in connections:
        for neighbor in neighbors:
            for other in intersection(toHashSet(neighbors), toHashSet(connections[neighbor])):
                let trio = toHashSet([computer, neighbor, other])
                if not visited.contains(trio) and startsWithT(trio):
                    counter += 1
                    visited.incl(trio)

    counter


proc part2(connections: Table[string, seq[string]]): string =
    var max_component = 0
    var largest_component: seq[string] = @[]

    for computer, neighbors in connections:
        var potential = len(neighbors)
        while potential >= max_component:
            for selected in choose(neighbors, potential):
                var clique = (selected & @[computer]).toHashSet()
                for s in selected:
                    clique = clique * (connections[s] & @[s]).toHashSet()

                if len(clique) > max_component:
                    max_component = len(clique)
                    largest_component = clique.toSeq()

            potential -= 1

    sort(largest_component, system.cmp)
    largest_component.join(",")


let input = stdin.readAll()
let connections = parseInput(input)

let result1 = part1(connections)
echo "Part1: ", result1

let result2 = part2(connections)
echo "Part2: ", result2
