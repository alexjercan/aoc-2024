PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=v
CFLAGS=

all: build

build:
	go build main.go

.PHONY: clean install

install:
	mkdir -p $(BINDIR)
	cp main $(BINDIR)/aoc2024-day20

clean:
	rm -rf main
