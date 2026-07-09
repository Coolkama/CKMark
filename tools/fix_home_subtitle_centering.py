#!/usr/bin/env python3
"""Centre the Sciwrix hero subtitle under the product name."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "home" / "index.html"

text = PAGE.read_text(encoding="utf-8")
original = text

old = ".hero-subtitle{max-width:650px;margin:20px 0 0;color:#9bd0ff;font-size:clamp(1.32rem,2.45vw,2rem);line-height:1.18;font-weight:800;letter-spacing:-.03em}"
new = ".hero-subtitle{max-width:650px;margin:20px auto 0;color:#9bd0ff;font-size:clamp(1.32rem,2.45vw,2rem);line-height:1.18;font-weight:800;letter-spacing:-.03em;text-align:center}"

if old in text:
    text = text.replace(old, new, 1)
elif ".hero-subtitle{" in text and "text-align:center" not in text.split(".hero-subtitle{", 1)[1].split("}", 1)[0]:
    raise SystemExit("Found .hero-subtitle but it did not match the expected compact CSS rule.")

# The mobile override already sets margin-top only. Keep the auto side margins there too.
text = text.replace(
    ".hero-subtitle{font-size:clamp(1.18rem,6vw,1.55rem);margin-top:14px}",
    ".hero-subtitle{font-size:clamp(1.18rem,6vw,1.55rem);margin:14px auto 0;text-align:center}",
    1,
)

if text == original:
    raise SystemExit("No subtitle centering changes were applied.")

PAGE.write_text(text, encoding="utf-8")
print("Centred Sciwrix homepage hero subtitle.")
