.PHONY: build run test shell clean help

# Passphrase for keypair (students must set this)
PASSPHRASE ?= 

# Build the Docker image
build:
	docker-compose build

# Run all tests in Docker (requires PASSPHRASE environment variable)
test:
	@if [ -z "$(PASSPHRASE)" ]; then \
		echo "⚠️  ERROR: PASSPHRASE environment variable is required!"; \
		echo "Usage: make test PASSPHRASE='your passphrase here'"; \
		echo "Or: PASSPHRASE='your passphrase' make test"; \
		exit 1; \
	fi
	docker-compose run --rm -e PASSPHRASE="$(PASSPHRASE)" sdk-verification npm test

# Run a specific test (requires PASSPHRASE)
test-upload:
	@if [ -z "$(PASSPHRASE)" ]; then \
		echo "⚠️  ERROR: PASSPHRASE required! Usage: make test-upload PASSPHRASE='your passphrase'"; \
		exit 1; \
	fi
	docker-compose run --rm -e PASSPHRASE="$(PASSPHRASE)" sdk-verification npm run test:basic-upload

test-download:
	docker-compose run --rm sdk-verification npm run test:basic-download

test-hands-on:
	@if [ -z "$(PASSPHRASE)" ]; then \
		echo "⚠️  ERROR: PASSPHRASE required! Usage: make test-hands-on PASSPHRASE='your passphrase'"; \
		exit 1; \
	fi
	docker-compose run --rm -e PASSPHRASE="$(PASSPHRASE)" sdk-verification npm run test:hands-on

test-integrity:
	@if [ -z "$(PASSPHRASE)" ]; then \
		echo "⚠️  ERROR: PASSPHRASE required! Usage: make test-integrity PASSPHRASE='your passphrase'"; \
		exit 1; \
	fi
	docker-compose run --rm -e PASSPHRASE="$(PASSPHRASE)" sdk-verification npm run test:integrity-checks

test-retry:
	@if [ -z "$(PASSPHRASE)" ]; then \
		echo "⚠️  ERROR: PASSPHRASE required! Usage: make test-retry PASSPHRASE='your passphrase'"; \
		exit 1; \
	fi
	docker-compose run --rm -e PASSPHRASE="$(PASSPHRASE)" sdk-verification npm run test:retry

test-partial-failures:
	@if [ -z "$(PASSPHRASE)" ]; then \
		echo "⚠️  ERROR: PASSPHRASE required! Usage: make test-partial-failures PASSPHRASE='your passphrase'"; \
		exit 1; \
	fi
	docker-compose run --rm -e PASSPHRASE="$(PASSPHRASE)" sdk-verification npm run test:partial-failures

# Start an interactive shell in the container
shell:
	docker-compose run --rm sdk-verification /bin/bash

# Run the container interactively
run:
	docker-compose up

# Clean up containers and volumes
clean:
	docker-compose down -v
	docker rmi sdk-upload-relay-verification_sdk-verification 2>/dev/null || true

# Show help
help:
	@echo "Available commands:"
	@echo ""
	@echo "⚠️  IMPORTANT: Most commands require PASSPHRASE environment variable!"
	@echo ""
	@echo "  make build              - Build the Docker image"
	@echo "  make test PASSPHRASE='...'  - Run all tests"
	@echo "  make test-upload PASSPHRASE='...'  - Run basic upload test"
	@echo "  make test-download      - Run basic download test (no passphrase needed)"
	@echo "  make test-hands-on PASSPHRASE='...'  - Run hands-on lab"
	@echo "  make test-integrity PASSPHRASE='...'  - Run integrity checks"
	@echo "  make test-retry PASSPHRASE='...'  - Run retry patterns test"
	@echo "  make test-partial-failures PASSPHRASE='...'  - Run partial failures test"
	@echo "  make shell PASSPHRASE='...'  - Open interactive shell in container"
	@echo "  make run                - Start container interactively"
	@echo "  make clean              - Clean up containers and images"
	@echo "  make help               - Show this help message"
	@echo ""
	@echo "Example usage:"
	@echo "  PASSPHRASE='dress boy allow mammal...' make test"
	@echo "  make test PASSPHRASE='your passphrase here'"

