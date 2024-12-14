defmodule Robot do
  @enforce_keys [:position, :velocity]
  defstruct [:position, :velocity]

  def parse(line) do
    [pos, vel] = String.split(line, " ")
    [_, pos] = String.split(pos, "=")
    [x, y] = String.split(pos, ",") |> Enum.map(&String.to_integer/1)
    [_, vel] = String.split(vel, "=")
    [vx, vy] = String.split(vel, ",") |> Enum.map(&String.to_integer/1)

    %Robot{ position: { x, y }, velocity: { vx, vy } }
  end

  def add(robot, map) do
    { x, y } = robot.position

    Enum.map(Enum.with_index(map), fn
      { line, ^y } ->
        Enum.map(Enum.with_index(line), fn
          { _, ^x } -> "#"
          { ch, _ } -> ch
        end)
      { line, _  } -> line
      end)
  end

  def step(robot, time, { width, height }) do
    { x, y } = robot.position
    { vx, vy } = robot.velocity

    x = Integer.mod((x + vx * time), width)
    y = Integer.mod((y + vy * time), height)

    %Robot{ position: { x, y }, velocity: { vx, vy } }
  end

  def quad(robot, { width, height }) do
    { x, y } = robot.position
    midW = div(width, 2)
    midH = div(height, 2)

    if x < midW and y < midH do
      1
    else if x < midW and y > midH do
      2
    else if x > midW and y < midH do
      3
    else if x > midW and y > midH do
      4
    else
      0
    end end end end
  end
end

parse_input = fn input ->
  input
  |> String.trim()
  |> String.split("\n")
  |> Enum.map(&Robot.parse/1)
end

part1 = fn input, dims ->
  robots = parse_input.(input)
  robots = Enum.map(robots, fn r -> Robot.step(r, 100, dims) end)
  quads = Enum.map(robots, fn r -> Robot.quad(r, dims) end)
  quads = Enum.filter(quads, fn q -> q != 0 end)
  groups = Enum.group_by(quads, fn x -> x end) |> Map.values
  counts = Enum.map(groups, &length/1)
  Enum.reduce(counts, 1, fn c, acc -> acc * c end)
end

create_map = fn { width, height } ->
  List.duplicate(List.duplicate(".", width), height)
end

show_map = fn map ->
  lines = Enum.map(map, fn line -> Enum.join(line, "") end)
  Enum.join(lines, "\n")
end

easter_egg = fn step, { _, robots}, dims ->
  map = create_map.(dims)
  robots = Enum.map(robots, fn r -> Robot.step(r, 1, dims) end)

  positions = Enum.map(robots, fn r -> r.position end)
  positions = Enum.uniq(positions)

  if (length(positions) == length(robots)) do
    map = Enum.reduce(robots, map, fn r, map -> Robot.add(r, map) end)
    _str = show_map.(map)
    # IO.puts(step)
    # IO.puts(str)

    { :halt, { step, robots } }
  else
    { :cont, { step, robots } }
  end
end

part2 = fn input, dims ->
  robots = parse_input.(input)

  Enum.reduce_while(Stream.iterate(1, &(&1 + 1)), { 0, robots }, fn step, acc -> easter_egg.(step, acc, dims) end)
end

input = IO.read(:stdio, :eof)
width = 101
height = 103

result1 = part1.(input, { width, height })
IO.puts("Part1: " <> Integer.to_string(result1))
{ step, _ } = part2.(input, { width, height })
result2 = step
IO.puts("Part2: " <> Integer.to_string(result2))
