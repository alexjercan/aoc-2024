PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=ruby
CFLAGS=

all: build

build:

.PHONY: clean install run

install:
	mkdir -p $(BINDIR)
	cp main.rb $(BINDIR)/main.rb

run: build
	ruby main.rb

clean:
