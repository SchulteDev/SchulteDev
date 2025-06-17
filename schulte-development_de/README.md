[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-pink.svg)](https://conventionalcommits.org)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)
[![schulte-development.de | Build, deploy to GitHubPage on main](https://github.com/SchulteDev/SchulteDev/actions/workflows/schulte-development-de_build-deploy.yml/badge.svg)](https://github.com/SchulteDev/SchulteDev/actions/workflows/schulte-development-de_build-deploy.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=SchulteDev_SchulteDev&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=SchulteDev_SchulteDev)

Website for [schulte-development.de](https://schulte-development.de)

## 🛠️ Tech Stack

- [Jekyll](https://jekyllrb.com) static site generator
  - [Beautiful-Jekyll](https://beautifuljekyll.com) as the Jekyll theme
- [GitHub Pages](https://pages.github.com/) hosting
- Docker for development
- Automated CI/CD workflows

## Setup

### Option 1: Native Installation

1. Follow [Jekyll installation instructions](https://jekyllrb.com/docs/#instructions)
2. `$ make`

### Option 2: Docker

Requirements: [Docker](https://www.docker.com/products/docker-desktop/) installed


    $ cd schulte-development_de
    $ docker-compose up --build
