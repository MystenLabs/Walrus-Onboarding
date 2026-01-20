.PHONY: build run shell clean help trace-lifecycle analyze-logs grep-logs

help:
	@echo "Upload Transaction Lifecycle Module - Docker Commands"
	@echo "======================================================"
	@echo ""
	@echo "  make build           - Build the Docker image"
	@echo "  make run             - Start interactive shell with debug logging"
	@echo "  make trace-lifecycle - Upload a test file and trace the full lifecycle"
	@echo "  make grep-logs       - Search saved logs for lifecycle stage patterns"
	@echo "  make analyze-logs    - Show log patterns to identify each stage"
	@echo "  make clean           - Remove containers and images"
	@echo ""
	@echo "Note: SUI_WALLET_PATH is required for 'run' and 'trace-lifecycle' commands."
	@echo ""
	@echo "Example:"
	@echo "  SUI_WALLET_PATH=~/.sui/sui_config make trace-lifecycle"
	@echo "  make grep-logs  # After running trace-lifecycle"

build:
	docker-compose build

run:
ifndef SUI_WALLET_PATH
	@echo "ERROR: SUI_WALLET_PATH is not set!"
	@echo ""
	@echo "Usage: SUI_WALLET_PATH=~/.sui/sui_config make run"
	@exit 1
endif
	docker-compose run --rm lifecycle-lab

shell: run

trace-lifecycle:
ifndef SUI_WALLET_PATH
	@echo "ERROR: SUI_WALLET_PATH is not set!"
	@echo ""
	@echo "Usage: SUI_WALLET_PATH=~/.sui/sui_config make trace-lifecycle"
	@echo ""
	@echo "Your Sui wallet should contain:"
	@echo "  - client.yaml"
	@echo "  - sui.keystore"
	@exit 1
endif
	docker-compose run --rm lifecycle-lab /bin/bash -c '\
		echo "=== Trace Upload Transaction Lifecycle ===" | tee lifecycle.log && \
		echo "Debug logging is enabled for:" | tee -a lifecycle.log && \
		echo "  - walrus_sdk" | tee -a lifecycle.log && \
		echo "  - walrus_core" | tee -a lifecycle.log && \
		echo "  - walrus_sui" | tee -a lifecycle.log && \
		echo "" | tee -a lifecycle.log && \
		echo "Creating test file..." | tee -a lifecycle.log && \
		echo "Hello Walrus Lifecycle" > test.txt && \
		echo "Created at: $$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> test.txt && \
		echo "" | tee -a lifecycle.log && \
		echo "Uploading test.txt to trace the lifecycle..." | tee -a lifecycle.log && \
		echo "-------------------------------------------" | tee -a lifecycle.log && \
		echo "" | tee -a lifecycle.log && \
		walrus store test.txt --epochs 5 2>&1 | tee -a lifecycle.log && \
		echo "" | tee -a lifecycle.log && \
		echo "=== Upload Complete ===" | tee -a lifecycle.log && \
		echo "" && \
		echo "Logs saved to: workspace/lifecycle.log" && \
		echo "Run \"make grep-logs\" to search for lifecycle patterns" '

grep-logs:
	@if [ ! -f workspace/lifecycle.log ]; then \
		echo "ERROR: No log file found at workspace/lifecycle.log"; \
		echo "Run 'make trace-lifecycle' first to generate logs."; \
		exit 1; \
	fi
	@echo "=== Searching Lifecycle Logs ==="
	@echo ""
	@echo "1. CHUNK CREATION:"
	@grep -n "starting to encode blob\|encoded sliver pairs\|finished blob encoding" workspace/lifecycle.log 2>/dev/null | head -5 || echo "   (not found)"
	@echo ""
	@echo "2. REGISTRATION:"
	@grep -n "starting to register blobs\|registering blobs\|finished registering" workspace/lifecycle.log 2>/dev/null | head -3 || echo "   (not found)"
	@echo ""
	@echo "3. SEALING (Storing Slivers):"
	@grep -n "sliver upload completed\|finished storing slivers\|storing metadata and sliver pairs finished" workspace/lifecycle.log 2>/dev/null | head -5 || echo "   (not found)"
	@echo ""
	@echo "4. PROOF CREATION (Collecting Signatures):"
	@grep -n "retrieving confirmation\|ThresholdReached" workspace/lifecycle.log 2>/dev/null | head -5 || echo "   (not found)"
	@echo ""
	@echo "5. CERTIFICATION:"
	@grep -n "blob certificate\|finished certifying\|finished storing blobs" workspace/lifecycle.log 2>/dev/null | head -5 || echo "   (not found)"
	@echo ""
	@echo "6. RESULT:"
	@grep -n "Success:\|Blob ID:\|Error:" workspace/lifecycle.log 2>/dev/null || echo "   (not found)"

analyze-logs:
	@echo "=== Log Patterns Reference Guide ===" 
	@echo ""
	@echo "1. CHUNK CREATION:"
	@echo "   DEBUG ... starting to encode blob with metadata"
	@echo "   INFO ... encoded sliver pairs and metadata"
	@echo ""
	@echo "2. REGISTRATION:"
	@echo "   DEBUG ... starting to register blobs"
	@echo ""
	@echo "3. SEALING (Storing Slivers):"
	@echo "   DEBUG ... sliver upload completed on node"
	@echo "   DEBUG ... finished storing slivers on node"
	@echo "   DEBUG ... storing metadata and sliver pairs finished"
	@echo ""
	@echo "4. PROOF CREATION (Collecting Signatures):"
	@echo "   DEBUG ... retrieving confirmation"
	@echo "   DEBUG ... return=ThresholdReached"
	@echo ""
	@echo "5. CERTIFICATION:"
	@echo "   INFO ... obtained N blob certificate"
	@echo "   INFO ... finished certifying and extending blobs on Sui"
	@echo "   INFO ... finished storing blobs"
	@echo ""
	@echo "Tip: Run 'make grep-logs' to search these patterns in saved logs."

clean:
	docker-compose down -v
	docker rmi walrus-lifecycle-lab 2>/dev/null || true
	rm -rf workspace/*

