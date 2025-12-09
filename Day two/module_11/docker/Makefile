.PHONY: build run shell clean help create-test-files list-patches

help:
	@echo "Quilts Module - Docker Commands"
	@echo "================================"
	@echo ""
	@echo "  make build             - Build the Docker image"
	@echo "  make run               - Start interactive shell"
	@echo "  make create-test-files - Create test files for quilt exercises"
	@echo "  make clean             - Remove containers and images"
	@echo ""
	@echo "For TypeScript SDK exercises, see hands-on-source-code/"
	@echo ""
	@echo "Example:"
	@echo "  SUI_WALLET_PATH=~/.sui/sui_config make run"

build:
	docker-compose build

run:
	docker-compose run --rm quilts-lab

shell: run

create-test-files:
	docker-compose run --rm quilts-lab /bin/bash -c '\
		echo "=== Creating Test Files for Quilts ===" && \
		mkdir -p test-files && \
		echo "Welcome to Walrus Quilts!" > test-files/introduction.txt && \
		echo "{\"version\": \"1.0\", \"feature\": \"quilts\"}" > test-files/config.json && \
		echo "<!DOCTYPE html><html><body>Hello Quilt!</body></html>" > test-files/index.html && \
		echo "id,name,value" > test-files/data.csv && \
		echo "1,item1,100" >> test-files/data.csv && \
		echo "" && \
		echo "Files created:" && \
		ls -la test-files/ && \
		echo "" && \
		echo "Ready for quilt exercises! See hands-on documentation."'

clean:
	docker-compose down -v
	docker rmi walrus-quilts-lab 2>/dev/null || true
	rm -rf workspace/*

