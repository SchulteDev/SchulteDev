# Vendored third-party assets

Everything here used to be loaded from a public CDN by the `beautiful-jekyll`
remote theme. That meant every visitor's IP address was sent to Google,
Cloudflare, StackPath and jsDelivr on first paint, before any consent could be
obtained. Google Fonts in particular has been litigated in Germany
(LG München I, Az. 3 O 17493/20). These files are now served from this origin.

The references live in [`_layouts/base.html`](../../_layouts/base.html), a local
override of the theme layout. `remote_theme` in `_config.yml` is unpinned, so
the build tracks the theme's default branch: re-diff that override against
upstream on any rebuild, not just on a deliberate version bump.

## Contents and provenance

| Path | Version | Fetched from |
| --- | --- | --- |
| `bootstrap-4.4.1/bootstrap.min.css` | 4.4.1 | `https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css` |
| `bootstrap-4.4.1/bootstrap.min.js` | 4.4.1 | `https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js` |
| `jquery-3.5.1/jquery.slim.min.js` | 3.5.1 slim | `https://code.jquery.com/jquery-3.5.1.slim.min.js` |
| `popper-1.16.0/popper.min.js` | 1.16.0 | `https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js` |
| `fontawesome-6.5.2/` | 6.5.2 free | `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/` |
| `fonts/` | Lora v37, Open Sans v44 | `https://fonts.googleapis.com` + `https://fonts.gstatic.com` |

The four libraries are byte-identical to the versions the theme requested, so
for them this is a transport change only. The fonts carry one deliberate
deviation, described under [Fonts](#fonts).

## Integrity

The four CDN files the theme pinned with SRI were verified byte-for-byte against
those hashes at vendoring time. **Note the algorithm differs per file** — it is
whatever prefix the hash carries:

```
sha384  bootstrap.min.css   Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh
sha384  bootstrap.min.js    wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6
sha256  jquery.slim.min.js  4+XzXVhsDmqanXGHaHvgh1gMQKX40OUvDEBTu8JcmNs=
sha384  popper.min.js       Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo
```

To re-verify, re-download and hash with the matching algorithm, before applying
the one modification below:

```bash
openssl dgst -sha384 -binary FILE | openssl base64 -A   # bootstrap, popper
openssl dgst -sha256 -binary FILE | openssl base64 -A   # jquery
```

The **only** post-download edit is that the trailing `sourceMappingURL` comment
was stripped from `bootstrap.min.css`, `bootstrap.min.js` and `popper.min.js`,
because the `.map` files are not vendored and the references would 404. The
other two files contain no such comment and are committed untouched.

```bash
perl -0pi -e 's{\n?(?:/\*#\s*sourceMappingURL=[^*]*\*/|//#\s*sourceMappingURL=\S*)\s*\z}{\n}' FILE
```

## Fonts

`fonts/fonts.css` is generated, not hand-written. It is the concatenation of the
two Google Fonts stylesheets the theme requested, reduced to the `latin` and
`latin-ext` subsets and rewritten to point at `fonts/files/`. Google now serves
variable fonts, so the 28 `@font-face` rules collapse onto 8 `.woff2` files
while still covering every weight and style the theme asked for.

Dropping the other subsets is the one intentional behavioural change in this
directory: Cyrillic, Greek, Hebrew and Vietnamese text now falls back to a
system font. The site is German and English, so nothing on it is affected.

Regenerate with (requires Python 3.9+):

```bash
cd schulte-development_de
python tools/vendor-fonts.py
```

The script fetches both stylesheets itself, using a modern browser User-Agent —
without one Google serves the legacy `.ttf` stylesheet instead of `.woff2`.

It also **rewrites `fonts/files/`**: it overwrites the `.woff2` binaries and
deletes any file there that the regenerated CSS no longer references, so the
directory always answers "which fonts does this site actually serve". Check
`git status` afterwards; a Google version bump (`v37` → `v38`) shows up as a set
of renamed files. The script aborts rather than writing partial output if
anything looks wrong — an unrecognised stylesheet layout, a subset that
disappeared, a download that is not a woff2, or any URL it failed to localise.

Lora and Open Sans are licensed under the SIL Open Font License 1.1.
Font Awesome Free is CC BY 4.0 (icons) / SIL OFL 1.1 (fonts) / MIT (code).
Bootstrap, jQuery and Popper.js are MIT.

## Verifying the result

This is enforced automatically, on every push and pull request, by
`no_external_subresources` in [`Rakefile`](../../Rakefile) via `make validate`,
and again on the production artifact before it deploys:

```bash
cd schulte-development_de
bundle exec jekyll build && bundle exec rake no_external
```

It walks every built HTML page for sub-resource attributes and fetching `<link>`
rels, every inline `<style>`, and every `.css` file in `_site` for `url()` and
`@import`. Outbound `<a href>` links are deliberately not flagged: they disclose
nothing until the visitor clicks.

A manual spot check against the deployed site is possible, but note that
`rel="canonical"` is absolute by design and will always match a naive grep:

```bash
curl -sS https://schulte-development.de/ \
  | grep -oE '<(script|link)[^>]*(src|href)="https?://[^"]*"' \
  | grep -v 'rel="canonical"'
```

That should print nothing. It is strictly weaker than the Rake check — it misses
`<img>`, `@import` and anything inside a stylesheet — so treat it as a smoke
test, not as the gate.
