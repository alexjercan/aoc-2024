PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=javac
CFLAGS=

all: build

build:
	javac Main.java

.PHONY: clean install run

install:
	mkdir -p $(BINDIR)
	jar -cf $(BINDIR)/aoc2024-day03.jar .

run:
	java Main

clean:
	rm -rf Main.class
