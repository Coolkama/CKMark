#!/usr/bin/env python3
"""Repair the invalid multiline starterText JavaScript string in index.html."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
BUILD_GRADLE = ROOT / "android/app/build.gradle"

starter_text = r"""# Welcome to Sciwrix

**Sciwrix** is an offline-first Markdown and LaTeX editor for scientific notes, technical documents, revision material, and print-ready papers.

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

Sciwrix works as a standalone HTML file, through GitHub Pages, and as an Android app.
"""

html = INDEX.read_text(encoding="utf-8")
start_marker = "    const starterText = "
end_marker = "\n\n    function showToast"
start = html.find(start_marker)
if start < 0:
    raise SystemExit("starterText declaration was not found")
end = html.find(end_marker, start)
if end < 0:
    raise SystemExit("starterText declaration end marker was not found")

replacement = start_marker + json.dumps(starter_text, ensure_ascii=True) + ";"
html = html[:start] + replacement + html[end:]
html = html.replace("<strong>Version 1.2.1</strong>", "<strong>Version 1.2.2</strong>", 1)
INDEX.write_text(html, encoding="utf-8")

gradle = BUILD_GRADLE.read_text(encoding="utf-8")
gradle = gradle.replace(
    "project.findProperty('SCIENCEMD_VERSION_CODE') ?: '4'",
    "project.findProperty('SCIENCEMD_VERSION_CODE') ?: '5'",
    1,
)
gradle = gradle.replace(
    "project.findProperty('SCIENCEMD_VERSION_NAME') ?: '1.2.1'",
    "project.findProperty('SCIENCEMD_VERSION_NAME') ?: '1.2.2'",
    1,
)
if "SCIENCEMD_VERSION_CODE') ?: '5'" not in gradle or "SCIENCEMD_VERSION_NAME') ?: '1.2.2'" not in gradle:
    raise SystemExit("Android version defaults were not updated to 1.2.2 / 5")
BUILD_GRADLE.write_text(gradle, encoding="utf-8")

print("Repaired starter JavaScript and prepared Android 1.2.2.")
