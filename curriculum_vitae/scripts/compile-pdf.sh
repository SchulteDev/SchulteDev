#!/usr/bin/env bash
# Compiles LaTeX files to PDF like release-cvs.yml, in rootless Podman
set -euo pipefail

image=ghcr.io/xu-cheng/texlive-alpine:20261001

usage() {
  echo "usage: ${0##*/} [-o OUTDIR] FILE.tex..." >&2
  exit 2
}

outdir=
while getopts o: opt; do
  case $opt in
    o) outdir=$OPTARG ;;
    *) usage ;;
  esac
done
shift $((OPTIND - 1))
(($#)) || usage

for tex in "$@"; do
  src=$(realpath -e "$tex")
  out=${outdir:-$(dirname "$src")}
  mkdir -p "$out"
  podman run --rm \
    --volume "$src":"/src/$(basename "$src")":ro,z \
    --volume "$(realpath "$out")":/out:z \
    --workdir /src \
    "$image" \
    latexmk -lualatex -file-line-error -halt-on-error -interaction=nonstopmode \
    -outdir=/out -auxdir=/tmp "$(basename "$src")"
done
