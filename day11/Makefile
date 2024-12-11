PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=c3c
CFLAGS=

all: build

build:
	c3c compile main.c3

.PHONY: clean install

install:
	mkdir -p $(BINDIR)
	cp main $(BINDIR)/aoc2024-day11

clean:
	rm -rf main

