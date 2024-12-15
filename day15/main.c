#define DS_DA_IMPLEMENTATION
#define DS_SS_IMPLEMENTATION
#define DS_IO_IMPLEMENTATION
#include "ds.h"
#include <stdio.h>

const char *CLEAR_SCREEN_ANSI = "\e[1;1H\e[2J";

typedef struct {
    int row;
    int col;
} vec2;

vec2 vec2_add(vec2 a, vec2 b) {
    return (vec2){ .row = a.row + b.row, .col = a.col + b.col };
}

bool vec2_equals(vec2 a, vec2 b) {
    return a.row == b.row && a.col == b.col;
}

typedef struct {
    ds_dynamic_array moves; // vec2
    ds_dynamic_array walls; // vec2
    ds_dynamic_array boxes; // vec2
    vec2 robot;
    int width;
    int height;
} puzzle;

static void puzzle_init(puzzle *puzzle) {
    ds_dynamic_array_init(&puzzle->moves, sizeof(vec2));
    ds_dynamic_array_init(&puzzle->walls, sizeof(vec2));
    ds_dynamic_array_init(&puzzle->boxes, sizeof(vec2));
    puzzle->robot = (vec2){ .row = 0, .col = 0 };
}

static vec2 parse_wasd(char move) {
    if (move == 'a') {
        return (vec2){ .row = 0, .col = -1 };
    } else if (move == 'd') {
        return (vec2){ .row = 0, .col = 1 };
    } else if (move == 'w') {
        return (vec2){ .row = -1, .col = 0 };
    } else if (move == 's') {
        return (vec2){ .row = 1, .col = 0 };
    } else {
        DS_PANIC("Not a move: %d", move);
    }
}

static vec2 parse_move(char move) {
    if (move == '<') {
        return (vec2){ .row = 0, .col = -1 };
    } else if (move == '>') {
        return (vec2){ .row = 0, .col = 1 };
    } else if (move == '^') {
        return (vec2){ .row = -1, .col = 0 };
    } else if (move == 'v') {
        return (vec2){ .row = 1, .col = 0 };
    } else {
        DS_PANIC("Not a move");
    }
}

static void parse_input(ds_string_slice slice, puzzle *puzzle) {
    ds_string_slice line = {0};
    DS_UNREACHABLE(ds_string_slice_trim(&slice, '\n'));

    // Parse the map
    int row = 0;
    while (ds_string_slice_tokenize(&slice, '\n', &line) == 0) {
        if (line.len == 0) {
            break;
        }

        DS_UNREACHABLE(ds_string_slice_trim(&line, '\n'));
        puzzle->width = line.len;
        for (unsigned int col = 0; col < line.len; col++) {
            char ch = line.str[col];

            if (ch == '#') {
                vec2 pos = (vec2){ .col = col, .row = row};
                DS_EXPECT(ds_dynamic_array_append(&puzzle->walls, &pos), DS_ERROR_OOM);
            } else if (ch == 'O') {
                vec2 pos = (vec2){ .col = col, .row = row};
                DS_EXPECT(ds_dynamic_array_append(&puzzle->boxes, &pos), DS_ERROR_OOM);
            } else if (ch == '@') {
                puzzle->robot = (vec2){ .col = col, .row = row };
            }
        }

        row += 1;
    }
    puzzle->height = row;

    // Parse the moves
    while (ds_string_slice_tokenize(&slice, '\n', &line) == 0) {
        DS_UNREACHABLE(ds_string_slice_trim(&line, '\n'));
        for (unsigned int i = 0; i < line.len; i++) {
            vec2 move = parse_move(line.str[i]);
            DS_EXPECT(ds_dynamic_array_append(&puzzle->moves, &move), DS_ERROR_OOM);
        }
    }
}

static int part1_has_wall(puzzle puzzle, vec2 pos) {
    for (unsigned int i = 0; i < puzzle.walls.count; i++) {
        vec2 wall = {0};
        DS_UNREACHABLE(ds_dynamic_array_get(&puzzle.walls, i, &wall));

        if (vec2_equals(wall, pos)) {
            return i;
        }
    }

    return -1;
}

