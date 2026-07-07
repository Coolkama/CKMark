#!/usr/bin/env python3
"""Add the Google Search Console verification tag to the ScienceMD homepage."""

from pathlib import Path

homepage = Path(__file__).resolve().parents[1] / "home" / "index.html"
tag = '<meta name="google-site-verification" content="8T_Lhlq8hZqCxSO8JbrTHXz-VCUu44IGhsJOVtdTp9o">'
marker = '<meta name="author" content="Trevor Neil Kelleher">'

html = homepage.read_text(encoding="utf-8")
if tag in html:
    print("Google verification tag is already present.")
else:
    count = html.count(marker)
    if count != 1:
        raise SystemExit(f"Expected exactly one author meta marker, found {count}")
    html = html.replace(marker, f"{marker}\n{tag}", 1)
    homepage.write_text(html, encoding="utf-8")

updated = homepage.read_text(encoding="utf-8")
if updated.count(tag) != 1:
    raise SystemExit("Google verification tag was not added exactly once")

print("Google verification tag added successfully.")
