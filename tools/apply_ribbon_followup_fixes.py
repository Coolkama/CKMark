#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
MARKER = 'sciwrix-ribbon-followup-fixes'

text = INDEX.read_text(encoding="utf-8")

# Remove a previous copy if the helper is rerun.
text = re.sub(
    rf'\n?<script id="{MARKER}">.*?</script>\n?',
    '\n',
    text,
    flags=re.S,
)

# The actual closing body tag must be the final </body> occurrence in a valid file.
body_close = text.rfind('</body>')
if body_close < 0:
    raise SystemExit('Could not find the final </body> tag')

if not re.fullmatch(r'</body>\s*</html>\s*', text[body_close:], flags=re.S | re.I):
    raise SystemExit('The final document tail is not </body></html>; refusing to patch')

script = r'''<script id="sciwrix-ribbon-followup-fixes">
(() => {
  'use strict';

  const layerStyle = document.createElement('style');
  layerStyle.id = 'sciwrix-ribbon-followup-layer-styles';
  layerStyle.textContent = [
    'body.sciwrix-ribbon-enabled #drawerBackdrop.drawer-backdrop { z-index: 3100 !important; }',
    'body.sciwrix-ribbon-enabled .nav-drawer { z-index: 3101 !important; }',
    'body.sciwrix-ribbon-enabled .save-as-dialog, body.sciwrix-ribbon-enabled #tableDialog { z-index: 3201 !important; }'
  ].join('\n');
  document.head.appendChild(layerStyle);

  function prepareExportDialog(format) {
    const legacySaveAs = document.getElementById('saveAsBtn');
    if (!legacySaveAs) return;

    legacySaveAs.click();

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      const dialog = document.querySelector('.save-as-dialog');
      const select = dialog && dialog.querySelector('select[name="format"]');
      if (!dialog || !select) {
        if (attempts >= 20) window.clearInterval(timer);
        return;
      }

      window.clearInterval(timer);
      select.value = format;
      select.dispatchEvent(new Event('change', { bubbles: true }));

      const heading = dialog.querySelector('h3');
      const primary = dialog.querySelector('.save-as-actions .primary');
      const filename = dialog.querySelector('input[name="fileName"]');
      const note = dialog.querySelector('.save-as-note');
      const isHtml = format === 'html';

      if (heading) heading.textContent = isHtml ? 'Export HTML' : 'Export LaTeX';
      if (primary) primary.textContent = 'Export';
      if (note) {
        note.textContent = isHtml
          ? 'Exports the rendered document as a standalone HTML file.'
          : 'Exports a compile-ready LaTeX document while preserving maths and common Markdown structures.';
      }
      if (filename) {
        filename.focus();
        filename.select();
      }
    }, 25);
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('#sciwrixRibbonShell [data-ribbon-action]');
    if (!button) return;

    const action = button.dataset.ribbonAction;
    if (action !== 'exportHtml' && action !== 'exportLatex') return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    prepareExportDialog(action === 'exportHtml' ? 'html' : 'latex');
  }, true);
})();
</script>
'''

text = text[:body_close] + script + text[body_close:]

# Guardrails against the previous failure mode.
if text.count(f'id="{MARKER}"') != 1:
    raise SystemExit('Follow-up marker count is not exactly one')
if not re.search(rf'<script id="{MARKER}">.*?</script>\s*</body>\s*</html>\s*$', text, flags=re.S | re.I):
    raise SystemExit('Follow-up script is not immediately before the real closing body tag')

INDEX.write_text(text, encoding="utf-8")
