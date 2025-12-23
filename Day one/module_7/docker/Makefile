.PHONY: build run test shell clean help

# Passphrase for keypair (students must set this)
PASSPHRASE ?= 

# Optional blob ID for download test
BLOB_ID ?= 

help:
	@echo "SDK Upload Relay Module - Docker Commands"
	@echo "=========================================="
	@echo ""
	@echo "⚠️  IMPORTANT: Most commands require PASSPHRASE environment variable!"
	@echo ""
	@echo "  make build              - Build the Docker image"
	@echo "  make test PASSPHRASE='...'  - Run all tests"
	@echo "  make test-upload PASSPHRASE='...'  - Run basic upload test"
	@echo "  make test-download [PASSPHRASE='...'] [BLOB_ID='...']  - Run download test (PASSPHRASE required if no BLOB_ID, uploads first if no blob ID)"
	@echo "  make test-hands-on PASSPHRASE='...'  - Run hands-on lab"
	@echo "  make test-integrity PASSPHRASE='...'  - Run integrity checks"
	@echo "  make test-retry PASSPHRASE='...'  - Run retry patterns test"
	@echo "  make test-partial-failures PASSPHRASE='...'  - Run partial failures test"
	@echo "  make shell              - Open interactive shell in container"
	@echo "  make clean              - Clean up containers and images"
	@echo ""
	@echo "Example usage:"
	@echo "  PASSPHRASE='dress boy allow mammal...' make test"
	@echo "  make test PASSPHRASE='your passphrase here'"
	@echo "  make test-download PASSPHRASE='...'  # Uploads first, then downloads"
	@echo "  make test-download BLOB_ID='abc123...'  # Downloads existing blob (no PASSPHRASE needed)"
	@echo ""
	@echo "For TypeScript source code, see ../hands-on-source-code/"

build:
	docker-compose build

# Run all tests (requires PASSPHRASE)
test:
	@if [ -z "$(PASSPHRASE)" ]; then \
		echo "⚠️  ERROR: PASSPHRASE environment variable is required!"; \
		echo "Usage: make test PASSPHRASE='your passphrase here'"; \
		echo "Or: PASSPHRASE='your passphrase' make test"; \
		exit 1; \
	fi
	docker-compose run --rm -e PASSPHRASE="$(PASSPHRASE)" sdk-relay-lab npm test

# Run specific tests
test-upload:
	@if [ -z "$(PASSPHRASE)" ]; then \
		echo "⚠️  ERROR: PASSPHRASE required! Usage: make test-upload PASSPHRASE='your passphrase'"; \
		exit 1; \
	fi
	docker-compose run --rm -e PASSPHRASE="$(PASSPHRASE)" sdk-relay-lab npm run test:basic-upload

test-download:
	@if [ -z "$(BLOB_ID)" ]; then \
		if [ -z "$(PASSPHRASE)" ]; then \
			echo "⚠️  ERROR: PASSPHRASE required when no BLOB_ID provided!"; \
			echo "Usage: make test-download PASSPHRASE='your passphrase'"; \
			echo "Or: make test-download BLOB_ID='your blob ID' (no PASSPHRASE needed)"; \
			exit 1; \
		fi; \
		echo "⚠️  WARNING: If you don't provide a blob ID, the script will upload a test blob first and then download it to verify the round-trip."; \
		docker-compose run --rm -e PASSPHRASE="$(PASSPHRASE)" sdk-relay-lab npm run test:basic-download; \
	else \
		docker-compose run --rm sdk-relay-lab npm run test:basic-download -- "$(BLOB_ID)"; \
	fi

test-hands-on:
	@if [ -z "$(PASSPHRASE)" ]; then \
		echo "⚠️  ERROR: PASSPHRASE required! Usage: make test-hands-on PASSPHRASE='your passphrase'"; \
		exit 1; \
	fi
	docker-compose run --rm -e PASSPHRASE="$(PASSPHRASE)" sdk-relay-lab npm run test:hands-on

test-integrity:
	@if [ -z "$(PASSPHRASE)" ]; then \
		echo "⚠️  ERROR: PASSPHRASE required! Usage: make test-integrity PASSPHRASE='your passphrase'"; \
		exit 1; \
	fi
	docker-compose run --rm -e PASSPHRASE="$(PASSPHRASE)" sdk-relay-lab npm run test:integrity-checks

test-retry:
	@if [ -z "$(PASSPHRASE)" ]; then \
		echo "⚠️  ERROR: PASSPHRASE required! Usage: make test-retry PASSPHRASE='your passphrase'"; \
		exit 1; \
	fi
	docker-compose run --rm -e PASSPHRASE="$(PASSPHRASE)" sdk-relay-lab npm run test:retry

test-partial-failures:
	@if [ -z "$(PASSPHRASE)" ]; then \
		echo "⚠️  ERROR: PASSPHRASE required! Usage: make test-partial-failures PASSPHRASE='your passphrase'"; \
		exit 1; \
	fi
	docker-compose run --rm -e PASSPHRASE="$(PASSPHRASE)" sdk-relay-lab npm run test:partial-failures

# Interactive shell
shell:
	docker-compose run --rm sdk-relay-lab /bin/bash

# Start container interactively
run:
	docker-compose up

# Clean up
clean:
	docker-compose down -v
	docker rmi walrus-sdk-relay-lab 2>/dev/null || true
	rm -rf results/*

