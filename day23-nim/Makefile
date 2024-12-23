PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

all: build

build:
	nim c main.nim

.PHONY: clean install run

run: build
	./main

install:
	mkdir -p $(BINDIR)
	cp main $(BINDIR)/aoc2024-day23

clean:
	rm -rf main
