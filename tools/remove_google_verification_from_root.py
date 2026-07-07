#!/usr/bin/env python3
"""Remove the Google Search Console verification tag from the ScienceMD app root."""

from pathlib import Path

root = Path(__file__).resolve().parents[1]
page = root / "index.html"
tag = '<meta name="google-site-verification" content="8T_Lhlq8hZqCxSO8JbrTHXz-VCUu44IGhsJOVtdTp9o">'

html = page.read_text(encoding="utf-8")n
count = html.count(tag)
if count == 0:
    print("Verification tag is already absent from the root app.")
elif count == 1:
    html = html.replace(tag + "\n", "", 1)
    html = html.replace(tag, "", 1)
    page.write_text(html, encoding="utf-8")
else:
    raise SystemExit(f"Expected at most one verification tag, found {count}")

updated = page.read_text(encoding="utf-8")
if tag in updated:
    raise SystemExit("Verification tag still present in root index.html")
print("Verification tag removed from root app.")
