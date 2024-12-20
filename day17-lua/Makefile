PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=lua
CFLAGS=

all: build

build:

.PHONY: clean install run

install:
	mkdir -p $(BINDIR)
	cp main.lua $(BINDIR)/main.lua

run: build
	lua main.lua

clean:
