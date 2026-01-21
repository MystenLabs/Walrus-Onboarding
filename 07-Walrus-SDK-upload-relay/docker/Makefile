.PHONY: build run test shell clean help

# Load .env file from hands-on-source-code directory (required)
# PASSPHRASE must come from .env file.
# ENV_FILE can be overridden: make test-upload ENV_FILE=/path/to/.env
ENV_FILE ?= ../hands-on-source-code/.env
export ENV_FILE

# Optional blob ID for download test
BLOB_ID ?= 

help:
	@echo "SDK Upload Relay Module - Docker Commands"
	@echo "=========================================="
	@echo ""
	@echo "⚠️  IMPORTANT: Most commands require PASSPHRASE in .env file!"
	@echo ""
	@echo "  Default .env location: ../hands-on-source-code/.env"
	@echo "  Override location: make test-upload ENV_FILE=/path/to/.env"
	@echo ""
	@echo "  Setup: cd ../hands-on-source-code && cp .env.example .env && edit .env"
	@echo ""
	@echo "  make build              - Build the Docker image"
	@echo "  make test               - Run all tests"
	@echo "  make test-upload        - Run basic upload test"
	@echo "  make test-download [BLOB_ID='...']  - Run download test (uploads first if no blob ID)"
	@echo "  make test-hands-on      - Run hands-on lab"
	@echo "  make test-integrity     - Run integrity checks"
	@echo "  make test-retry         - Run retry patterns test"
	@echo "  make test-partial-failures - Run partial failures test"
	@echo "  make shell              - Open interactive shell in container"
	@echo "  make clean              - Clean up containers and images"
	@echo ""
	@echo "Example usage:"
	@echo "  make test               # Uses PASSPHRASE from default .env file"
	@echo "  make test ENV_FILE=/custom/path/.env  # Use custom .env location"
	@echo "  make test-download     # Uploads first, then downloads"
	@echo "  make test-download BLOB_ID='abc123...'  # Downloads existing blob"
	@echo ""
	@echo "For TypeScript source code, see ../hands-on-source-code/"

build:
	docker-compose build

# Run all tests (requires PASSPHRASE from .env file)
test:
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo "⚠️  ERROR: .env file not found!"; \
		echo "Create .env file: cd ../hands-on-source-code && cp .env.example .env && edit .env"; \
		exit 1; \
	fi
	@if ! grep -Eq '^[[:space:]]*PASSPHRASE=' "$(ENV_FILE)"; then \
		echo "⚠️  ERROR: PASSPHRASE not found in .env file!"; \
		echo "Edit .env file: cd ../hands-on-source-code && edit .env"; \
		exit 1; \
	fi
	docker-compose run --rm sdk-relay-lab npm test

# Run specific tests
test-upload:
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo "⚠️  ERROR: .env file not found!"; \
		echo "Create .env file: cd ../hands-on-source-code && cp .env.example .env && edit .env"; \
		exit 1; \
	fi
	@if ! grep -Eq '^[[:space:]]*PASSPHRASE=' "$(ENV_FILE)"; then \
		echo "⚠️  ERROR: PASSPHRASE not found in .env file!"; \
		echo "Edit .env file: cd ../hands-on-source-code && edit .env"; \
		exit 1; \
	fi
	docker-compose run --rm sdk-relay-lab npm run test:basic-upload

test-download:
	@if [ -z "$(BLOB_ID)" ]; then \
		if [ ! -f "$(ENV_FILE)" ]; then \
			echo "⚠️  ERROR: .env file not found!"; \
			echo "Create .env file: cd ../hands-on-source-code && cp .env.example .env && edit .env"; \
			exit 1; \
		fi; \
		if ! grep -Eq '^[[:space:]]*PASSPHRASE=' "$(ENV_FILE)"; then \
			echo "⚠️  ERROR: PASSPHRASE not found in .env file!"; \
			echo "Edit .env file: cd ../hands-on-source-code && edit .env"; \
			exit 1; \
		fi; \
		echo "⚠️  WARNING: If you don't provide a blob ID, the script will upload a test blob first and then download it to verify the round-trip."; \
		docker-compose run --rm sdk-relay-lab npm run test:basic-download; \
	else \
		docker-compose run --rm sdk-relay-lab npm run test:basic-download -- "$(BLOB_ID)"; \
	fi

test-hands-on:
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo "⚠️  ERROR: .env file not found!"; \
		echo "Create .env file: cd ../hands-on-source-code && cp .env.example .env && edit .env"; \
		exit 1; \
	fi
	@if ! grep -Eq '^[[:space:]]*PASSPHRASE=' "$(ENV_FILE)"; then \
		echo "⚠️  ERROR: PASSPHRASE not found in .env file!"; \
		echo "Edit .env file: cd ../hands-on-source-code && edit .env"; \
		exit 1; \
	fi
	docker-compose run --rm sdk-relay-lab npm run test:hands-on

test-integrity:
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo "⚠️  ERROR: .env file not found!"; \
		echo "Create .env file: cd ../hands-on-source-code && cp .env.example .env && edit .env"; \
		exit 1; \
	fi
	@if ! grep -Eq '^[[:space:]]*PASSPHRASE=' "$(ENV_FILE)"; then \
		echo "⚠️  ERROR: PASSPHRASE not found in .env file!"; \
		echo "Edit .env file: cd ../hands-on-source-code && edit .env"; \
		exit 1; \
	fi
	docker-compose run --rm sdk-relay-lab npm run test:integrity-checks

test-retry:
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo "⚠️  ERROR: .env file not found!"; \
		echo "Create .env file: cd ../hands-on-source-code && cp .env.example .env && edit .env"; \
		exit 1; \
	fi
	@if ! grep -Eq '^[[:space:]]*PASSPHRASE=' "$(ENV_FILE)"; then \
		echo "⚠️  ERROR: PASSPHRASE not found in .env file!"; \
		echo "Edit .env file: cd ../hands-on-source-code && edit .env"; \
		exit 1; \
	fi
	docker-compose run --rm sdk-relay-lab npm run test:retry

test-partial-failures:
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo "⚠️  ERROR: .env file not found!"; \
		echo "Create .env file: cd ../hands-on-source-code && cp .env.example .env && edit .env"; \
		exit 1; \
	fi
	@if ! grep -Eq '^[[:space:]]*PASSPHRASE=' "$(ENV_FILE)"; then \
		echo "⚠️  ERROR: PASSPHRASE not found in .env file!"; \
		echo "Edit .env file: cd ../hands-on-source-code && edit .env"; \
		exit 1; \
	fi
	docker-compose run --rm sdk-relay-lab npm run test:partial-failures

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

