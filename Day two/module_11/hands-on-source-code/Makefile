.PHONY: build test shell clean help

help:
	@echo "Quilts Hands-on Lab - Docker Commands"
	@echo "======================================"
	@echo ""
	@echo "  make build           - Build the Docker image"
	@echo "  make test            - Run the main lab (requires PASSPHRASE)"
	@echo "  make create-simple   - Run simple quilt creation example"
	@echo "  make create-flow     - Run creation flow example"
	@echo "  make retrieve-all    - Run retrieval patterns example"
	@echo "  make shell           - Open interactive shell in container"
	@echo "  make clean           - Clean up containers and images"
	@echo ""
	@echo "Example:"
	@echo "  PASSPHRASE='your passphrase' make test"

build:
	docker build -t walrus-quilts-lab .

test:
	@if [ -z "$(PASSPHRASE)" ]; then \
		echo "⚠️  ERROR: PASSPHRASE environment variable is required!"; \
		echo "Usage: PASSPHRASE='your passphrase' make test"; \
		exit 1; \
	fi
	docker run --rm -e PASSPHRASE="$(PASSPHRASE)" walrus-quilts-lab npm run test

create-simple:
	docker run --rm walrus-quilts-lab npm run create-simple

create-flow:
	docker run --rm walrus-quilts-lab npm run create-flow

retrieve-all:
	docker run --rm walrus-quilts-lab npm run retrieve-all

shell:
	docker run --rm -it -e PASSPHRASE="$(PASSPHRASE)" walrus-quilts-lab /bin/bash

clean:
	docker rmi walrus-quilts-lab 2>/dev/null || true
	rm -rf dist node_modules





