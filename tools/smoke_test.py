#!/usr/bin/env python3
"""Lightweight repository smoke checks for Sciwrix and its Android wrapper."""

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
    "Sciwrix title": "<title>sciwrix</title>" in lower,
    "Markdown support": ".md" in lower and "markdown" in lower,
    "WYSIWYG editor": "wysiwyg" in lower,
    "MathJax maths rendering": "mathjax" in lower,
    "undo support": "undo" in lower,
    "redo support": "redo" in lower,
    "browser storage": "localstorage" in lower,
    "printing": "print" in lower,
    "LaTeX export": "buildlatexdocument" in lower and 'value="latex"' in lower,
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
require("android.intent.action.VIEW" in manifest, "Markdown ACTION_VIEW association is missing")
require("android.intent.action.EDIT" in manifest, "Markdown ACTION_EDIT association is missing")
require("text/markdown" in manifest, "Markdown MIME association is missing")
require("text/x-markdown" in manifest, "Legacy Markdown MIME association is missing")
require("application/markdown" in manifest, "Application Markdown MIME association is missing")
require("text/plain" in manifest, "Text MIME fallback association is missing")
require("android:launchMode=\"singleTop\"" in manifest, "singleTop launch mode is missing")

require("text/markdown" in activity, "Android Markdown file picker support is missing")
require("onNewIntent" in activity, "opening another Markdown file while running is unsupported")
require("openInputStream" in activity, "incoming Markdown document reading is missing")
require("OpenableColumns.DISPLAY_NAME" in activity, "incoming Markdown filename handling is missing")
require("new DataTransfer()" in activity, "incoming Markdown hand-off to the web editor is missing")
require("createPrintDocumentAdapter" in activity, "Android printing support is missing")
require("ACTION_CREATE_DOCUMENT" in activity, "native Android save picker is missing")
require("beginFileSave" in activity, "native Android save bridge is missing")
require("appendFileSaveChunk" in activity, "chunked Android save transfer is missing")
require("completeFileSave" in activity, "Android save completion handling is missing")
require("openOutputStream" in activity, "Android document writing is missing")
require("HTMLAnchorElement.prototype.click" in activity, "web download interception is missing")
require("documentLoadInProgress = true" in html, "New Document load lock is missing")
require(r"\documentclass[11pt,a4paper]{article}" in html, "LaTeX document preamble is missing")
require("application/x-tex;charset=utf-8" in html, "LaTeX download MIME type is missing")
require("takePersistableUriPermission" in activity, "persistent document permission handling is missing")
require("FLAG_GRANT_WRITE_URI_PERMISSION" in activity, "document write permission is missing")
require("currentDocumentWritable" in activity, "direct Save state is missing")
require("forceSaveAs" in activity, "Save As distinction is missing")

require("SCIENCEMD_VERSION_CODE" in gradle, "release version override is missing")
require("SCIENCEMD_KEYSTORE_PATH" in gradle, "release signing configuration is missing")
require("?: '13'" in gradle and "?: '1.5.0'" in gradle, "Android 1.5.0 version defaults are missing")
require(icon_source.is_file() and icon_source.stat().st_size > 1_000, "launcher icon source is missing")


require((ROOT / "LICENSE").is_file(), "Apache 2.0 LICENSE file is missing")
require((ROOT / "NOTICE").is_file(), "NOTICE file is missing")
require((ROOT / "THIRD_PARTY_NOTICES.md").is_file(), "third-party notices are missing")
require((ROOT / "WICKED_GOOD_XPATH_LICENSE.txt").is_file(), "Wicked Good XPath licence is missing")
require("Licence and acknowledgements" in html, "in-app licence acknowledgements are missing")
require("Apache License 2.0 OR Mozilla Public License 2.0" in html, "DOMPurify licence choice is recorded incorrectly")
require("MathJax 3.2.1 | Apache License 2.0" in html, "MathJax licence banner is missing")

print("Sciwrix smoke checks passed.")
