#!/usr/bin/env python3
"""Add Google Search Console verification to the ScienceMD property root page."""

from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
page = root / "index.html"
tag = '<meta name="google-site-verification" content="8T_Lhlq8hZqCxSO8JbrTHXz-VCUu44IGhsJOVtdTp9o">'

html = page.read_text(encoding="utf-8")
if tag not in html:
    match = re.search(r"<head\b[^>]*>", html, flags=re.IGNORECASE)
    if not match:
        raise SystemExit("Could not find the root page <head> element")
    html = html[:match.end()] + "\n" + tag + html[match.end():]
    page.write_text(html, encoding="utf-8")

updated = page.read_text(encoding="utf-8")
if updated.count(tag) != 1:
    raise SystemExit(f"Expected exactly one verification tag, found {updated.count(tag)}")
print("Google verification tag is present on the property root page.")
