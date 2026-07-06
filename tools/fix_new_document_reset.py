#!/usr/bin/env python3
"""Prevent delayed visual-editor events from undoing New Document."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
SMOKE = ROOT / "tools/smoke_test.py"

html = INDEX.read_text(encoding="utf-8")

old = """    function clearDraft() {
      const confirmed = confirm('Start a new document from the built-in ScienceMD starter? This will replace the current editor text, but it will not delete any files from your device.');
      if (!confirmed) return;

      embeddedImages = {};
      nextImageNumber = 1;
      saveImageMap();

      // New document must be treated like opening a completely different file.
      // Updating the hidden Markdown textarea is not enough: if the visual editor
      // currently has focus, the normal render path deliberately avoids rebuilding
      // it, which left the previous document visible in WYSIWYG mode.
      activeMathEditInput = null;
      savedWysiwygRange = null;
      hideTableTools();
      setEditorMarkdown(starterText, { collapseImages: false, resetScroll: true });
      setFileName('science-draft.md');

      if (sourceMode) setSourceMode(false);
      switchView('edit');

      // Force the visual editor after switchView as well, because wide desktop
      // mode calls renderNow() during the switch and renderNow() is intentionally
      // conservative about rebuilding a focused WYSIWYG pane.
      forceWysiwygFromMarkdown({ resetScroll: true, focusStart: true });
      renderNow();
      saveDraft(false);
      resetHistory(editor.value || '');

      requestAnimationFrame(() => {
        forceWysiwygFromMarkdown({ resetScroll: true, focusStart: true });
      });

      showToast('New document created');
    }
"""

new = """    function clearDraft() {
      const confirmed = confirm('Start a new document from the built-in ScienceMD starter? This will replace the current editor text, but it will not delete any files from your device.');
      if (!confirmed) return;

      // Treat New exactly like loading another file. On mobile browsers and
      // Android WebView, a delayed contenteditable/keyboard event can otherwise
      // write the previous visual document back over the starter text.
      documentLoadInProgress = true;
      clearTimeout(renderTimer);
      clearTimeout(historyTimer);

      try {
        try { wysiwygEditor.blur(); } catch (_error) {}
        try { editor.blur(); } catch (_error) {}

        embeddedImages = {};
        nextImageNumber = 1;
        saveImageMap();

        activeMathEditInput = null;
        savedWysiwygRange = null;
        hideTableTools();
        setEditorMarkdown(starterText, { collapseImages: false, resetScroll: true });
        setFileName('science-draft.md');

        sourceMode = false;
        editor.classList.add('hidden');
        wysiwygEditor.classList.remove('hidden');
        editModeLabel.textContent = 'Visual editor';
        switchView('edit');

        forceWysiwygFromMarkdown({ resetScroll: true, focusStart: false });
        renderNow();
        saveDraft(false);
        resetHistory(editor.value || '');

        // Keep the document-load lock through two animation frames so any late
        // IME or contenteditable input event is ignored before focus is restored.
        requestAnimationFrame(() => requestAnimationFrame(() => {
          forceWysiwygFromMarkdown({ resetScroll: true, focusStart: true });
          renderNow();
          documentLoadInProgress = false;
        }));

        showToast('New document created');
      } catch (error) {
        documentLoadInProgress = false;
        console.error('Could not create a new document:', error);
        editor.value = starterText;
        safeSetStorage(STORAGE_KEY, starterText, true);
        forceWysiwygFromMarkdown({ resetScroll: true, focusStart: true });
        renderNow();
        showToast('New document created with a visual-editor warning.');
      }
    }
"""

if old not in html:
    if new in html:
        print("New Document reset fix is already present.")
    else:
        raise SystemExit("Expected clearDraft implementation was not found")
else:
    INDEX.write_text(html.replace(old, new, 1), encoding="utf-8")
    print("Updated New Document reset handling.")

smoke = SMOKE.read_text(encoding="utf-8")
marker = 'require("HTMLAnchorElement.prototype.click" in activity, "web download interception is missing")\n'
check = 'require("documentLoadInProgress = true" in html, "New Document load lock is missing")\n'
if check not in smoke:
    if marker not in smoke:
        raise SystemExit("Smoke-test insertion point was not found")
    smoke = smoke.replace(marker, marker + check, 1)
    SMOKE.write_text(smoke, encoding="utf-8")
    print("Added New Document regression smoke check.")