static int part1_has_box(puzzle puzzle, vec2 pos) {
    for (unsigned int i = 0; i < puzzle.boxes.count; i++) {
        vec2 box = {0};
        DS_UNREACHABLE(ds_dynamic_array_get(&puzzle.boxes, i, &box));

        if (vec2_equals(box, pos)) {
            return i;
        }
    }

    return -1;
}

static bool part1_push_box(puzzle puzzle, int index, vec2 move, ds_dynamic_array *res) {
    vec2 box = {0};
    DS_UNREACHABLE(ds_dynamic_array_get(&puzzle.boxes, index, &box));
    vec2 next = vec2_add(box, move);

    if (part1_has_wall(puzzle, next) >= 0) {
        return false;
    }

    bool ok = true;
    int box_index = part1_has_box(puzzle, next);
    if (box_index >= 0) {
        ok = part1_push_box(puzzle, box_index, move, res);
    }

    if (ok) {
        DS_EXPECT(ds_dynamic_array_append(res, &index), DS_ERROR_OOM);
    }

    return ok;
}

static void puzzle_dump(puzzle puzzle) {
    for (int row = 0; row < puzzle.height; row++) {
        for (int col = 0; col < puzzle.width; col++) {
            vec2 pos = (vec2){ .row = row, .col = col };
            if (vec2_equals(pos, puzzle.robot)) {
                printf("@");
            } else if (part1_has_wall(puzzle, pos) >= 0) {
                printf("#");
            } else if (part1_has_box(puzzle, pos) >= 0) {
                printf("O");
            } else {
                printf(".");
            }
        }
        printf("\n");
    }
    printf("\n");
}

static int part1(puzzle puzzle) {
    for (unsigned int i = 0; i < puzzle.moves.count; i++) {
        vec2 move = {0};
        DS_UNREACHABLE(ds_dynamic_array_get(&puzzle.moves, i, &move));

        vec2 next = vec2_add(puzzle.robot, move);
        if (part1_has_wall(puzzle, next) >= 0) {
            continue;
        }

        int box_index = part1_has_box(puzzle, next);
        if (box_index >= 0) {
            ds_dynamic_array indices = {0}; // int
            ds_dynamic_array_init(&indices, sizeof(int));

            if (part1_push_box(puzzle, box_index, move, &indices)) {
                for (unsigned int j = 0; j < indices.count; j++) {
                    int index = 0;
                    DS_UNREACHABLE(ds_dynamic_array_get(&indices, j, &index));

                    vec2 *box = NULL;
                    DS_UNREACHABLE(ds_dynamic_array_get_ref(&puzzle.boxes, index, (void **)&box));

                    *box = vec2_add(*box, move);
                }

                puzzle.robot = next;
            }
        } else {
            puzzle.robot = next;
        }
    }

    int total = 0;

    for (unsigned int i = 0; i < puzzle.boxes.count; i++) {
        vec2 box = {0};
        DS_UNREACHABLE(ds_dynamic_array_get(&puzzle.boxes, i, &box));

        total = total + box.row * 100 + box.col;
    }

    return total;
}

static void puzzle_dump2(puzzle puzzle) {
    for (int row = 0; row < puzzle.height; row++) {
        for (int col = 0; col < puzzle.width; col++) {
            vec2 pos = (vec2){ .row = row, .col = col };
            vec2 prev = (vec2){ .row = row, .col = col - 1 };
            if (vec2_equals(pos, puzzle.robot)) {
                printf("@");
            } else if (part1_has_wall(puzzle, pos) >= 0) {
                printf("#");
            } else if (part1_has_box(puzzle, pos) >= 0) {
                printf("[");
            } else if (col > 0 && part1_has_box(puzzle, prev) >= 0) {
                printf("]");
            } else {
                printf(".");
            }
        }
        printf("\n");
    }
    printf("\n");
}

