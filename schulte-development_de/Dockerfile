FROM ruby:3.4-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential libcurl4-openssl-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

EXPOSE 4000 35729

RUN bundle install

CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--force_polling", "--livereload", "--incremental", "--config", "_config.yml,_config_local.yml"]
