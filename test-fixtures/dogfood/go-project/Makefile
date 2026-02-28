.PHONY: build test run clean

build:
	go build -o bin/server cmd/main.go

test:
	go test ./...

run: build
	./bin/server

clean:
	rm -rf bin/
