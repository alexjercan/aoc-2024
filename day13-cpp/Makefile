PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=g++
CFLAGS=

all: build

build:
	g++ main.cpp -o main

.PHONY: clean install

install:
	mkdir -p $(BINDIR)
	cp main $(BINDIR)/aoc2024-day13

clean:
	rm -rf main
