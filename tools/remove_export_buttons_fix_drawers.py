#!/usr/bin/env python3
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
index_path = root / "index.html"
text = index_path.read_text(encoding="utf-8")

# Remove the previous follow-up script cleanly from the real document tail.
text, removed = re.subn(
    r'\n?<script id="sciwrix-ribbon-followup-fixes">.*?</script>\s*(?=</body>\s*</html>\s*$)',
    '\n',
    text,
    count=1,
    flags=re.S | re.I,
)
if removed not in (0, 1):
    raise SystemExit(f"Unexpected follow-up script count removed: {removed}")

# Work only inside the ribbon stylesheet.
style_start = text.index('<style id="sciwrix-ribbon-ui-styles">')
style_end = text.index('</style>', style_start)
style = text[style_start:style_end]

old_shell = """  #sciwrixRibbonShell {\n    position: relative;\n    z-index: 1200;"""
new_shell = """  #sciwrixRibbonShell {\n    position: relative;\n    z-index: auto;"""
if style.count(old_shell) != 1:
    raise SystemExit('Could not find exactly one ribbon shell z-index rule')
style = style.replace(old_shell, new_shell, 1)

layer_rules = """

  /* Keep the ribbon in normal document stacking; drawers must cover it. */
  body.sciwrix-ribbon-enabled #drawerBackdrop.drawer-backdrop {
    z-index: 2147483646 !important;
  }

  body.sciwrix-ribbon-enabled .nav-drawer {
    z-index: 2147483647 !important;
  }
"""
if '2147483647 !important' not in style:
    style += layer_rules

text = text[:style_start] + style + text[style_end:]

# Remove the dedicated HTML and LaTeX buttons from the File ribbon.
old_file_group = """        ) + separator() + group(
          tool('exportHtml', 'Export HTML', 'HTML') +
          tool('exportLatex', 'Export LaTeX', 'TeX') +
          tool('print', 'Print', '🖨')
        );"""
new_file_group = """        ) + separator() + group(
          tool('print', 'Print', '🖨')
        );"""
if text.count(old_file_group) != 1:
    raise SystemExit('Could not find exactly one File ribbon export group')
text = text.replace(old_file_group, new_file_group, 1)

# Remove now-unreachable action cases as well.
text = text.replace("      case 'exportHtml': openExport('html'); break;\n", '', 1)
text = text.replace("      case 'exportLatex': openExport('latex'); break;\n", '', 1)

# Guardrails.
if "tool('exportHtml'" in text or "tool('exportLatex'" in text:
    raise SystemExit('Export buttons are still present')
if 'z-index: 1200;' in text[style_start:style_end + len(layer_rules) + 200]:
    raise SystemExit('Ribbon still has the old high z-index')
if not re.search(r'</body>\s*</html>\s*$', text, flags=re.I | re.S):
    raise SystemExit('Document tail is invalid')

index_path.write_text(text, encoding="utf-8")
