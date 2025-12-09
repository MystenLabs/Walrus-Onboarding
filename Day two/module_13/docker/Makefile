.PHONY: build run shell clean help

help:
	@echo "Performance Optimization Lab - Docker Commands"
	@echo "=============================================="
	@echo ""
	@echo "  make build   - Build the Docker image"
	@echo "  make run     - Run the throughput tuner (uses default passphrase)"
	@echo "  make shell   - Open interactive shell in container"
	@echo "  make clean   - Remove containers and images"
	@echo ""
	@echo "Example with custom passphrase:"
	@echo "  PASSPHRASE='your passphrase' make run"

build:
	docker-compose build

run:
	docker-compose run --rm performance-lab npm start

shell:
	docker-compose run --rm performance-lab /bin/bash

clean:
	docker-compose down -v
	docker rmi docker-performance-lab 2>/dev/null || true
