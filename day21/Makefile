PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=groovy
CFLAGS=

all: build

build:

.PHONY: clean install run

install:
	mkdir -p $(BINDIR)
	cp main.groovy $(BINDIR)/main.groovy

run: build
	groovy main.groovy

clean:
