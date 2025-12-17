.PHONY: build run shell clean help trace-upload system-info

help:
	@echo "Walrus Architecture Module - Docker Commands"
	@echo "============================================="
	@echo ""
	@echo "  make build        - Build the Docker image"
	@echo "  make run          - Start interactive shell"
	@echo "  make trace-upload - Trace upload flow with debug logging"
	@echo "  make system-info  - Display system information"
	@echo "  make clean        - Remove containers and images"
	@echo ""
	@echo "Example:"
	@echo "  SUI_WALLET_PATH=~/.sui/sui_config make run"

build:
	docker-compose build

run:
	docker-compose run --rm architecture-lab

shell: run

trace-upload:
	docker-compose run --rm -e RUST_LOG=walrus=debug architecture-lab /bin/bash -c '\
		echo "=== Trace Upload Flow ===" && \
		echo "Creating test blob..." && \
		echo "Hello, Walrus!" > my-blob.txt && \
		echo "" && \
		echo "System info:" && \
		walrus info | head -20 && \
		echo "" && \
		echo "Ready to upload! Run: walrus store my-blob.txt --epochs 5" && \
		echo "Watch the debug logs to see the upload flow." && \
		/bin/bash'

system-info:
	docker-compose run --rm architecture-lab walrus info

clean:
	docker-compose down -v
	docker rmi walrus-architecture-lab 2>/dev/null || true
	rm -rf workspace/*

