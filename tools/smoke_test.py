#!/usr/bin/env python3
"""Lightweight repository smoke checks for ScienceMD and its Android wrapper."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"
ANDROID = ROOT / "android"


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


require(HTML.is_file(), "index.html is missing")
require(HTML.stat().st_size > 500_000, "index.html is unexpectedly small")

html = HTML.read_text(encoding="utf-8")
lower = html.lower()

checks = {
    "ScienceMD title": "<title>sciencemd</title>" in lower,
    "Markdown support": ".md" in lower and "markdown" in lower,
    "WYSIWYG editor": "wysiwyg" in lower,
    "MathJax maths rendering": "mathjax" in lower,
    "undo support": "undo" in lower,
    "redo support": "redo" in lower,
    "browser storage": "localstorage" in lower,
    "printing": "print" in lower,
}

for name, passed in checks.items():
    require(passed, f"Missing expected application capability: {name}")

external_assets = re.findall(
    r"<(?:script|link)\b[^>]*(?:src|href)\s*=\s*['\"]https?://",
    html,
    flags=re.IGNORECASE,
)
require(not external_assets, "index.html is no longer self-contained")

starter_assignment = re.search(
    r'const\s+starterText\s*=\s*"(?:\\.|[^"\\\r\n])*"\s*;',
    html,
)
require(
    starter_assignment is not None,
    "starterText must be a valid single-line JavaScript string with escaped newlines",
)

require('<section class="about-card">' in html, "About panel is missing")
require("Project source and releases on GitHub" in html, "Updated About information is missing")
require(
    re.search(r'type\s*=\s*["\']file["\']', html, flags=re.IGNORECASE) is not None,
    "file picker input is missing",
)

manifest = (ANDROID / "app/src/main/AndroidManifest.xml").read_text(encoding="utf-8")
activity = (
    ANDROID
    / "app/src/main/java/uk/co/coolkama/sciencemd/MainActivity.java"
).read_text(encoding="utf-8")
gradle = (ANDROID / "app/build.gradle").read_text(encoding="utf-8")
icon_source = ANDROID / "icon/sciencemd_launcher_icon.webp.b64"

require("@drawable/sciencemd_launcher_icon" in manifest, "launcher icon is not configured")
require("text/markdown" in activity, "Android Markdown file picker support is missing")
require("createPrintDocumentAdapter" in activity, "Android printing support is missing")
require("SCIENCEMD_VERSION_CODE" in gradle, "release version override is missing")
require("SCIENCEMD_KEYSTORE_PATH" in gradle, "release signing configuration is missing")
require(icon_source.is_file() and icon_source.stat().st_size > 1_000, "launcher icon source is missing")

print("ScienceMD smoke checks passed.")
