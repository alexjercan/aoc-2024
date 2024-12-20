PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=slc
CFLAGS=-a

all: build

build:
	slc main.stack -a > main.asm && fasm main.asm main.o && ld -o main main.o

.PHONY: clean install

install:
	mkdir -p $(BINDIR)
	cp main $(BINDIR)/aoc2024-day01

clean:
	rm -rf main main.o main.asm
