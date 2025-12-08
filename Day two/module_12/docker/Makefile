.PHONY: build test solution shell clean help

help:
	@echo "Failure Handling Module - Docker Commands"
	@echo "=========================================="
	@echo ""
	@echo "  make build     - Build the Docker image"
	@echo "  make test      - Run the debug scenario (broken code)"
	@echo "  make solution  - Run the solution"
	@echo "  make shell     - Open interactive shell in container"
	@echo "  make clean     - Clean up containers and images"
	@echo ""
	@echo "For TypeScript source code, see ../hands-on-source-code/"

build:
	docker-compose build

# Run debug scenario (broken code - students fix this)
test:
	docker-compose run --rm failure-handling-lab npm run debug-scenario

# Run the solution
solution:
	docker-compose run --rm failure-handling-lab npm run solution

# Interactive shell
shell:
	docker-compose run --rm failure-handling-lab /bin/bash

# Clean up
clean:
	docker-compose down -v
	docker rmi walrus-failure-handling-lab 2>/dev/null || true

