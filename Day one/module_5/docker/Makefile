.PHONY: build run shell clean help single-blob-cost compare-sizes encoding-overhead

help:
	@echo "Storage Costs Module - Docker Commands"
	@echo "======================================="
	@echo ""
	@echo "  make build             - Build the Docker image"
	@echo "  make run               - Start interactive shell"
	@echo "  make single-blob-cost  - Calculate cost for a single blob"
	@echo "  make compare-sizes     - Compare costs for different file sizes"
	@echo "  make encoding-overhead - Understand encoding overhead"
	@echo "  make clean             - Remove containers and images"
	@echo ""
	@echo "Example:"
	@echo "  SUI_WALLET_PATH=~/.sui/sui_config make run"

build:
	docker-compose build

run:
	docker-compose run --rm storage-costs-lab

shell: run

single-blob-cost:
	docker-compose run --rm storage-costs-lab /bin/bash -c '\
		echo "=== Calculate Cost for Single Blob ===" && \
		walrus info && \
		echo "" && \
		echo "Creating 5MB test file..." && \
		dd if=/dev/urandom of=test-5mb.bin bs=1M count=5 2>/dev/null && \
		echo "File created. Run: walrus store test-5mb.bin --epochs 1 --dry-run"'

compare-sizes:
	docker-compose run --rm storage-costs-lab /bin/bash -c '\
		echo "=== Compare Costs for Different Sizes ===" && \
		echo "Creating test files of different sizes..." && \
		dd if=/dev/urandom of=small-1mb.bin bs=1M count=1 2>/dev/null && \
		dd if=/dev/urandom of=large-100mb.bin bs=1M count=100 2>/dev/null && \
		echo "Files created:" && \
		ls -lh *.bin && \
		echo "" && \
		if [ -f /home/student/.sui/sui_config/client.yaml ]; then \
			echo "Comparing storage costs..." && \
			echo "" && \
			echo "=== Small file (1MB) ===" && \
			walrus store small-1mb.bin --epochs 1 --dry-run 2>&1 | grep -A 5 "blob will be stored" && \
			echo "" && \
			echo "=== Large file (100MB) ===" && \
			walrus store large-100mb.bin --epochs 1 --dry-run 2>&1 | grep -A 5 "blob will be stored"; \
		else \
			echo "⚠️  Wallet not configured. To see actual cost comparison:" && \
			echo "   Run: SUI_WALLET_PATH=~/.sui/sui_config make compare-sizes" && \
			echo "" && \
			echo "Manual comparison commands:" && \
			echo "   walrus store small-1mb.bin --epochs 1 --dry-run" && \
			echo "   walrus store large-100mb.bin --epochs 1 --dry-run"; \
		fi'

encoding-overhead:
	docker-compose run --rm storage-costs-lab /bin/bash -c '\
		echo "=== Understand Encoding Overhead ===" && \
		dd if=/dev/urandom of=sample-2mb.bin bs=1M count=2 2>/dev/null && \
		echo "File created: sample-2mb.bin" && \
		echo "" && \
		echo "To check encoded size, run: walrus store sample-2mb.bin --epochs 1 --dry-run" && \
		echo "Note: Requires SUI_WALLET_PATH to be set"'

clean:
	docker-compose down -v
	docker rmi walrus-storage-costs-lab 2>/dev/null || true
	rm -rf workspace/*

