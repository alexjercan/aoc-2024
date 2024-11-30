# Advent of Code 2024

Advent of Code 2024

## Quickstart

Get your session cookie from <https://adventofcode.com/> and export it as
AOC_SESSION, then you will be able to download the inputs using the bash
scripts.

```console
nix run '.#aoc2024-get' -- --year 2024 1
```

To run a single AoC problem you can use

```console
nix run '.#aoc2024-day01' < input/day01.input
```

To run all the AoC days you can use

```console
nix run '.#aoc2024'
```
