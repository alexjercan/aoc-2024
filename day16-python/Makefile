PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=python
CFLAGS=

all: build

build:

.PHONY: clean install run

install:
	mkdir -p $(BINDIR)
	cp main.py $(BINDIR)/main.py

run: build
	python main.py

clean:
