.PHONY: build test clean

build:
	docker build -t walrus-quilts-lab .

test:
	docker run --rm -it -e PASSPHRASE="${PASSPHRASE}" -v $(PWD):/app walrus-quilts-lab

clean:
	rm -rf dist node_modules





