#!/usr/bin/env python3
from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'index.html'
text = path.read_text(encoding='utf-8')

replacements = [
    ('<option value="paragraph">Paragraph</option>', '<option value="normal">Normal</option>'),
    ("if (kind === 'paragraph') {", "if (kind === 'normal') {"),
    ("paragraph: null,", "normal: null,"),
    ("event.target.value = 'paragraph';", "event.target.value = 'normal';"),
]

for old, new in replacements:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'Expected one occurrence of {old!r}, found {count}')
    text = text.replace(old, new, 1)

old_function = '''  function resizeSourceEditor() {
    const source = byId('editor');
    if (!source || source.classList.contains('hidden')) return;
    source.style.setProperty('height', 'auto', 'important');
    const minimum = Math.max(320, window.innerHeight - 175);
    source.style.setProperty('height', `${Math.max(minimum, source.scrollHeight + 2)}px`, 'important');
  }'''
new_function = '''  function resizeSourceEditor() {
    const source = byId('editor');
    if (!source) return;
    source.style.removeProperty('height');
  }'''
count = text.count(old_function)
if count != 1:
    raise SystemExit(f'Expected one resizeSourceEditor implementation, found {count}')
text = text.replace(old_function, new_function, 1)

old_setup = '''    const source = byId('editor');
    if (source) source.addEventListener('input', resizeSourceEditor);
    window.addEventListener('resize', resizeSourceEditor);
    state.sourceResizeTimer = window.setInterval(resizeSourceEditor, 800);
'''
count = text.count(old_setup)
if count != 1:
    raise SystemExit(f'Expected one source resize setup block, found {count}')
text = text.replace(old_setup, '', 1)

old_css = '''  body.sciwrix-ribbon-enabled #editor {
    resize: none !important;
    white-space: pre-wrap !important;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
    font-size: 14px !important;
  }'''
new_css = '''  body.sciwrix-ribbon-enabled #editor {
    height: calc(100dvh - 175px) !important;
    min-height: calc(100dvh - 175px) !important;
    max-height: calc(100dvh - 175px) !important;
    overflow: auto !important;
    resize: none !important;
    white-space: pre-wrap !important;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
    font-size: 14px !important;
    overscroll-behavior: contain;
  }'''
count = text.count(old_css)
if count != 1:
    raise SystemExit(f'Expected one source editor CSS block, found {count}')
text = text.replace(old_css, new_css, 1)

if 'value="paragraph">Paragraph' in text:
    raise SystemExit('Old Paragraph label remains')
if 'setInterval(resizeSourceEditor' in text:
    raise SystemExit('Source resize timer remains')

path.write_text(text, encoding='utf-8')
