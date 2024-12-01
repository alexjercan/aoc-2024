PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=ghc
CFLAGS=

all: build

build:
	ghc Main.hs -o main

.PHONY: clean install

install:
	mkdir -p $(BINDIR)
	cp main $(BINDIR)/aoc2024-day02

clean:
	rm -rf main Main.hi Main.o
