PREFIX=/usr/local
BINDIR=$(PREFIX)/bin

CC=kotlinc
CFLAGS=

all: build

build:
	kotlinc main.kt -include-runtime -d main.jar

.PHONY: clean install run

install:
	mkdir -p $(BINDIR)
	cp main.jar $(BINDIR)/main.jar

run: build
	java -jar main.jar

clean:
	rm -rf main.jar
