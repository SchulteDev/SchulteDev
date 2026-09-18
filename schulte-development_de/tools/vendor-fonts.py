import re, sys, pathlib, urllib.request, hashlib

SCRATCH = pathlib.Path(sys.argv[1])
OUT_CSS = pathlib.Path(sys.argv[2])          # assets/vendor/fonts/fonts.css
FILES   = OUT_CSS.parent / "files"
KEEP    = {"latin", "latin-ext"}

BLOCK = re.compile(r"/\*\s*(?P<subset>[a-z-]+)\s*\*/\s*(?P<face>@font-face\s*\{.*?\})", re.S)

pieces, urls = [], {}
for name in ("lora.css", "opensans.css"):
    src = (SCRATCH / name).read_text(encoding="utf-8")
    kept = 0
    for m in BLOCK.finditer(src):
        if m.group("subset") not in KEEP:
            continue
        face = m.group("face")
        for url in re.findall(r"url\((https://fonts\.gstatic\.com/[^)]+)\)", face):
            local = url.rsplit("/s/", 1)[1].replace("/", "_")
            urls[url] = local
            face = face.replace(url, f"files/{local}")
        pieces.append(f"/* {name.removesuffix('.css')} – {m.group('subset')} */\n{face}\n")
        kept += 1
    print(f"{name}: kept {kept} of {len(BLOCK.findall(src))} faces")

FILES.mkdir(parents=True, exist_ok=True)
for url, local in sorted(urls.items()):
    data = urllib.request.urlopen(url, timeout=60).read()
    (FILES / local).write_bytes(data)
    print(f"  {local}  {len(data)} bytes  sha256:{hashlib.sha256(data).hexdigest()[:16]}")

header = (
    "/*\n"
    " * Self-hosted Google Fonts: Lora and Open Sans (latin + latin-ext subsets).\n"
    " * Replaces the fonts.googleapis.com / fonts.gstatic.com requests that\n"
    " * beautiful-jekyll's base layout makes, so no visitor IP reaches Google.\n"
    " * Fonts are licensed under the SIL Open Font License 1.1.\n"
    " * Regenerate with tools/vendor-fonts.py - see assets/vendor/README.md.\n"
    " */\n\n"
)
OUT_CSS.write_text(header + "".join(pieces), encoding="utf-8")
print(f"\nwrote {OUT_CSS} ({OUT_CSS.stat().st_size} bytes), {len(urls)} font files")
