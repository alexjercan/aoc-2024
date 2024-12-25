PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=sbcl
CFLAGS=

all: build

build:

.PHONY: clean install run

install:
	mkdir -p $(BINDIR)
	cp main.lisp $(BINDIR)/main.lisp

run: build
	sbcl --script main.lisp

clean:

