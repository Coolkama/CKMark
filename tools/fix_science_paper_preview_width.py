#!/usr/bin/env python3
"""Stop the live Science Paper editor preview from using a narrow max-width."""

from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"

html = INDEX.read_text(encoding="utf-8")

marker = "/* CKMARK-PREVIEW-PHYSICS-WIDTH-FIX */"
if marker in html:
    print("Sciwrix preview physics width fix is already present.")
    raise SystemExit(0)

# Remove max-width declarations specifically from CSS rules whose selector
# contains .preview.preview-style-physics. This keeps print/export rules and
# other paper-style formatting intact while allowing the on-screen editor to
# use the available width.
def remove_physics_preview_max_width(match: re.Match[str]) -> str:
    rule = match.group(0)
    selector, body = rule.split("{", 1)
    if ".preview.preview-style-physics" not in selector:
        return rule
    updated_body = re.sub(r"\s*max-width\s*:\s*[^;{}]+;", "", body)
    return selector + "{" + updated_body

updated = re.sub(r"[^{}]*\.preview\.preview-style-physics[^{}]*\{[^{}]*\}", remove_physics_preview_max_width, html)

# Also add an explicit screen-only guard late in the stylesheet so future minor
# changes cannot reintroduce the narrow on-screen editor width.
override = """

  /* CKMARK-PREVIEW-PHYSICS-WIDTH-FIX
     The Science Paper style should not narrow the live editor on screen. */
  @media screen {
    .preview.preview-style-physics {
      max-width: none !important;
      width: 100% !important;
    }
  }
"""

style_end = "</style>"
last_style_end = updated.rfind(style_end)
if last_style_end == -1:
    raise SystemExit("Could not find a style block closing tag")

updated = updated[:last_style_end] + override + "\n" + updated[last_style_end:]

if updated == html:
    raise SystemExit("No change was made to index.html")

INDEX.write_text(updated, encoding="utf-8")
print("Removed/overrode max-width for .preview.preview-style-physics.")