static int part2_has_box(puzzle puzzle, vec2 pos) {
    for (unsigned int i = 0; i < puzzle.boxes.count; i++) {
        vec2 box = {0};
        DS_UNREACHABLE(ds_dynamic_array_get(&puzzle.boxes, i, &box));

        if (vec2_equals(box, pos)) {
            return i;
        }
    }

    vec2 pos_left = (vec2){ .row = pos.row, .col = pos.col - 1 };
    for (unsigned int i = 0; i < puzzle.boxes.count; i++) {
        vec2 box = {0};
        DS_UNREACHABLE(ds_dynamic_array_get(&puzzle.boxes, i, &box));

        if (vec2_equals(box, pos_left)) {
            return i;
        }
    }

    return -1;
}

static bool part2_push_box(puzzle puzzle, int index, vec2 move, ds_dynamic_array *res) {
    vec2 box = {0};
    DS_UNREACHABLE(ds_dynamic_array_get(&puzzle.boxes, index, &box));
    vec2 next_left = vec2_add(box, move);
    vec2 next_right = (vec2) { .row = next_left.row, .col = next_left.col + 1 };

    if (part1_has_wall(puzzle, next_left) >= 0 || part1_has_wall(puzzle, next_right) >= 0) {
        return false;
    }

    bool ok = true;
    int box_index_left = part2_has_box(puzzle, next_left);
    if (box_index_left >= 0 && box_index_left != index) {
        ok = part2_push_box(puzzle, box_index_left, move, res);
    }

    if (ok) {
        int box_index_right = part2_has_box(puzzle, next_right);
        if (box_index_right >= 0 && box_index_right != index && box_index_left != box_index_right) {
            ok = part2_push_box(puzzle, box_index_right, move, res);
        }
    }

    if (ok) {
        DS_EXPECT(ds_dynamic_array_append(res, &index), DS_ERROR_OOM);
    }

    return ok;
}

static bool ds_dynamic_array_contains(ds_dynamic_array *array /* int */, int index) {
    for (unsigned int i = 0; i < array->count; i++) {
        int item = 0;
        DS_UNREACHABLE(ds_dynamic_array_get(array, i, &item));
        if (item == index) {
            return true;
        }
    }

    return false;
}

static int part2(puzzle puzzle) {
    puzzle.width *= 2;
    puzzle.robot.col *= 2;
    for (unsigned int i = 0; i < puzzle.boxes.count; i++) {
        vec2 *box = NULL;
        DS_UNREACHABLE(ds_dynamic_array_get_ref(&puzzle.boxes, i, (void **)&box));
        box->col = box->col * 2;
    }
    for (int i = puzzle.walls.count - 1; i >= 0; i--) {
        vec2 *wall = NULL;
        DS_UNREACHABLE(ds_dynamic_array_get_ref(&puzzle.walls, i, (void **)&wall));
        wall->col = wall->col * 2;

        vec2 clone = (vec2){ .col = wall->col + 1, .row = wall->row };
        DS_EXPECT(ds_dynamic_array_append(&puzzle.walls, &clone), DS_ERROR_OOM);
    }

    for (unsigned int i = 0; i < puzzle.moves.count; i++) {
        vec2 move = {0};
        DS_UNREACHABLE(ds_dynamic_array_get(&puzzle.moves, i, &move));

        vec2 next = vec2_add(puzzle.robot, move);
        if (part1_has_wall(puzzle, next) >= 0) {
            continue;
        }

        int box_index = part2_has_box(puzzle, next);
        if (box_index >= 0) {
            ds_dynamic_array indices = {0}; // int
            ds_dynamic_array_init(&indices, sizeof(int));

            if (part2_push_box(puzzle, box_index, move, &indices)) {
                ds_dynamic_array set = {0};
                ds_dynamic_array_init(&set, sizeof(int));
                for (unsigned int j = 0; j < indices.count; j++) {
                    int index = 0;
                    DS_UNREACHABLE(ds_dynamic_array_get(&indices, j, &index));
                    if (ds_dynamic_array_contains(&set, index)) {
                        continue;
                    }

                    vec2 *box = NULL;
                    DS_UNREACHABLE(ds_dynamic_array_get_ref(&puzzle.boxes, index, (void **)&box));

                    *box = vec2_add(*box, move);

                    ds_dynamic_array_append(&set, &index);
                }

                puzzle.robot = next;
            }
        } else {
            puzzle.robot = next;
        }
    }

    int total = 0;

    for (unsigned int i = 0; i < puzzle.boxes.count; i++) {
        vec2 box = {0};
        DS_UNREACHABLE(ds_dynamic_array_get(&puzzle.boxes, i, &box));

        total = total + box.row * 100 + box.col;
    }

    return total;

    return 0;
}

