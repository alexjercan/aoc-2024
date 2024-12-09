PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=rustc
CFLAGS=

all: build

build:
	rustc main.rs

.PHONY: clean install

install:
	mkdir -p $(BINDIR)
	cp main $(BINDIR)/aoc2024-day09

clean:
	rm -rf main
