#!/usr/bin/env python3
"""Replace the embedded CKMark browser badge with a CKMark badge."""

from pathlib import Path
from urllib.parse import quote
import re

root = Path(__file__).resolve().parents[1]
path = root / "index.html"
html = path.read_text(encoding="utf-8")

svg = """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>
<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#2563eb'/><stop offset='100%' stop-color='#0f766e'/></linearGradient></defs>
<rect x='8' y='8' width='112' height='112' rx='26' fill='url(#g)'/>
<ellipse cx='64' cy='64' rx='43' ry='18' fill='none' stroke='white' stroke-opacity='.24' stroke-width='3'/>
<ellipse cx='64' cy='64' rx='43' ry='18' fill='none' stroke='white' stroke-opacity='.24' stroke-width='3' transform='rotate(60 64 64)'/>
<ellipse cx='64' cy='64' rx='43' ry='18' fill='none' stroke='white' stroke-opacity='.24' stroke-width='3' transform='rotate(120 64 64)'/>
<text x='64' y='77' text-anchor='middle' font-size='39' font-family='Arial,Helvetica,sans-serif' font-weight='800' fill='white'>CK</text>
</svg>"""
uri = "data:image/svg+xml," + quote(svg, safe="")

patterns = (
    r'(<link rel="icon" type="image/svg\+xml" href=")[^"]+(">)',
    r'(<link rel="shortcut icon" href=")[^"]+(">)',
    r'(<link rel="apple-touch-icon" href=")[^"]+(">)',
)

updated = html
for pattern in patterns:
    updated, count = re.subn(pattern, rf"\g<1>{uri}\g<2>", updated, count=1)
    if count != 1:
        raise SystemExit(f"Expected one embedded icon match for: {pattern}")

if updated != html:
    path.write_text(updated, encoding="utf-8")
    print("Updated embedded CKMark browser icons")
