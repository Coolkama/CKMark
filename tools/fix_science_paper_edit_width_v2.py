#!/usr/bin/env python3
"""Widen the live visual editing surface for paper-like styles."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"

html = INDEX.read_text(encoding="utf-8")

marker = "/* CKMARK-EDITOR-WIDTH-OVERRIDE-V2 */"
if marker in html:
    print("Sciwrix editor width override v2 is already present.")
    raise SystemExit(0)

override = """

  /* CKMARK-EDITOR-WIDTH-OVERRIDE-V2
     Keep selected output styles from turning the live visual editor into a
     narrow print-preview column. Print/export rendering remains governed by
     the output style CSS and print rules. */
  @media screen {
    #visualEditor,
    #visualEditor *,
    [contenteditable="true"],
    [contenteditable="true"] *,
    .visual-editor,
    .visual-editor *,
    .wysiwyg-editor,
    .wysiwyg-editor *,
    .wysiwyg-content,
    .wysiwyg-content *,
    .editor-content,
    .editor-content *,
    .editor-document,
    .editor-document *,
    .document-editor,
    .document-editor *,
    .editable-document,
    .editable-document *,
    .edit-surface,
    .edit-surface *,
    .editor-surface,
    .editor-surface * {
      max-width: none !important;
    }

    #visualEditor,
    [contenteditable="true"],
    .visual-editor,
    .wysiwyg-editor,
    .wysiwyg-content,
    .editor-content,
    .editor-document,
    .document-editor,
    .editable-document,
    .edit-surface,
    .editor-surface {
      width: 100% !important;
      min-width: 0 !important;
    }

    #visualEditor > *,
    [contenteditable="true"] > *,
    .visual-editor > *,
    .wysiwyg-editor > *,
    .wysiwyg-content > *,
    .editor-content > *,
    .editor-document > *,
    .document-editor > *,
    .editable-document > *,
    .edit-surface > *,
    .editor-surface > * {
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
  }
"""

style_end = "</style>"
last_style_end = html.rfind(style_end)
if last_style_end == -1:
    raise SystemExit("Could not find a style block closing tag")

html = html[:last_style_end] + override + "\n" + html[last_style_end:]
INDEX.write_text(html, encoding="utf-8")
print("Added targeted Sciwrix visual editor width override v2.")
