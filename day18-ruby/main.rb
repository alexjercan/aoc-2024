Point = Struct.new(:row, :col)

def parseInput
  points = Array.new
  STDIN.read.split("\n").each { |line|
    coords = line.split(",").map { |w| Integer(w) }
    point = Point.new(coords.fetch(0), coords.fetch(1))
    points.push(point)
  }

  maxW = points.map{ |p| p.col }.max()
  maxH = points.map{ |p| p.row }.max()

  width = maxW < 7 ? 7 : 71;
  height = maxH < 7 ? 7 : 71;

  return points, width, height
end

points, width, height = parseInput()
numberFallPoints = points.length < 1024 ? 12 : 1024

start = Point.new(0, 0)
target = Point.new(width - 1, height - 1)
fallPoints = points.take(numberFallPoints)
testPoints = points.drop(numberFallPoints)

def manhattan(pointA, pointB)
  (pointA.row - pointB.row).abs() + (pointA.col - pointB.col).abs()
end

def findMinScore(openSet, fScore)
  current = nil
  currentF = Float::INFINITY
  openSet.each { |point|
    f = fScore.has_key?(point) ? fScore.fetch(point) : Float::INFINITY
    if f < currentF then
      current = point
      currentF = f
    end
  }

  return current
end

def isBounded(point, width, height)
  return point.row >= 0 && point.row < height && point.col >= 0 && point.col < width
end

def isCorrupted(point, obstacles)
  return obstacles.index(point) != nil
end

def astar(obstacles, start, target, width, height)
  openSet = Set.new([start])
  gScore = Hash[start => 0]
  fScore = Hash[start => manhattan(start, target)]

  while openSet.length > 0 do
    current = findMinScore(openSet, fScore)
    if current == target then
      break
    end

    openSet.delete(current)
    [Point.new(-1, 0), Point.new(1, 0), Point.new(0, -1), Point.new(0, 1)].each { |delta|
      neighbor = Point.new(current.row + delta.row, current.col + delta.col)

      if isBounded(neighbor, width, height) && !isCorrupted(neighbor, obstacles) then
        gScoreCurrent = gScore.has_key?(current) ? gScore.fetch(current) : Float::INFINITY
        gScoreNeighbor = gScore.has_key?(neighbor) ? gScore.fetch(neighbor) : Float::INFINITY
        gScoreTenative = gScoreCurrent + 1
        if gScoreTenative < gScoreNeighbor then
          gScore[neighbor] = gScoreTenative
          fScore[neighbor] = gScoreTenative + manhattan(neighbor, target)
          openSet.add(neighbor)
        end
      end
    }
  end

  return gScore.has_key?(target) ? gScore.fetch(target) : nil
end

def part2(obstacles, testacles, start, target, width, height)
  counter = testacles.length / 2
  half = counter
  while true do
    newObstacles = obstacles.map(&:clone)
    newObstacles.push(*testacles.take(counter))

    path = astar(newObstacles, start, target, width, height)
    if path != nil then
      newObstacles = obstacles.map(&:clone)
      newObstacles.push(*testacles.take(counter + 1))
      if astar(newObstacles, start, target, width, height) == nil then
        return testacles[counter]
      end

      counter = counter + half / 2
      half = half / 2
    else
      counter = counter - half / 2
      half = half / 2
    end
  end

  return nil
end

result1 = astar(fallPoints, start, target, width, height)
puts "Part1: #{result1}"
result2 = part2(fallPoints, testPoints, start, target, width, height)
puts "Part2: #{result2.row},#{result2.col}"
