PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=julia
CFLAGS=

all: build

build:

.PHONY: clean install run

install:
	mkdir -p $(BINDIR)
	cp main.jl $(BINDIR)/main.jl

run: build
	julia main.jl

clean:
