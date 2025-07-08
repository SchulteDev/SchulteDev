serve:
	bundle exec jekyll serve --force_polling --livereload --incremental

docker-serve:
	docker-compose up --build

clean:
	-rm -rf .jekyll-cache
	-rm -rf _site
	-rm -rf build
	-rm -f .jekyll-metadata

build: clean
	bundle install
	bundle exec jekyll build

test: build
	bundle exec rake test

docker-test:
	docker-compose run --rm test

all: test

.PHONY: serve clean build test all
