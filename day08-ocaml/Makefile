PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=ocaml
CFLAGS=

all: build

build:
	ocamlc main.ml -o main

.PHONY: clean install

install:
	mkdir -p $(BINDIR)
	cp main $(BINDIR)/aoc2024-day08

clean:
	rm -rf main main.cmi main.cmo
