PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=pygyat
CFLAGS=

all: build

build:

.PHONY: clean install run

install:
	mkdir -p $(BINDIR)
	cp main.gyat $(BINDIR)/main.gyat

run: build
	pygyat main.gyat

clean:
