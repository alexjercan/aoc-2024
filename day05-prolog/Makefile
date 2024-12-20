PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=swipl
CFLAGS=

all: build

build:

.PHONY: clean install run

install:
	mkdir -p $(BINDIR)
	cp main.pl $(BINDIR)/main.pl

run: build
	swipl -g main -t halt main.pl

clean:
