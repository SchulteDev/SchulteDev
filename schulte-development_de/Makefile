.PHONY: help serve doctor clean build test validate podman-build podman-serve podman-test all

# Default target
help:
	@echo "Available targets:"
	@echo "  serve        - Start Jekyll development server"
	@echo "  doctor       - Run Jekyll doctor for diagnostics"
	@echo "  clean        - Clean build artifacts"
	@echo "  build        - Clean and build the site"
	@echo "  validate     - Build and validate the site"
	@echo "  test         - Run validation tests"
	@echo "  podman-build - Build the development container image with Podman"
	@echo "  podman-serve - Start development server in a rootless Podman container"
	@echo "  podman-test  - Run validation tests in a rootless Podman container"
	@echo "  all          - Run complete test suite"

# Development targets
serve:
	bundle exec jekyll serve --force_polling --livereload --incremental

doctor:
	bundle exec jekyll doctor

# Build targets
clean:
	@echo "Cleaning build artifacts..."
	-rm -rf .jekyll-cache
	-rm -rf _site
	-rm -rf build
	-rm -f .jekyll-metadata

build: clean
	@echo "Installing dependencies and building site..."
	bundle install
	bundle exec jekyll build

# Testing targets
validate: build
	@echo "Validating site..."
	bundle exec jekyll doctor
	bundle exec rake test

test: validate

# Podman targets (rootless)
#
# The image runs as `nobody` (UID/GID 65534). `--userns=keep-id:uid=65534,gid=65534`
# maps the host user onto that UID, so files the container writes into the
# bind-mounted folder (_site, .jekyll-cache, .jekyll-metadata) end up owned by
# the host user. `:Z` relabels the bind mount for SELinux hosts (no-op elsewhere).
PODMAN_IMAGE := localhost/schulte-development-de:dev
PODMAN_RUN := podman run --rm \
	--userns=keep-id:uid=65534,gid=65534 \
	--volume "$(CURDIR)":/app:Z

podman-build:
	podman build --file Containerfile --tag $(PODMAN_IMAGE) .

podman-serve: podman-build
	$(PODMAN_RUN) -it \
		--publish 127.0.0.1:4000:4000 \
		--publish 127.0.0.1:35729:35729 \
		$(PODMAN_IMAGE)

podman-test: podman-build
	$(PODMAN_RUN) $(PODMAN_IMAGE) make validate

# Complete pipeline
all: test
