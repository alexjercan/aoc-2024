PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=node
CFLAGS=

all: build

build:

.PHONY: clean install run

install:
	mkdir -p $(BINDIR)
	cp main.js $(BINDIR)/main.js

run: build
	node main.js

clean:

