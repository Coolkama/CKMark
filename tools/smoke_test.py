#!/usr/bin/env python3
"""Lightweight repository smoke checks for Sciwrix and its Android wrapper."""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
import tempfile
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"
ANDROID = ROOT / "android"
WINDOWS = ROOT / "windows" / "Sciwrix.Windows"


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


class InlineScripts(HTMLParser):
    """Collect executable inline JavaScript without interpreting HTML entities."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.capture = False
        self.current: list[str] = []
        self.scripts: list[tuple[str, str]] = []
        self.attributes: dict[str, str | None] = {}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "script":
            return
        self.attributes = dict(attrs)
        self.capture = "src" not in self.attributes
        self.current = []

    def handle_data(self, data: str) -> None:
        if self.capture:
            self.current.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() != "script" or not self.capture:
            return
        script_type = (self.attributes.get("type") or "").lower()
        if script_type in ("", "text/javascript", "application/javascript", "module"):
            self.scripts.append((script_type, "".join(self.current)))
        self.capture = False


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
require(
    "async function toggleFullscreen()" in html,
    "toggleFullscreen function boundary is missing",
)
require(
    "function isFullscreenActive()" in html,
    "isFullscreenActive helper is missing",
)
require(
    "function updateFullscreenButton()" in html,
    "updateFullscreenButton helper is missing and startup will stop before autosave restore",
)
require(
    "const restoredDraft = safeGetStorage(STORAGE_KEY, starterText) || starterText;" in html,
    "autosaved document restoration is missing",
)
require(
    ";\n      const target = document.documentElement;" not in html,
    "fullscreen code has escaped from its function body",
)
require(
    '<option value="normal">Normal</option>' in html,
    "Normal block style is missing from the Markdown ribbon",
)
require(
    '<option value="" selected>Style</option><option value="normal">Normal</option>' in html,
    "Normal block style cannot be selected repeatedly",
)
require(
    "event.target.value = 'normal';" not in html,
    "Block-style selector still prevents choosing Normal",
)
require(
    "window.execWysiwyg('formatBlock', tag)" in html,
    "Normal visual formatting does not preserve the editor selection",
)
require(
    'setInterval(resizeSourceEditor' not in html,
    "Markdown source editor still has the scroll-resetting resize timer",
)
require(
    'height: calc(100dvh - 175px) !important;' in html
    and 'overflow: auto !important;' in html,
    "Markdown source editor does not have a stable scrollable viewport",
)

node = shutil.which("node")
if node:
    parser = InlineScripts()
    parser.feed(html)
    with tempfile.TemporaryDirectory() as temporary_directory:
        for index, (script_type, source) in enumerate(parser.scripts):
            if not source.strip():
                continue
            suffix = ".mjs" if script_type == "module" else ".js"
            script_path = Path(temporary_directory) / f"inline-script-{index}{suffix}"
            script_path.write_text(source, encoding="utf-8")
            result = subprocess.run(
                [node, "--check", str(script_path)],
                capture_output=True,
                text=True,
                check=False,
            )
            require(
                result.returncode == 0,
                f"Inline JavaScript block {index} has a syntax error:\n{result.stderr.strip()}",
            )
else:
    print("WARNING: Node.js was not found; inline JavaScript syntax checking was skipped.")

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
require('android:launchMode="singleTop"' in manifest, "singleTop launch mode is missing")

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

windows_project = (WINDOWS / "Sciwrix.Windows.csproj").read_text(encoding="utf-8")
windows_form = (WINDOWS / "MainForm.cs").read_text(encoding="utf-8")
windows_bridge = (WINDOWS / "bridge.js").read_text(encoding="utf-8")
require("net8.0-windows" in windows_project, "Windows target framework is missing")
require("Microsoft.Web.WebView2" in windows_project, "Windows WebView2 package is missing")
require("<PublishSingleFile>true</PublishSingleFile>" in windows_project, "Windows build is not a portable single executable")
require('LogicalName="Sciwrix.WebApp.index.html"' in windows_project, "Sciwrix HTML is not embedded in the Windows executable")
require("ShowPrintUI" in windows_form, "native Windows printing is missing")
require("OpenFileDialog" in windows_form and "SaveFileDialog" in windows_form, "native Windows file dialogs are missing")
require("currentDocumentPath" in windows_form, "direct Windows Markdown saving is missing")
require("DragDrop" in windows_form, "Windows drag-and-drop opening is missing")
require("AssociateMarkdownFiles" in windows_form, "Windows Markdown association command is missing")
require("Software\\RegisteredApplications" in windows_form, "Windows registered-application entry is missing")
require('new[] { ".md", ".markdown" }' in windows_form, "Windows Markdown extensions are not registered")
require("save-begin" in windows_bridge and "save-chunk" in windows_bridge, "Windows save bridge is missing")
require("openDocument" in windows_bridge, "Windows document-open bridge is missing")

require("SCIENCEMD_VERSION_CODE" in gradle, "release version override is missing")
require("SCIENCEMD_KEYSTORE_PATH" in gradle, "release signing configuration is missing")
require("?: '16'" in gradle and "?: '1.6.1'" in gradle, "Android 1.6.1 version defaults are missing")
require(icon_source.is_file() and icon_source.stat().st_size > 1_000, "launcher icon source is missing")

require((ROOT / "LICENSE").is_file(), "Apache 2.0 LICENSE file is missing")
require((ROOT / "NOTICE").is_file(), "NOTICE file is missing")
require((ROOT / "THIRD_PARTY_NOTICES.md").is_file(), "third-party notices are missing")
require((ROOT / "WICKED_GOOD_XPATH_LICENSE.txt").is_file(), "Wicked Good XPath licence is missing")
require("Licence and acknowledgements" in html, "in-app licence acknowledgements are missing")
require("Apache License 2.0 OR Mozilla Public License 2.0" in html, "DOMPurify licence choice is recorded incorrectly")
require("MathJax 3.2.1 | Apache License 2.0" in html, "MathJax licence banner is missing")

print("Sciwrix smoke checks passed.")
