import Data.List (tails, inits)

parse :: String -> [[Int]]
parse = map (map read . words) . lines

wouldBeSafe :: [Int] -> Bool
wouldBeSafe xs = let
        ts = map tail $ init $ tails xs
        ns = inits xs
        ys = zipWith (++) ns ts
    in
        any isSafe ys

part2 :: String -> String
part2 = show . sum . map (fromEnum . wouldBeSafe) . parse

isSafe :: [Int] -> Bool
isSafe xs = let
        ys = tail xs
        ds = zipWith (-) xs ys
        ds' = map abs ds
        allIncreasing = all (> 0) ds
        allDecreasing = all (< 0) ds
        rule1 = allIncreasing || allDecreasing
        rule2 = all (\d -> 1 <= d && d <= 3) ds'
    in rule1 && rule2

part1 :: String -> String
part1 = show . sum . map (fromEnum . isSafe) . parse

solution :: String -> String
solution input =
    "Part1: " ++ part1 input ++ "\n" ++ "Part2: " ++ part2 input ++ "\n"

main :: IO ()
main = interact solution
