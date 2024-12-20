before(X, Y, [[A,B]|T]) :- X == A, Y == B; before(X, Y, T).

before_many(_, [], _).
before_many(X, [H|T], B) :- not(before(H, X, B)), before_many(X, T, B).

correct([], _).
correct([H|T], B) :- before_many(H, T, B), correct(T, B).

middle(Xs, X) :-
    length(Xs, N),
    N1 is div(N, 2),
    nth0(N1, Xs, X).

ordering(Befores, Delta, E1, E2) :-
    ( before(E1, E2, Befores) -> Delta = (<)
    ; before(E2, E1, Befores) -> Delta = (>)
    ; Delta = (=)
    ).

fix(Updates, Befores, Sorted) :-
    predsort(ordering(Befores), Updates, Sorted).

part1([], _, Acc, Acc).
part1([U|Updates], Befores, Acc, Result) :-
    (correct(U, Befores), !, middle(U, M), number_string(N, M), Acc0 is Acc + N; Acc0 is Acc),
    part1(Updates, Befores, Acc0, Result).

part2([], _, Acc, Acc).
part2([U|Updates], Befores, Acc, Result) :-
    (not(correct(U, Befores)), !, fix(U, Befores, U0), middle(U0, M), number_string(N, M), Acc0 is Acc + N; Acc0 is Acc),
    part2(Updates, Befores, Acc0, Result).

solution(Updates, Befores, Part1, Part2) :-
    part1(Updates, Befores, 0, Part1),
    part2(Updates, Befores, 0, Part2).

main :-
    read_lines(user_input, Lines),
    parse_befores(Lines, Befores),
    length(Befores, LenBefores),
    LenBefores1 is LenBefores+1,
    remove_n(Lines, LenBefores1, Lines0),
    parse_updates(Lines0, Updates),
    solution(Updates, Befores, Part1, Part2),
    format('Part1: ~w~n', [Part1]),
    format('Part2: ~w~n', [Part2]).

read_lines(In, Lines) :-
    read_string(In, _, Str),
    split_string(Str, "\n", "", Lines).

parse_befores([], []).
parse_befores([H|T], List) :-
    (H = "";
        split_string(H, "|", "", B),
        append(List0, [B], List), parse_befores(T, List0)).

parse_updates([_], []).
parse_updates([H|T], [U|Updates]) :-
    split_string(H, ",", "", U),
    parse_updates(T, Updates).

remove_n(List, N, ShorterList) :-
    length(Prefix, N),
    append(Prefix, ShorterList, List).