static int part2_interactive(puzzle puzzle) {
    puzzle.width *= 2;
    puzzle.robot.col *= 2;
    for (unsigned int i = 0; i < puzzle.boxes.count; i++) {
        vec2 *box = NULL;
        DS_UNREACHABLE(ds_dynamic_array_get_ref(&puzzle.boxes, i, (void **)&box));
        box->col = box->col * 2;
    }
    for (int i = puzzle.walls.count - 1; i >= 0; i--) {
        vec2 *wall = NULL;
        DS_UNREACHABLE(ds_dynamic_array_get_ref(&puzzle.walls, i, (void **)&wall));
        wall->col = wall->col * 2;

        vec2 clone = (vec2){ .col = wall->col + 1, .row = wall->row };
        DS_EXPECT(ds_dynamic_array_append(&puzzle.walls, &clone), DS_ERROR_OOM);
    }

    int result = 0;
    while (1) {
        puzzle_dump2(puzzle);
        result = system("stty raw");
        char input = getchar();
        result = system("stty cooked");
        printf("%s", CLEAR_SCREEN_ANSI);

        vec2 move = parse_wasd(input);

        vec2 next = vec2_add(puzzle.robot, move);
        if (part1_has_wall(puzzle, next) >= 0) {
            continue;
        }

        int box_index = part2_has_box(puzzle, next);
        if (box_index >= 0) {
            ds_dynamic_array indices = {0}; // int
            ds_dynamic_array_init(&indices, sizeof(int));

            if (part2_push_box(puzzle, box_index, move, &indices)) {
                ds_dynamic_array set = {0};
                ds_dynamic_array_init(&set, sizeof(int));
                for (unsigned int j = 0; j < indices.count; j++) {
                    int index = 0;
                    DS_UNREACHABLE(ds_dynamic_array_get(&indices, j, &index));
                    if (ds_dynamic_array_contains(&set, index)) {
                        continue;
                    }

                    vec2 *box = NULL;
                    DS_UNREACHABLE(ds_dynamic_array_get_ref(&puzzle.boxes, index, (void **)&box));

                    *box = vec2_add(*box, move);

                    ds_dynamic_array_append(&set, &index);
                }

                puzzle.robot = next;
            }
        } else {
            puzzle.robot = next;
        }
    }

    int total = 0;

    for (unsigned int i = 0; i < puzzle.boxes.count; i++) {
        vec2 box = {0};
        DS_UNREACHABLE(ds_dynamic_array_get(&puzzle.boxes, i, &box));

        total = total + box.row * 100 + box.col;
    }

    return total;

    return 0;
}

int main() {
    char *buffer = NULL;
    ds_string_slice input = {0};
    puzzle puzzle = {0};
    int result = 0;

    int buffer_len = ds_io_read(NULL, &buffer, "r");
    if (buffer_len <= 0) {
        return_defer(1);
    }
    ds_string_slice_init(&input, buffer, buffer_len);

    puzzle_init(&puzzle);
    parse_input(input, &puzzle);
    int result1 = part1(puzzle);
    printf("Part1: %d\n", result1);

    puzzle_init(&puzzle);
    parse_input(input, &puzzle);
    int result2 = part2(puzzle);
    printf("Part2: %d\n", result2);

defer:
    if (buffer != NULL) DS_FREE(NULL, buffer);
    return result;
}
