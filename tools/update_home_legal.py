#!/usr/bin/env python3
"""Add ScienceMD licence metadata and legal links to the product homepage."""

from pathlib import Path

path = Path(__file__).resolve().parents[1] / "home/index.html"
text = path.read_text(encoding="utf-8")

if 'rel="license"' not in text:
    text = text.replace(
        "</title>",
        '</title>\n<link rel="license" href="https://www.apache.org/licenses/LICENSE-2.0">',
        1,
    )

release_link = '<a href="https://github.com/Coolkama/ScienceMD/releases" target="_blank" rel="noopener">Release history</a>'
if "Third-party notices</a>" not in text:
    links = (
        release_link
        + '<a href="https://github.com/Coolkama/ScienceMD/blob/main/LICENSE" target="_blank" rel="noopener">Apache 2.0 licence</a>'
        + '<a href="https://github.com/Coolkama/ScienceMD/blob/main/THIRD_PARTY_NOTICES.md" target="_blank" rel="noopener">Third-party notices</a>'
    )
    if release_link not in text:
        raise SystemExit("Homepage release-history link was not found")
    text = text.replace(release_link, links, 1)

path.write_text(text, encoding="utf-8")
