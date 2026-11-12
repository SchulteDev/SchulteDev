# Vendored third-party assets

Self-hosted copies of the libraries and fonts the `beautiful-jekyll` theme needs, so no page loads
anything from a third party. Versions are in the directory names.

They are referenced from [`_layouts/base.html`](../../_layouts/base.html), a local override of the
theme's layout. `remote_theme` is pinned to a commit: re-check that override against upstream
before bumping it.

## Updating

- **Libraries**: unmodified upstream release files, except that the trailing `sourceMappingURL`
  comment is stripped (the `.map` files are not vendored).
- **Fonts**: generated, never hand-edited. From `schulte-development_de/`:

  ```bash
  python tools/vendor-fonts.py
  ```

## Checking

```bash
bundle exec jekyll build && bundle exec rake no_external
```

`make validate` runs the same check, and CI repeats it on the production build.

## Licenses

Lora and Open Sans: SIL OFL 1.1. Font Awesome Free: CC BY 4.0 (icons), SIL OFL 1.1 (fonts), MIT
(code). Bootstrap, jQuery, Popper.js: MIT.
