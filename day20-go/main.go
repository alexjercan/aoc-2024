package main

import (
	"bufio"
	"container/heap"
	"fmt"
	"os"
)

type Item struct {
    priority int
    point Point
    index int
}

type PriorityQueue []*Item

func (pq PriorityQueue) Len() int { return len(pq) }

func (pq PriorityQueue) Less(i, j int) bool {
	// We want Pop to give us the highest, not lowest, priority so we use greater than here.
	return pq[i].priority > pq[j].priority
}

func (pq PriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
	pq[i].index = i
	pq[j].index = j
}

func (pq *PriorityQueue) Push(x any) {
	n := len(*pq)
	item := x.(*Item)
	item.index = n
	*pq = append(*pq, item)
}

func (pq *PriorityQueue) Pop() any {
	old := *pq
	n := len(old)
	item := old[n-1]
	old[n-1] = nil  // don't stop the GC from reclaiming the item eventually
	item.index = -1 // for safety
	*pq = old[0 : n-1]
	return item
}

// update modifies the priority and value of an Item in the queue.
func (pq *PriorityQueue) update(item *Item, point Point, priority int) {
	item.point = point
	item.priority = priority
	heap.Fix(pq, item.index)
}

func readInput() ([]string) {
    var puzzle []string

    scanner := bufio.NewScanner(os.Stdin)
    for scanner.Scan() {
        line := scanner.Text()
        if len(line) > 0 {
            puzzle = append(puzzle, line)
        }
    }

    return puzzle
}

type Point struct {
    row int
    col int
}

func absInt(x int) int {
   return absDiffInt(x, 0)
}

func absDiffInt(x, y int) int {
   if x < y {
      return y - x
   }
   return x - y
}

func manhattan(p1 Point, p2 Point) int {
    return absInt(p1.row - p2.row) + absInt(p1.col - p2.col)
}

func isBounded(p Point, width int, height int) bool {
    return 0 <= p.row && p.row < height && 0 <= p.col && p.col < width
}

func getNeighbors(p Point) []Point {
    return []Point{
        {p.row-1, p.col},
        {p.row+1, p.col},
        {p.row, p.col-1},
        {p.row, p.col+1},
    }
}

func parseInput(puzzle []string) (int, int, Point, Point, map[Point][]Point) {
    height := len(puzzle)
    width := len(puzzle[0])

    var neighbors map[Point][]Point = make(map[Point][]Point)
    var start Point
    var end Point
    for row := 0; row < height; row++ {
        for col := 0; col < width; col++ {
            ch := puzzle[row][col]
            if ch == 'S' {
                start = Point{row, col}
            } else if ch == 'E' {
                end = Point{row, col}
            }

            if ch == '#' {
                continue
            } else {
                p := Point{row, col}
                neighbors[p] = make([]Point, 0)

                for _, n := range getNeighbors(p) {
                    if !isBounded(n, width, height) {
                        continue;
                    }

                    if puzzle[n.row][n.col] == '#' {
                        continue
                    }

                    neighbors[p] = append(neighbors[p], n)
                }
            }
        }
    }

    return height, width, start, end, neighbors
}

func dijkstra(neighbors map[Point][]Point, start Point) map[Point]int {
    dist := make(map[Point]int)

    pq := make(PriorityQueue, 1)
    pq[0] = &Item{
        priority: 0,
        point: start,
        index: 0,
    }
    heap.Init(&pq)

    for len(pq) > 0 {
        current := pq.Pop().(*Item)
        _, ok := dist[current.point]
        if ok {
            continue
        }

        dist[current.point] = current.priority
        for _, n := range neighbors[current.point] {
            _, ok := dist[n]
            if ok {
                continue
            }

            pq.Push(&Item { priority: current.priority + 1, point: n, index: 0 })
        }
    }

    return dist
}

func part(dist map[Point]int, pico int) int {
    result := 0
    for p1, d1 := range dist {
        for p2, d2 := range dist {
            if p1 == p2 {
                continue
            }

            steps := manhattan(p1, p2)
            saved := d2 - d1 - steps
            if steps <= pico && saved >= 100 {
                result = result + 1
            }
        }
    }

    return result
}

func main() {
    puzzle := readInput()
    _, _, start, _, neighbors := parseInput(puzzle)
    dist := dijkstra(neighbors, start)

    result1 := part(dist, 2)
    fmt.Println("Part1: ", result1)

    result2 := part(dist, 20)
    fmt.Println("Part2: ", result2)
}
