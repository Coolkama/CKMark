#!/usr/bin/env python3
"""Verify the New Document fix and maintain embedded licence notices."""

from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
SMOKE = ROOT / "tools/smoke_test.py"

text = INDEX.read_text(encoding="utf-8")

if "documentLoadInProgress = true" not in text:
    raise SystemExit("The New Document reset protection is missing")

text = text.replace(
    "Released under the Apache license 2.0 and Mozilla Public License 2.0",
    "Released under the Apache License 2.0 OR Mozilla Public License 2.0",
)
text = text.replace(
    "Released under the Apache License 2.0 and Mozilla Public License 2.0",
    "Released under the Apache License 2.0 OR Mozilla Public License 2.0",
)

project_notice = "<!-- ScienceMD | Copyright 2026 Trevor Neil Kelleher | Apache License 2.0 | Full notices in Help and About. -->"
if project_notice not in text:
    text = text.replace("<html", project_notice + "\n<html", 1)

mathjax_notice = "<!-- MathJax 3.2.1 | Apache License 2.0 | Includes Speech Rule Engine 4.0.6 and Wicked Good XPath 1.3.0. -->"
if mathjax_notice not in text:
    marker = "  <script>\n    window.MathJax = {"
    if marker not in text:
        raise SystemExit("MathJax configuration marker was not found")
    text = text.replace(marker, "  " + mathjax_notice + "\n" + marker, 1)

apache_text = escape((ROOT / "LICENSE").read_text(encoding="utf-8"))
mit_text = escape((ROOT / "WICKED_GOOD_XPATH_LICENSE.txt").read_text(encoding="utf-8"))
sre_notice = escape(
    "Speech Rule Engine\n"
    "Copyright 2014-2018 Volker Sorge\n\n"
    "This product includes software developed by Volker Sorge and originally "
    "implemented in the context of ChromeVox at Google Inc.\n\n"
    "The browser version depends on Wicked Good XPath."
)

licence_section = f"""<!-- SCIENCEMD-LICENCES-START -->
      <section id="licenceAcknowledgements">
        <h3>Licence and acknowledgements</h3>
        <p><strong>ScienceMD</strong> is Copyright 2026 Trevor Neil Kelleher and is licensed under the <strong>Apache License 2.0</strong>.</p>
        <p>This application includes MathJax 3.2.1, DOMPurify 3.4.8, Speech Rule Engine 4.0.6, and Wicked Good XPath 1.3.0. Each component remains governed by its respective licence.</p>
        <details class="licence-details"><summary>Apache License 2.0</summary><pre>{apache_text}</pre></details>
        <details class="licence-details"><summary>Speech Rule Engine notice</summary><pre>{sre_notice}</pre></details>
        <details class="licence-details"><summary>Wicked Good XPath — MIT License</summary><pre>{mit_text}</pre></details>
      </section>
      <!-- SCIENCEMD-LICENCES-END -->"""

start_marker = "<!-- SCIENCEMD-LICENCES-START -->"
end_marker = "<!-- SCIENCEMD-LICENCES-END -->"
if start_marker in text:
    start = text.index(start_marker)
    end = text.index(end_marker, start) + len(end_marker)
    text = text[:start] + licence_section + text[end:]
else:
    autosave_marker = "      <section>\n        <h3>Autosave warning</h3>"
    section_start = text.index(autosave_marker)
    section_end = text.index("      </section>", section_start) + len("      </section>")
    text = text[:section_end] + "\n\n      " + licence_section + text[section_end:]

licence_css = """
    .licence-details {
      margin: 9px 0;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--panel-2);
    }

    .licence-details summary {
      cursor: pointer;
      padding: 10px 12px;
      font-weight: 750;
    }

    .licence-details pre {
      max-height: 46vh;
      margin: 0 10px 10px;
      white-space: pre-wrap;
      overflow: auto;
      font-size: 0.72rem;
    }

"""
if ".licence-details {" not in text:
    css_marker = "    .about-card {"
    if css_marker not in text:
        raise SystemExit("About-panel CSS marker was not found")
    text = text.replace(css_marker, licence_css + css_marker, 1)

INDEX.write_text(text, encoding="utf-8")
print("Embedded ScienceMD and third-party licence notices.")

smoke = SMOKE.read_text(encoding="utf-8")
legal_checks = """
require((ROOT / "LICENSE").is_file(), "Apache 2.0 LICENSE file is missing")
require((ROOT / "NOTICE").is_file(), "NOTICE file is missing")
require((ROOT / "THIRD_PARTY_NOTICES.md").is_file(), "third-party notices are missing")
require((ROOT / "WICKED_GOOD_XPATH_LICENSE.txt").is_file(), "Wicked Good XPath licence is missing")
require("Licence and acknowledgements" in html, "in-app licence acknowledgements are missing")
require("Apache License 2.0 OR Mozilla Public License 2.0" in html, "DOMPurify licence choice is recorded incorrectly")
require("MathJax 3.2.1 | Apache License 2.0" in html, "MathJax licence banner is missing")
"""
if "in-app licence acknowledgements are missing" not in smoke:
    completion = 'print("ScienceMD smoke checks passed.")'
    if completion not in smoke:
        raise SystemExit("Smoke-test completion marker was not found")
    smoke = smoke.replace(completion, legal_checks + "\n" + completion, 1)

SMOKE.write_text(smoke, encoding="utf-8")
print("Updated licensing regression checks.")
