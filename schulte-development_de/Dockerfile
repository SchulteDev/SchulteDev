FROM ruby:3.4-slim

RUN apt-get update &&  \
    apt-get install -y --no-install-recommends build-essential &&  \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
USER nobody

# because of Docker layering (caching)
COPY --chown=nobody:nogroup --chmod=440 Gemfile Gemfile.lock ./

RUN bundle config set force_ruby_platform true && \
    bundle install
COPY --chown=nobody:nogroup --chmod=440 . .
EXPOSE 4000 35729

CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--force_polling", "--livereload", "--incremental"]
