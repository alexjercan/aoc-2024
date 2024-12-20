let read_input () =
    let buffer = Buffer.create 1024 in
        try while true do
            Buffer.add_string buffer (read_line ());
            Buffer.add_string buffer "\n"
        done;
        with End_of_file -> Buffer.contents buffer

type antena = {
    row : int;
    col : int;
    freq : char;
}

let parse_ch (row: int) (col: int) (ch: char): antena = { row = row; col = col; freq = ch }

let parse_line (row : int) (line : string): antena list =
    List.init (String.length line) (String.get line) |>
    List.mapi (parse_ch row)

let antena_non_empty (a: antena): bool = Char.equal a.freq '.' |> not

let parse_input (input : string): (antena list * int * int) =
    let lines = String.trim input |> String.split_on_char '\n' in
    let height = List.length lines in
    let width = List.nth lines 0 |> String.length in
    let antenas = List.mapi parse_line lines |> List.flatten |> List.filter antena_non_empty in
        (antenas, width, height)

let antena_compare (a1 : antena) (a2 : antena): int = Char.compare a1.freq a2.freq

let antena_grouping (a1 : antena) (a2 : antena): bool = Char.equal a1.freq a2.freq

let group_by (fn : ('a -> 'a -> bool)) (l : 'a list): ('a list list) =
    let rec go acc = function
        | [] -> acc
        | hd::tl -> let l1,l2 = List.partition (fn hd) tl in go (List.append acc [hd::l1]) l2
    in go [] l

let combinations2 (xs : 'a list): ('a * 'a) list =
    let rec go acc = function
        | [] -> acc
        | hd::tl -> let cs = List.map (fun t -> (hd, t)) tl in go (List.append acc cs) tl
    in go [] xs

let bounded (width : int) (height : int) ((col, row) : (int * int)): bool =
    0 <= col && col < width && 0 <= row && row < height

let antinodes (width : int) (height : int) ((a1, a2) : (antena * antena)): (int * int) list =
    let col_delta = a1.col - a2.col in
    let row_delta = a1.row - a2.row in
        List.filter (bounded width height)
        [ (a1.col + col_delta, a1.row + row_delta)
        ; (a2.col - col_delta, a2.row - row_delta)
        ]

let uniq_cons (x : 'a) (xs : 'a list): 'a list = if List.mem x xs then xs else x :: xs

let remove_from_right (xs : 'a list): 'a list = List.fold_right uniq_cons xs []

let part1 (xs : antena list) (width : int) (height : int): int =
    List.sort antena_compare xs |>
    group_by antena_grouping |>
    List.map combinations2 |>
    List.flatten |>
    List.map (antinodes width height) |>
    List.flatten |>
    remove_from_right |>
    List.length

let rec resonant (width : int) (height : int) ((col, row) : (int * int)) ((col_delta, row_delta) : (int * int)): (int * int) Seq.t =
    let point = (col + col_delta, row + row_delta) in
        if bounded width height point then
            Seq.cons point (resonant width height point (col_delta, row_delta))
        else
            Seq.empty

let antinodes2 (width : int) (height : int) ((a1, a2) : (antena * antena)): (int * int) list =
    let col_delta = a1.col - a2.col in
    let row_delta = a1.row - a2.row in
        List.concat
        [ (resonant width height (a1.col, a1.row) (col_delta, row_delta)) |> List.of_seq
        ; (resonant width height (a2.col, a2.row) (-col_delta, -row_delta)) |> List.of_seq
        ; [(a1.col, a1.row); (a2.col, a2.row)]
        ]

let part2 (xs : antena list) (width : int) (height : int): int =
    List.sort antena_compare xs |>
    group_by antena_grouping |>
    List.map combinations2 |>
    List.flatten |>
    List.map (antinodes2 width height) |>
    List.flatten |>
    remove_from_right |>
    List.length

let solution (input : string): string =
    let xs,width,height = parse_input input in
        String.concat "\n"
            [ part1 xs width height |> string_of_int |> String.cat "Part1: "
            ; part2 xs width height |> string_of_int |> String.cat "Part2: "
            ]

let () = read_input () |> solution |> print_endline
