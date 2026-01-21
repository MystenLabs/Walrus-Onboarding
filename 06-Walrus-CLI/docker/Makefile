.PHONY: build run shell clean help upload-download inspect failure-recovery

help:
	@echo "CLI Module - Docker Commands"
	@echo "============================"
	@echo ""
	@echo "  make build            - Build the Docker image"
	@echo "  make run              - Start interactive shell"
	@echo "  make upload-download  - Full upload and download workflow"
	@echo "  make inspect          - Inspect objects and system info"
	@echo "  make failure-recovery - Test failure scenarios and recovery"
	@echo "  make clean            - Remove containers and images"
	@echo ""
	@echo "Environment Variables:"
	@echo "  SUI_WALLET_PATH - Path to Sui wallet config (required for uploads)"
	@echo ""
	@echo "Example:"
	@echo "  SUI_WALLET_PATH=~/.sui/sui_config make run"

build:
	docker-compose build

run:
	@if [ -z "$(SUI_WALLET_PATH)" ] && [ ! -d "./wallet" ]; then \
		echo "⚠️  Warning: No wallet configured."; \
		echo "   Set SUI_WALLET_PATH or create ./wallet directory"; \
	fi
	docker-compose run --rm cli-lab

shell: run

upload-download:
	docker-compose run --rm cli-lab /bin/bash -c '\
		echo "=== Full Upload and Download Workflow ===" && \
		echo "Creating test file..." && \
		echo "Hello, Walrus! This is a test file." > test-file.txt && \
		echo "Getting blob ID..." && \
		walrus blob-id test-file.txt && \
		echo "" && \
		echo "Checking if already stored..." && \
		walrus blob-status --file test-file.txt || true && \
		echo "" && \
		echo "Ready for upload! Run: walrus store test-file.txt --epochs 5"'

inspect:
	docker-compose run --rm cli-lab /bin/bash -c '\
		echo "=== Inspect Objects and System Info ===" && \
		echo "Creating test files..." && \
		echo "File 1" > file1.txt && \
		echo "File 2" > file2.txt && \
		echo "File 3" > file3.txt && \
		echo "" && \
		echo "System information:" && \
		walrus info && \
		echo "" && \
		echo "Storage node health:" && \
		walrus health --committee | head -20'

failure-recovery:
	docker-compose run --rm cli-lab /bin/bash -c '\
		echo "=== Failure Scenarios and Recovery ===" && \
		echo "Test 1: Reading non-existent blob..." && \
		walrus read 00000000000000000000000000000000000000000000 --out test.txt 2>&1 || true && \
		echo "" && \
		echo "Test 2: Invalid epoch value..." && \
		echo "test" > test.txt && \
		walrus store test.txt --epochs 1000 2>&1 || true && \
		echo "" && \
		echo "Done! See hands-on guide for more scenarios."'

clean:
	docker-compose down -v
	docker rmi walrus-cli-lab 2>/dev/null || true
	rm -rf workspace/*

