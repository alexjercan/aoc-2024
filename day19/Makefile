PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=tsc
CFLAGS=

all: build

build:
	tsc main.ts

.PHONY: clean install run

install:
	mkdir -p $(BINDIR)
	cp main.js $(BINDIR)/main.js

run: build
	node main.js

clean:
	rm -rf main.js
