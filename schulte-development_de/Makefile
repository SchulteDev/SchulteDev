serve:
	bundle exec jekyll serve --force_polling --livereload --incremental

clean:
	-rm -r .jekyll-cache
	-rm -r _site
	-rm -r .jekyll-metadata

build: clean
	bundle exec jekyll build

test: build
	bundle install
	bundle exec rake test

all: test

.PHONY: serve clean build test all
