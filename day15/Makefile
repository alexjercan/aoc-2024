PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=clang
CFLAGS=

all: build

build:
	clang main.c -o main

.PHONY: clean install

install:
	mkdir -p $(BINDIR)
	cp main $(BINDIR)/aoc2024-day15

clean:
	rm -rf main
