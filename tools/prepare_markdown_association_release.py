#!/usr/bin/env python3
"""Update the embedded About version for the Android 1.3.0 release."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"

html = INDEX.read_text(encoding="utf-8")

if "<strong>Version 1.3.0</strong>" in html:
    print("CKMark About information already shows version 1.3.0.")
    raise SystemExit(0)

old = "<strong>Version 1.2.2</strong>"
new = "<strong>Version 1.3.0</strong>"

if old not in html:
    raise SystemExit("Expected CKMark 1.2.2 About version was not found")

INDEX.write_text(html.replace(old, new, 1), encoding="utf-8")
print("Updated CKMark About information to version 1.3.0.")
