PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=v
CFLAGS=

all: build

build:
	v main.v

.PHONY: clean install

install:
	mkdir -p $(BINDIR)
	cp main $(BINDIR)/aoc2024-day07

clean:
	rm -rf main

