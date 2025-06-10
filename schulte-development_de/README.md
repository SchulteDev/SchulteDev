[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-pink.svg)](https://conventionalcommits.org)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)
[![schulte-development.de | Build, deploy to GitHubPage on main](https://github.com/SchulteDev/SchulteDev/actions/workflows/build_deploy.yml/badge.svg)](https://github.com/SchulteDev/SchulteDev/actions/workflows/build_deploy.yml)
[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-dark.svg)](https://sonarcloud.io/summary/new_code?id=SchulteDev_SchulteDev)

Website for [schulte-development.de](https://schulte-development.de)

# Development notes

- [Jekyll](https://jekyllrb.com) as the static site framework
  - [Beautiful-Jekyll](https://beautifuljekyll.com) as the Jekyll theme
- Hosted by [GitHub Pages](https://pages.github.com/)

## Setup

### Option 1: Native Installation

- Follow [Jekyll installation instructions](https://jekyllrb.com/docs/#instructions)

### Option 2: Docker (Recommended for Windows)

Requirements:

- [Docker](https://www.docker.com/products/docker-desktop/) installed on your system

## Run locally

### Native Installation

    $ make

## Docker

    $ cd schulte-development_de
    $ docker-compose up
