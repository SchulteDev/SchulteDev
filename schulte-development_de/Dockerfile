FROM ruby:3.2-alpine

RUN apk add --no-cache build-base cmake gcc git
WORKDIR /app

# because of Docker layering (caching)
COPY Gemfile* ./

RUN bundle install
COPY . .
EXPOSE 4000 35729

CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--force_polling", "--livereload", "--incremental"]
