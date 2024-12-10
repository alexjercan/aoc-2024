PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=zig
CFLAGS=

all: build

build:
	zig build-exe main.zig

.PHONY: clean install

install:
	mkdir -p $(BINDIR)
	cp main $(BINDIR)/aoc2024-day10

clean:
	rm -rf main main.o
