[![schulte-development.de | Build; deploy if main](https://github.com/SchulteDev/SchulteDev/actions/workflows/schulte-development-de_build-deploy.yml/badge.svg)](https://github.com/SchulteDev/SchulteDev/actions/workflows/schulte-development-de_build-deploy.yml)

# schulte-development.de homepage

Source of [schulte-development.de](https://schulte-development.de).

The homepage https://schulte-development.de is used for marketing by Markus Schulte / Schulte
development. Markus is a freelancer and presents his knowledge and experience on his professional
website.

## 🛠️ Tech Stack

- [Jekyll](https://jekyllrb.com) static site generator
  - [Beautiful-Jekyll](https://beautifuljekyll.com) as the Jekyll theme
- [GitHub Pages](https://pages.github.com/) hosting
- Docker for development
- Automated CI/CD workflows

## Local Development

You can build, serve, and test the site locally using `make` commands or Docker.

### Using Make (requires Ruby and Jekyll installed locally)

- **Build:** `make build`
- **Serve:** `make serve`
- **Test:** `make test`

### Using Docker

- **Build & Serve:** `docker-compose up --build`
- **Test:** `docker-compose run --rm jekyll bundle exec rake test`
