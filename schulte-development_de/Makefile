serve:
	bundle exec jekyll serve --force_polling --livereload --incremental --config _config.yml,_config_local.yml

clean:
	-rm -r .jekyll-cache
	-rm -r _site
	-rm -r build
	-rm -r vendor
	-rm .jekyll-metadata

build: clean
	bundle install
	bundle exec jekyll build

test: build
	bundle exec rake test

all: test

.PHONY: serve clean build test all
