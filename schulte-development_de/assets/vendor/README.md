# Vendored third-party assets

Everything here used to be loaded from a public CDN by the `beautiful-jekyll`
remote theme. That meant every visitor's IP address was sent to Google,
Cloudflare, StackPath and jsDelivr on first paint, before any consent could be
obtained. Google Fonts in particular has been litigated in Germany
(LG München I, Az. 3 O 17493/20). These files are now served from this origin.

The references live in [`_layouts/base.html`](../../_layouts/base.html), a local
override of the theme layout. When bumping the remote theme, re-check that
override against upstream.

## Contents and provenance

| Path | Version | Fetched from |
| --- | --- | --- |
| `bootstrap-4.4.1/bootstrap.min.css` | 4.4.1 | `https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css` |
| `bootstrap-4.4.1/bootstrap.min.js` | 4.4.1 | `https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js` |
| `jquery-3.5.1/jquery.slim.min.js` | 3.5.1 slim | `https://code.jquery.com/jquery-3.5.1.slim.min.js` |
| `popper-1.16.0/popper.min.js` | 1.16.0 | `https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js` |
| `fontawesome-6.5.2/` | 6.5.2 free | `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/` |
| `fonts/` | Lora v37, Open Sans v44 | `https://fonts.googleapis.com` + `https://fonts.gstatic.com` |

Versions are pinned to exactly what the theme requested, so this is a transport
change only — no visual or behavioural difference.

## Integrity

The four CDN files the theme pinned with SRI were verified byte-for-byte against
those hashes at vendoring time:

```
sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh  bootstrap.min.css
sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6  bootstrap.min.js
sha256-4+XzXVhsDmqanXGHaHvgh1gMQKX40OUvDEBTu8JcmNs=                      jquery-3.5.1.slim.min.js
sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo  popper.min.js
```

To re-verify, re-download and compare before applying the one modification
below:

```bash
openssl dgst -sha384 -binary FILE | openssl base64 -A
```

The **only** post-download edit is that the trailing `sourceMappingURL` comment
was stripped from `bootstrap.min.css`, `bootstrap.min.js` and `popper.min.js`,
because the `.map` files are not vendored and the references would 404:

```bash
perl -0pi -e 's{\n?(?:/\*#\s*sourceMappingURL=[^*]*\*/|//#\s*sourceMappingURL=\S*)\s*\z}{\n}' FILE
```

## Fonts

`fonts/fonts.css` is generated, not hand-written. It is the concatenation of the
two Google Fonts stylesheets the theme requested, reduced to the `latin` and
`latin-ext` subsets (the site is German and English) and rewritten to point at
`fonts/files/`. Google now serves variable fonts, so the 28 `@font-face` rules
collapse onto 8 `.woff2` files while still covering every weight and style the
theme asked for.

Regenerate with:

```bash
cd schulte-development_de
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
curl -sSfL -A "$UA" 'https://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic' -o /tmp/lora.css
curl -sSfL -A "$UA" 'https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800' -o /tmp/opensans.css
python tools/vendor-fonts.py /tmp assets/vendor/fonts/fonts.css
```

The `-A` matters: without a modern User-Agent, Google serves the legacy `.ttf`
stylesheet instead of `.woff2`.

Lora and Open Sans are licensed under the SIL Open Font License 1.1.
Font Awesome Free is CC BY 4.0 (icons) / SIL OFL 1.1 (fonts) / MIT (code).
Bootstrap, jQuery and Popper.js are MIT.

## Verifying the result

The built site must reference no external host:

```bash
curl -sS https://schulte-development.de/ | grep -oE '<(script|link)[^>]*https?://[^>]*>'
```

That should print nothing.
