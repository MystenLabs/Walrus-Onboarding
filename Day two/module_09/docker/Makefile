.PHONY: build run shell clean help trace-lifecycle analyze-logs

help:
	@echo "Upload Transaction Lifecycle Module - Docker Commands"
	@echo "======================================================"
	@echo ""
	@echo "  make build           - Build the Docker image"
	@echo "  make run             - Start shell with debug logging enabled"
	@echo "  make trace-lifecycle - Trace full upload lifecycle with logs"
	@echo "  make analyze-logs    - Show log patterns to look for"
	@echo "  make clean           - Remove containers and images"
	@echo ""
	@echo "Example:"
	@echo "  SUI_WALLET_PATH=~/.sui/sui_config make trace-lifecycle"

build:
	docker-compose build

run:
	docker-compose run --rm lifecycle-lab

shell: run

trace-lifecycle:
	docker-compose run --rm lifecycle-lab /bin/bash -c '\
		echo "=== Trace Upload Transaction Lifecycle ===" && \
		echo "Debug logging is enabled for:" && \
		echo "  - walrus_sdk" && \
		echo "  - walrus_core" && \
		echo "  - walrus_sui" && \
		echo "" && \
		echo "Creating test file..." && \
		echo "Hello Walrus Lifecycle" > test.txt && \
		echo "" && \
		echo "Ready to trace! Run: walrus store test.txt --epochs 5" && \
		echo "" && \
		echo "Look for these patterns in the logs:" && \
		echo "  1. Chunk Creation: \"starting to encode blob\"" && \
		echo "  2. Registration: \"starting to register blobs\"" && \
		echo "  3. Sealing: \"starting to store sliver\"" && \
		echo "  4. Certification: \"certifying blob on Sui\"" && \
		/bin/bash'

analyze-logs:
	@echo "=== Log Patterns to Identify ===" 
	@echo ""
	@echo "1. CHUNK CREATION:"
	@echo "   DEBUG ... starting to encode blob with metadata"
	@echo "   INFO ... encoded sliver pairs and metadata"
	@echo ""
	@echo "2. REGISTRATION:"
	@echo "   DEBUG ... starting to register blobs"
	@echo ""
	@echo "3. SEALING:"
	@echo "   TRACE ... starting to store sliver"
	@echo ""
	@echo "4. CERTIFICATION:"
	@echo "   DEBUG ... certifying blob on Sui"
	@echo "   INFO ... get {n} blobs certificates"

clean:
	docker-compose down -v
	docker rmi walrus-lifecycle-lab 2>/dev/null || true
	rm -rf workspace/*

