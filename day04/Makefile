PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=odin
CFLAGS=

all: build

build:
	odin build main.odin -file -out=main

.PHONY: clean install

install:
	mkdir -p $(BINDIR)
	cp main $(BINDIR)/aoc2024-day04

clean:
	rm -rf main
