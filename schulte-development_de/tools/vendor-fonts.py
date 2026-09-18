#!/usr/bin/env python3
"""Vendor the Google Fonts that beautiful-jekyll's base layout asks for.

Fetches the two stylesheets, keeps only the latin and latin-ext subsets,
downloads the woff2 files they reference and rewrites the CSS to point at
local copies. Writes assets/vendor/fonts/fonts.css plus fonts/files/.

Everything this script emits is committed and served to visitors, so it fails
loudly rather than producing partial output: a stylesheet that still carries a
fonts.gstatic.com URL would silently reinstate the exact third-party leak the
vendoring exists to remove. Every check below exists because the failure it
catches would otherwise look like success.

Usage: python tools/vendor-fonts.py [assets/vendor/fonts/fonts.css]
"""

import hashlib
import pathlib
import re
import sys
import urllib.request
from typing import NoReturn

# Exactly what the theme's _layouts/base.html requested before it was overridden.
SOURCES = {
    "lora": "https://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic",
    "opensans": (
        "https://fonts.googleapis.com/css?family=Open+Sans:"
        "300italic,400italic,600italic,700italic,800italic,400,300,600,700,800"
    ),
}

# Without a modern UA, Google serves the legacy .ttf stylesheet instead of woff2.
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)

# The site is German and English; the other subsets Google offers are dead weight.
KEEP = {"latin", "latin-ext"}

BLOCK = re.compile(
    r"/\*\s*(?P<subset>[^*]+?)\s*\*/\s*(?P<face>@font-face\s*\{.*?\})", re.S
)
# Deliberately permissive: matches quoted or unquoted, any scheme, any host.
# A url() this does not catch is a url() that could ship unrewritten.
ANY_URL = re.compile(r"""url\(\s*(?P<q>['"]?)(?P<url>[^'")]+)(?P=q)\s*\)""")

MIN_FONT_BYTES = 1024
WOFF2_MAGIC = b"wOF2"


def die(msg) -> NoReturn:
    sys.exit(f"vendor-fonts: FAILED: {msg}")


def fetch(url, what) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            if resp.status != 200:
                die(f"{what}: {url} returned HTTP {resp.status}")
            return resp.read()
    except OSError as exc:
        die(f"could not fetch {what} from {url}: {exc}")


def parse_stylesheet(name, css):
    """Return the kept @font-face blocks, or abort if the CSS is not understood."""
    present = css.count("@font-face")
    if present == 0:
        die(f"{name}: stylesheet contains no @font-face rules at all")

    blocks = list(BLOCK.finditer(css))
    # Count rules, not regex hits. If these diverge, Google changed the layout
    # and the subset comments no longer delimit the blocks -- a mismatch here is
    # why "kept 0 of 0 faces" could previously read as success.
    if len(blocks) != present:
        die(
            f"{name}: parsed {len(blocks)} of {present} @font-face rules. "
            "The stylesheet format changed; fix BLOCK before trusting the output."
        )

    kept = [m for m in blocks if m.group("subset") in KEEP]
    if not kept:
        subsets = sorted({m.group("subset") for m in blocks})
        die(f"{name}: no {sorted(KEEP)} subset among {subsets}")
    print(f"  {name}: keeping {len(kept)} of {present} faces")
    return kept


def local_name(url):
    try:
        tail = url.rsplit("/s/", 1)[1]
    except IndexError:
        die(f"unexpected gstatic URL shape, cannot derive a filename: {url}")
    return tail.replace("/", "_")


def main():
    out_css = pathlib.Path(
        sys.argv[1] if len(sys.argv) > 1 else "assets/vendor/fonts/fonts.css"
    )
    files_dir = out_css.parent / "files"

    pieces, wanted = [], {}
    for name, src_url in SOURCES.items():
        css = fetch(src_url, f"{name} stylesheet").decode("utf-8")
        for match in parse_stylesheet(name, css):
            face = match.group("face")
            urls = ANY_URL.findall(face)
            if not urls:
                die(f"{name}: a kept @font-face has no url() at all:\n{face}")
            for _, url in urls:
                if url.startswith("files/"):
                    continue
                if not url.startswith("https://fonts.gstatic.com/"):
                    # Protocol-relative, http, a regional host, a data: URI --
                    # anything unexpected stops here rather than shipping.
                    die(f"{name}: refusing to vendor unexpected url(): {url}")
                local = local_name(url)
                if wanted.setdefault(local, url) != url:
                    die(
                        f"filename collision: {url} and {wanted[local]} "
                        f"both map to {local}"
                    )
                face = face.replace(url, f"files/{local}")
            pieces.append(f"/* {name} – {match.group('subset')} */\n{face}\n")

    files_dir.mkdir(parents=True, exist_ok=True)
    for local, url in sorted(wanted.items()):
        data = fetch(url, f"font {local}")
        if len(data) < MIN_FONT_BYTES:
            die(f"{local}: got {len(data)} bytes from {url}, too small to be a font")
        if not data.startswith(WOFF2_MAGIC):
            die(f"{local}: payload from {url} is not woff2 (starts {data[:4]!r})")
        (files_dir / local).write_bytes(data)
        print(f"  {local}  {len(data)} bytes  sha256:{hashlib.sha256(data).hexdigest()[:16]}")

    text = (
        "/*\n"
        " * Self-hosted Google Fonts: Lora and Open Sans (latin + latin-ext subsets).\n"
        " * Replaces the fonts.googleapis.com / fonts.gstatic.com requests that\n"
        " * beautiful-jekyll's base layout makes, so no visitor IP reaches Google.\n"
        " * Fonts are licensed under the SIL Open Font License 1.1.\n"
        " * Generated by tools/vendor-fonts.py - see assets/vendor/README.md.\n"
        " */\n\n"
    ) + "".join(pieces)

    # Verify what is about to be written, not what was intended.
    if not pieces:
        die("no @font-face rules survived; refusing to write an empty stylesheet")
    for _, url in ANY_URL.findall(text):
        if not url.startswith("files/"):
            die(f"emitted CSS still references {url}")
    if "://" in text.split("*/", 1)[1]:
        die("emitted CSS body still contains an absolute URL")
    for local in wanted:
        written = files_dir / local
        if not written.is_file() or written.stat().st_size < MIN_FONT_BYTES:
            die(f"{written} missing or too small after download")

    out_css.write_text(text, encoding="utf-8", newline="\n")

    # Prune: files/ must answer "which fonts does this site serve" exactly.
    for stale in sorted(files_dir.iterdir()):
        if stale.is_file() and stale.name not in wanted:
            stale.unlink()
            print(f"  pruned stale {stale.name}")

    print(f"\nOK: {out_css} ({out_css.stat().st_size} bytes), {len(wanted)} font files")


if __name__ == "__main__":
    main()
