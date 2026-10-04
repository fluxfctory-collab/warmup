from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "source-assets"
LOGO_PKG = SRC / "logo-package"
CACHE = ROOT / ".cache" / "images"
OUT = ROOT / "public" / "images"
PUBLIC = ROOT / "public"
DOCS_PIPE = ROOT / "docs" / "pipeline"

FLATLAY = SRC / "Proto 2.4-front.jpg"
WORN = SRC / "Proto 2.4-on left arm~2.jpg"
LOGO_PNG = LOGO_PKG / "WARM UP.png"
LOGO_PDF = LOGO_PKG / "WARM UP.pdf"

for d in (CACHE, OUT, DOCS_PIPE):
    d.mkdir(parents=True, exist_ok=True)
