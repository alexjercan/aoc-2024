PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=clang
CFLAGS=

all: build

build:
	clang main.c -o main
	clang game.c -o game

.PHONY: clean install

install:
	mkdir -p $(BINDIR)
	cp main $(BINDIR)/aoc2024-day15
	cp game $(BINDIR)/aoc2024-day15-game

clean:
	rm -rf main game
