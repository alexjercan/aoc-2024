use std::io::Read;

fn read_input() -> String {
    let mut buffer = String::new();
    std::io::stdin().lock().read_to_string(&mut buffer).unwrap();
    return buffer;
}

fn parse_input(input: &str) -> Vec<usize> {
    input.chars().filter_map(|ch| ch.to_digit(10).map(|d| d as usize)).collect()
}

fn part1(disk: &Vec<usize>) -> usize {
    let mut memory: Vec<Option<usize>> = vec![];

    let mut file_id = 0;
    for i in 0..disk.len() {
        let size = disk[i];
        if i % 2 == 0 {
            for _ in 0..size {
                memory.push(Some(file_id));
            }
            file_id += 1;
        } else {
            for _ in 0..size {
                memory.push(None);
            }
        }
    }

    let mut index = 0;
    loop {
        if memory[index].is_none() {
            let mut file_id = memory.pop().unwrap();
            while file_id.is_none() {
                file_id = memory.pop().unwrap();
            }

            memory[index] = file_id;
        }

        index += 1;
        if index >= memory.len() { break; }
    }

    let total = memory
        .iter()
        .map(|o| o.unwrap())
        .enumerate()
        .fold(0, |acc, (i, file_id)| acc + i * file_id);

    return total;
}

#[derive(Clone)]
enum Chunk {
    Empty(usize),
    Filled(usize, usize),
}

impl Chunk {
    fn is_empty(self: &Self) -> bool {
        match self {
            Chunk::Empty(_) => true,
            Chunk::Filled(_, _) => false,
        }
    }
}

fn part2(disk: &Vec<usize>) -> usize {
    let mut memory: Vec<Chunk> = vec![];

    let mut file_id = 0;
    for i in 0..disk.len() {
        let size = disk[i];
        if i % 2 == 0 {
            memory.push(Chunk::Filled(file_id, size));
            file_id += 1;
        } else {
            memory.push(Chunk::Empty(size));
        }
    }

    let mut index = memory.len() - 1;
    loop {
        while memory[index].is_empty() && index > 0 {
            index -= 1;
        }

        if index == 0 {
            break;
        }

        if let Chunk::Filled(_, size) = memory[index] {
            let mut free_index = 0;
            let mut found = false;
            while free_index < index {
                if let Chunk::Empty(free_size) = memory[free_index] {
                    if free_size >= size {
                        memory[free_index] = Chunk::Empty(free_size - size);
                        let chunk = memory[index].clone();
                        memory[index] = Chunk::Empty(size);
                        memory.insert(free_index, chunk);
                        found = true;
                        break;
                    }
                }
                free_index += 1;
            }

            if !found {
                index -= 1;
            }
        }
    }

    let mut chunks: Vec<Option<usize>> = vec![];

    for i in 0..memory.len() {
        match memory[i] {
            Chunk::Empty(size) => {
                for _ in 0..size {
                    chunks.push(None);
                }
            },
            Chunk::Filled(file_id, size) => {
                for _ in 0..size {
                    chunks.push(Some(file_id));
                }
            }
        }
    }

    let total = chunks
        .iter()
        .map(|o| o.unwrap_or(0))
        .enumerate()
        .fold(0, |acc, (i, file_id)| acc + i * file_id);

    return total;
}

fn main () {
    let input = read_input();
    let disk = parse_input(&input);
    let result = part1(&disk);
    println!("Part1: {}", result);
    let result = part2(&disk);
    println!("Part2: {}", result);
}
