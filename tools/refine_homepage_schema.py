#!/usr/bin/env python3
"""Remove ineligible software rich-result markup without changing page content."""

from __future__ import annotations

import json
import re
from pathlib import Path

homepage = Path(__file__).resolve().parents[1] / "home" / "index.html"
html = homepage.read_text(encoding="utf-8")
pattern = re.compile(
    r'(<script type="application/ld\+json">\s*)(.*?)(\s*</script>)',
    re.S,
)
match = pattern.search(html)
if not match:
    raise SystemExit("Homepage JSON-LD block not found")

data = json.loads(match.group(2))
graph = data.get("@graph")
if not isinstance(graph, list):
    raise SystemExit("Expected a JSON-LD @graph list")

software = next((item for item in graph if item.get("@type") == "SoftwareApplication"), None)
if software is None:
    print("SoftwareApplication markup is already absent.")
else:
    graph.remove(software)

webpage = next((item for item in graph if item.get("@type") == "WebPage"), None)
if webpage is None:
    raise SystemExit("WebPage structured data not found")
webpage["about"] = {
    "@type": "CreativeWork",
    "name": "ScienceMD",
    "url": "https://coolkama.github.io/ScienceMD/home/",
    "description": (
        "ScienceMD is a free, portable Markdown and LaTeX editor for scientific "
        "and technical writing."
    ),
    "license": "https://www.apache.org/licenses/LICENSE-2.0",
    "sameAs": "https://github.com/Coolkama/ScienceMD",
}

replacement = match.group(1) + json.dumps(data, ensure_ascii=False, indent=2) + match.group(3)
updated = html[: match.start()] + replacement + html[match.end() :]
json.loads(pattern.search(updated).group(2))
if '"@type": "SoftwareApplication"' in updated:
    raise SystemExit("SoftwareApplication markup was not removed")
homepage.write_text(updated, encoding="utf-8")
print("Homepage structured data refined successfully.")
