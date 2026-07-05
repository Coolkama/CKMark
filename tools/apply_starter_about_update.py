#!/usr/bin/env python3
"""Apply the approved ScienceMD starter document and About copy update."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
BUILD_GRADLE = ROOT / "android/app/build.gradle"
RELEASE_WORKFLOW = ROOT / ".github/workflows/release-android-apk.yml"

starter_text = r"""# Welcome to ScienceMD

**ScienceMD** is an offline-first Markdown and LaTeX editor for scientific notes, technical documents, revision material, and print-ready papers.

Use **Write** for visual editing or **MD** when you want direct control of the Markdown source. Your document remains a normal `.md` file.

> Delete this starter guide when you are ready and begin writing.

---

## Quick start

- **New** creates a fresh starter document.
- **Open** loads an existing Markdown file.
- **Save** downloads the current `.md` file.
- **Save As** saves under a new name or exports rendered HTML.
- **Undo** and **Redo** reverse or restore editing changes.
- **Print** prints the selected document style or saves it as PDF.

Autosave is a safety net stored on this device. Use **Save** regularly to create a real file.

---

## Headings and formatting

Use headings to organise longer documents:

```markdown
# Document title
## Main section
### Subsection
```

The edit toolbar also provides bold, italic, quotations, lists, horizontal rules, images, tables, inline maths, and block maths.

---

## Maths

Inline maths uses `\( ... \)`:

\(E = mc^2\)

Display maths uses `\[ ... \]`:

\[
F = G\frac{m_1m_2}{r^2}
\]

In **Write** mode, select a rendered formula to edit its LaTeX source, then choose **Done** to render it again.

---

## Tables

Use the **Table** button to insert and edit a Markdown table visually.

| Quantity | Meaning | Relationship |
|---|---|---|
| \(v\) | wave speed | \(v = f\lambda\) |
| \(f\) | frequency | measured in hertz |
| \(\lambda\) | wavelength | measured in metres |

---

## Code

Triple backticks create a code block:

```csharp
public static double KineticEnergy(double mass, double velocity)
{
    return 0.5 * mass * velocity * velocity;
}
```

---

## Output styles

Choose a style from the **Output** group to change the visual document and its printed or PDF appearance. The selected style does not change the Markdown source.

ScienceMD works as a standalone HTML file, through GitHub Pages, and as an Android app.
"""

about_card = """      <section class=\"about-card\">\n        <div class=\"about-icon\" aria-hidden=\"true\">Σ</div>\n        <div>\n          <h2>ScienceMD</h2>\n          <p><strong>Version 1.2.1</strong></p>\n          <p>An offline-first Markdown and LaTeX editor for scientific and technical writing.</p>\n          <p>The standalone browser edition and Android app keep document editing on your device. No account or server is required.</p>\n          <p class=\"creator\">Designed and created by Trevor Neil Kelleher.</p>\n          <p><a href=\"https://github.com/Coolkama/ScienceMD\" target=\"_blank\" rel=\"noopener noreferrer\">Project source and releases on GitHub</a></p>\n        </div>\n      </section>"""

index = INDEX.read_text(encoding="utf-8")

starter_replacement = "    const starterText = " + json.dumps(starter_text, ensure_ascii=True) + ";"
index, starter_count = re.subn(
    r"    const starterText = \"(?:\\.|[^\"\\])*\";",
    starter_replacement,
    index,
    count=1,
)
if starter_count != 1:
    raise SystemExit(f"Expected to replace one starterText declaration, replaced {starter_count}")

index, about_count = re.subn(
    r"      <section class=\"about-card\">.*?      </section>",
    about_card,
    index,
    count=1,
    flags=re.DOTALL,
)
if about_count != 1:
    raise SystemExit(f"Expected to replace one About card, replaced {about_count}")

INDEX.write_text(index, encoding="utf-8")

gradle = BUILD_GRADLE.read_text(encoding="utf-8")
gradle = gradle.replace(
    "project.findProperty('SCIENCEMD_VERSION_CODE') ?: '3'",
    "project.findProperty('SCIENCEMD_VERSION_CODE') ?: '4'",
    1,
)
gradle = gradle.replace(
    "project.findProperty('SCIENCEMD_VERSION_NAME') ?: '1.2.0'",
    "project.findProperty('SCIENCEMD_VERSION_NAME') ?: '1.2.1'",
    1,
)
if "SCIENCEMD_VERSION_CODE') ?: '4'" not in gradle or "SCIENCEMD_VERSION_NAME') ?: '1.2.1'" not in gradle:
    raise SystemExit("Android version defaults were not updated")
BUILD_GRADLE.write_text(gradle, encoding="utf-8")

workflow = RELEASE_WORKFLOW.read_text(encoding="utf-8")
workflow = workflow.replace("default: '1.2.0'", "default: '1.2.1'", 1)
workflow = workflow.replace("default: '3'", "default: '4'", 1)
if "default: '1.2.1'" not in workflow or "default: '4'" not in workflow:
    raise SystemExit("Release workflow defaults were not updated")
RELEASE_WORKFLOW.write_text(workflow, encoding="utf-8")

print("Updated starter text, About information, and Android 1.2.1 release defaults.")
