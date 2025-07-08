serve:
	bundle exec jekyll serve --force_polling --livereload --incremental

doctor:
	bundle exec jekyll doctor

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

validate: build
	bundle exec jekyll doctor
	bundle exec rake test

test: validate

docker-test:
	docker-compose run --build --rm test

all: test

.PHONY: serve doctor clean build test all
