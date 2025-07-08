BUNDLE = bundle exec
JEKYLL = $(BUNDLE) jekyll
DOCKER_COMPOSE = docker-compose

.PHONY: help serve doctor clean build test validate docker-serve docker-test all

# Default target
help:
	@echo "Available targets:"
	@echo "  serve        - Start Jekyll development server"
	@echo "  doctor       - Run Jekyll doctor for diagnostics"
	@echo "  clean        - Clean build artifacts"
	@echo "  build        - Clean and build the site"
	@echo "  validate     - Build and validate the site"
	@echo "  test         - Run validation tests"
	@echo "  docker-serve - Start development server in Docker"
	@echo "  docker-test  - Run tests in Docker"
	@echo "  all          - Run complete test suite"

# Development targets
serve:
	$(JEKYLL) serve --force_polling --livereload --incremental

doctor:
	$(JEKYLL) doctor

# Build targets
clean:
	@echo "Cleaning build artifacts..."
	-rm -rf .jekyll-cache
	-rm -rf _site
	-rm -rf build
	-rm -f .jekyll-metadata

build: clean
	@echo "Installing dependencies and building site..."
	$(BUNDLE) install
	$(JEKYLL) build

# Testing targets
validate: build
	@echo "Validating site..."
	$(JEKYLL) doctor
	$(BUNDLE) rake test

test: validate

# Docker targets
docker-serve:
	$(DOCKER_COMPOSE) up --build

docker-test:
	$(DOCKER_COMPOSE) run --build --rm test

# Complete pipeline
all: test
