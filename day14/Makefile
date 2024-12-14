PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=elixir
CFLAGS=

all: build

build:

.PHONY: clean install run

install:
	mkdir -p $(BINDIR)
	cp main.exs $(BINDIR)/main.exs

run: build
	elixir main.exs

clean:

