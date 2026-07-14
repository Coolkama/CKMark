    const STORAGE_KEY = 'sciencemd:v1:draft';
    const THEME_KEY = 'sciencemd:theme';
    const FILENAME_KEY = 'sciencemd:v1:fileName';
    const PREVIEW_STYLE_KEY = 'sciencemd:previewStyle';
    const IMAGE_MAP_KEY = 'sciencemd:imageMap';

    const editor = document.getElementById('editor');
    const wysiwygEditor = document.getElementById('wysiwygEditor');
    const editModeLabel = document.getElementById('editModeLabel');
    const preview = document.getElementById('preview');
    const previewStyle = document.getElementById('previewStyle');
    const formatToolbar = document.querySelector('.format-toolbar');
    const tableTools = document.getElementById('tableTools');
    const tableDialog = document.getElementById('tableDialog');
    const tableForm = document.getElementById('tableForm');
    const tableColumns = document.getElementById('tableColumns');
    const tableRows = document.getElementById('tableRows');
    const tableDialogClose = document.getElementById('tableDialogClose');
    const tableDialogCancel = document.getElementById('tableDialogCancel');
    const fileInput = document.getElementById('fileInput');
    const imageInput = document.getElementById('imageInput');
    const fileNameLabel = document.getElementById('fileName');
    const downloadBtn = document.getElementById('downloadBtn');
    const saveAsBtn = document.getElementById('saveAsBtn');
    const printBtn = document.getElementById('printBtn');
    const clearBtn = document.getElementById('clearBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const darkBtn = document.getElementById('darkBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const helpBtn = document.getElementById('helpBtn');
    const helpDrawer = document.getElementById('helpDrawer');
    const closeHelpBtn = document.getElementById('closeHelpBtn');
    const navBtn = document.getElementById('navBtn');
    const findBtn = document.getElementById('findBtn');
    const mathBtn = document.getElementById('mathBtn');
    const closeNavBtn = document.getElementById('closeNavBtn');
    const closeMathBtn = document.getElementById('closeMathBtn');
    const navDrawer = document.getElementById('navDrawer');
    const mathDrawer = document.getElementById('mathDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const findDrawer = document.getElementById('findDrawer');
    const closeFindBtn = document.getElementById('closeFindBtn');
    const findInput = document.getElementById('findInput');
    const replaceInput = document.getElementById('replaceInput');
    const caseSensitiveFind = document.getElementById('caseSensitiveFind');
    const findStatus = document.getElementById('findStatus');
    const prevMatchBtn = document.getElementById('prevMatchBtn');
    const nextMatchBtn = document.getElementById('nextMatchBtn');
    const replaceOneBtn = document.getElementById('replaceOneBtn');
    const replaceAllBtn = document.getElementById('replaceAllBtn');
    const navList = document.getElementById('navList');
    const toast = document.getElementById('toast');
    const stats = document.getElementById('stats');
    const footerStats = document.getElementById('footerStats');

    const editTab = document.getElementById('editTab');
    const previewTab = document.getElementById('previewTab');
    const splitTab = document.getElementById('splitTab');
    const editorPanel = document.getElementById('editorPanel');
    const previewPanel = document.getElementById('previewPanel');

    let currentFileName = 'science-draft.md';
    try { currentFileName = localStorage.getItem(FILENAME_KEY) || 'science-draft.md'; } catch (_error) { currentFileName = 'science-draft.md'; }
    let renderTimer = null;
    let toastTimer = null;
    let currentView = 'edit';
    let sourceMode = false;
    let wysiwygSyncLock = false;
    let documentLoadInProgress = false;
    const HISTORY_LIMIT = 50;
    let undoStack = [];
    let redoStack = [];
    let historyCurrentMarkdown = null;
    let historyTimer = null;
    let historyApplying = false;
    let lastScrollProgress = 0;
    let linkedScrollLock = false;
    let linkedScrollTimer = null;
    let currentMatchIndex = -1;
    let currentMatches = [];
    let embeddedImages = {};
    let nextImageNumber = 1;
    let savedWysiwygRange = null;
    let activeMathEditInput = null;
    let activeTableCell = null;
    let savedTableSourceSelection = null;
    const starterText = "# Welcome to Sciwrix\n\n**Sciwrix** is an offline-first Markdown and LaTeX editor for scientific and technical writing. Your document remains a normal `.md` file, and all editing stays on your device.\n\n> This starter document introduces the current Sciwrix interface. Delete it when you are ready to begin your own document.\n\n---\n\n## The ribbon\n\nSciwrix organises its controls into focused tabs:\n\n- **File** — create, open, save, save as, and print documents.\n- **Edit** — undo, redo, and find or replace text.\n- **Markdown** — paragraphs, headings, bold, italic, quotations, and lists.\n- **Insert** — images and horizontal rules.\n- **Maths** — inline maths, display maths, and the maths palette.\n- **Table** — insert and edit Markdown tables.\n- **View** — switch between Visual and Markdown views, navigate sections, choose the document style, and enter fullscreen.\n- **Help** — open the full guide and application information.\n\nThe toolbar changes when you select a different tab. Under **View**, you can also choose Icons, Labels, or Adaptive toolbar buttons.\n\n---\n\n## Visual and Markdown views\n\nUse **Visual** for normal writing and formatting. Use **Markdown** when you want direct control of the source text.\n\nBoth views edit the same document. There is no separate preview mode: the Visual editor is the rendered editing view.\n\nEditing is always continuous. On larger displays the document uses a comfortable page-like width with a subtle shadow. On mobile it expands to the screen width to maximise the writing area.\n\n---\n\n## Saving and printing\n\n- **Save** downloads the current Markdown file.\n- **Save As** lets you choose a filename and save as Markdown, rendered HTML, or LaTeX.\n- **Print** prints the document as it currently appears, or lets your browser save it as PDF.\n\nThe selected **Document Style** is used both on screen and when printing. It changes appearance only; it does not alter your Markdown source.\n\nAutosave is stored in this browser as a safety net. It is not a replacement for saving a real file.\n\n---\n\n## Headings and formatting\n\nUse headings to organise longer documents:\n\n```markdown\n# Document title\n## Main section\n### Subsection\n```\n\nYou can apply paragraph and heading styles from the **Markdown** tab, alongside bold, italic, block quotations, bulleted lists, and numbered lists.\n\n> Quotations and code blocks use neutral shading so the document remains clear without adding decorative colour.\n\n---\n\n## Maths\n\nInline maths stays within a sentence:\n\n\\(E = mc^2\\)\n\nDisplay maths is shown on its own line:\n\n\\[\nF = G\\frac{m_1m_2}{r^2}\n\\]\n\nUse the **Maths** tab to insert maths or open the maths palette. In Visual view, select a rendered formula to edit its LaTeX source, then choose **Done** to render it again.\n\n---\n\n## Tables\n\nUse **Table → Insert table**, choose the number of columns and rows, then type directly into the cells.\n\n| Quantity | Meaning | Relationship |\n|---|---|---|\n| \\(v\\) | wave speed | \\(v = f\\lambda\\) |\n| \\(f\\) | frequency | measured in hertz |\n| \\(\\lambda\\) | wavelength | measured in metres |\n\nWhen the cursor is inside a table, the Table tab provides controls for adding or removing rows and columns, or deleting the table.\n\n---\n\n## Code\n\nTriple backticks create a code block:\n\n```csharp\npublic static double KineticEnergy(double mass, double velocity)\n{\n    return 0.5 * mass * velocity * velocity;\n}\n```\n\nSciwrix works as a standalone HTML file, through GitHub Pages, and as an Android app.\n";

    function isFullscreenActive() {
      return !!(document.fullscreenElement || document.webkitFullscreenElement);
    }

    function updateFullscreenButton() {
      if (!fullscreenBtn) return;
      const active = isFullscreenActive();
      fullscreenBtn.textContent = active ? '×' : '⛶';
      fullscreenBtn.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
      fullscreenBtn.setAttribute('title', active ? 'Exit fullscreen' : 'Enter fullscreen');
    }

    async function toggleFullscreen() {
      const target = document.documentElement;

      try {
        if (!isFullscreenActive()) {
          if (target.requestFullscreen) {
            await target.requestFullscreen();
          } else if (target.webkitRequestFullscreen) {
            target.webkitRequestFullscreen();
          } else {
            showToast('Fullscreen is not supported in this browser view.');
            return;
          }
        } else {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        }
      } catch (error) {
        console.error(error);
        showToast('Fullscreen was blocked or is not available here.');
      } finally {
        setTimeout(updateFullscreenButton, 60);
      }
    }

    function setTheme(theme) {
      const isDark = theme === 'dark';
      document.body.classList.toggle('dark', isDark);
      darkBtn.textContent = isDark ? '☀' : '◐';
      safeSetStorage(THEME_KEY, theme, true);
    }

    function setFileName(name) {
      currentFileName = name || 'science-draft.md';
      safeSetStorage(FILENAME_KEY, currentFileName, true);
      fileNameLabel.textContent = currentFileName;
    }

    function updateStats(text) {
      const words = (text.trim().match(/\S+/g) || []).length;
      const chars = text.length;
      const statText = `${words.toLocaleString('en-GB')} words · ${chars.toLocaleString('en-GB')} chars`;
      if (stats) stats.textContent = statText;
      if (footerStats) footerStats.textContent = statText;
    }

    function safeGetStorage(key, fallback = '') {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch (error) {
        console.warn('Could not read local storage:', key, error);
        return fallback;
      }
    }

    function safeSetStorage(key, value, quiet = false) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.warn('Could not write local storage:', key, error);
        if (!quiet) showToast('Autosave storage is full or unavailable. Save the file manually.');
        return false;
      }
    }

    function safeRemoveStorage(key) {
      try { localStorage.removeItem(key); } catch (_error) {}
    }

    function resetBrokenAutosave() {
      safeRemoveStorage(STORAGE_KEY);
      safeRemoveStorage(IMAGE_MAP_KEY);
      editor.value = starterText;
      embeddedImages = {};
      nextImageNumber = 1;
      safeSetStorage(STORAGE_KEY, editor.value, true);
      setFileName('science-draft.md');
      showToast('Recovered by clearing the broken autosave draft.');
    }


    function loadImageMap() {
      try {
        const rawImageMap = safeGetStorage(IMAGE_MAP_KEY, '{}') || '{}';
        if (rawImageMap.length > 2500000) throw new Error('Stored image map is too large to restore safely.');
        embeddedImages = JSON.parse(rawImageMap) || {};
      } catch (_error) {
        embeddedImages = {};
      }

      nextImageNumber = 1;
      Object.keys(embeddedImages).forEach(key => {
        const match = /^image-(\d+)$/.exec(key);
        if (match) {
          nextImageNumber = Math.max(nextImageNumber, Number(match[1]) + 1);
        }
      });
    }

    function saveImageMap() {
      safeSetStorage(IMAGE_MAP_KEY, JSON.stringify(embeddedImages));
    }

    function makeImageId() {
      let id;
      do {
        id = `image-${nextImageNumber++}`;
      } while (embeddedImages[id]);
      return id;
    }

    function formatBytes(bytes) {
      if (!Number.isFinite(bytes)) return 'unknown size';
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function collapseEmbeddedImages(markdown) {
      return markdown.replace(/!\[([^\]]*)\]\((data:image\/(?:png|jpeg|jpg|webp|gif);base64,[^)]+)\)/gi, (_match, alt, dataUri) => {
        const existing = Object.entries(embeddedImages).find(([, value]) => value === dataUri);
        const id = existing ? existing[0] : makeImageId();
        embeddedImages[id] = dataUri;
        return `![${alt}](wysiwygmd-embed:${id})`;
      });
    }

    function expandEmbeddedImages(markdown) {
      return markdown.replace(/!\[([^\]]*)\]\(wysiwygmd-embed:(image-\d+)\)/g, (match, alt, id) => {
        const dataUri = embeddedImages[id];
        return dataUri ? `![${alt}](${dataUri})` : match;
      });
    }

    function forceWysiwygFromMarkdown({ resetScroll = false, focusStart = false } = {}) {
      if (!wysiwygEditor) return;

      // Loading a new file must be a hard rebuild.  A normal sync can be
      // skipped while the visual editor has focus, which made file opening
      // look as though the old document was still loaded.
      activeMathEditInput = null;
      savedWysiwygRange = null;
      hideTableTools();

      try {
        wysiwygSyncLock = true;
        wysiwygEditor.innerHTML = prepareWysiwygHtmlFromMarkdown(editor.value || '');
      } catch (error) {
        console.error('Could not rebuild visual editor:', error);
        wysiwygEditor.textContent = editor.value || '';
        showToast('Visual editor could not render this file. Try MD mode.');
      } finally {
        wysiwygSyncLock = false;
      }
      typesetWysiwygMath(wysiwygEditor);

      if (resetScroll) {
        wysiwygEditor.scrollTop = 0;
        preview.scrollTop = 0;
      } else {
        resyncLinkedScrollAfterRender(getScrollProgress(getActiveEditorScroller()));
      }

      if (focusStart && !sourceMode) {
        requestAnimationFrame(() => {
          try {
            wysiwygEditor.focus({ preventScroll: true });
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(wysiwygEditor);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            savedWysiwygRange = range.cloneRange();
          } catch (_error) {}
        });
      }
    }

    function setEditorMarkdown(markdown, { collapseImages = false, resetScroll = true } = {}) {
      loadImageMap();

      if (collapseImages) {
        editor.value = collapseEmbeddedImages(markdown);
        saveImageMap();
      } else {
        editor.value = markdown;
      }

      safeSetStorage(STORAGE_KEY, editor.value);
      updateNavigation();
      forceWysiwygFromMarkdown({ resetScroll, focusStart: false });
      scheduleRender();

      if (resetScroll) {
        editor.scrollTop = 0;
        try { editor.setSelectionRange(0, 0); } catch (_error) {}
      }
    }


    function insertEmbeddedImageFromFile(file) {
      if (!file) return;
      loadImageMap();

      if (!/^image\/(png|jpeg|jpg|webp|gif)$/i.test(file.type)) {
        showToast('Choose a PNG, JPEG, WebP, or GIF image.');
        return;
      }

      if (file.size > 3 * 1024 * 1024) {
        const ok = confirm(`This image is ${formatBytes(file.size)}. Embedding it will make the Markdown file large. Continue?`);
        if (!ok) return;
      }

      const reader = new FileReader();
      reader.onload = event => {
        const dataUri = String(event.target.result || '');
        if (!dataUri.startsWith('data:image/')) {
          showToast('Could not read image data.');
          return;
        }

        const defaultAlt = (file.name || 'embedded image').replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
        const alt = prompt('Image alt text:', defaultAlt) ?? defaultAlt;

        if (isVisualModeActive()) {
          const inserted = insertImageInWysiwyg(dataUri, alt || 'Image');
          if (inserted) {
            showToast(`Embedded ${file.name || 'image'}`);
            return;
          }
        }

        const markdownImage = collapseEmbeddedImages(`![${alt || 'Image'}](${dataUri})`);
        saveImageMap();
        replaceSelection(markdownImage, markdownImage.length, 0);
        showToast(`Embedded ${file.name || 'image'}`);
      };

      reader.onerror = () => showToast('Could not read image file.');
      reader.readAsDataURL(file);
    }

    function repairLegacyBareBracketMath(value) {
      // WysiwygMD v9 accidentally serialised visual maths as bare [ ... ] or
      // ( ... ) because JavaScript consumed the backslash in template literals.
      // Repair only standalone bracketed blocks that look like LaTeX maths.
      return String(value || '').replace(/(^|\n)\s*\[\s*([\s\S]*?)\s*\]\s*(?=\n|$)/g, (match, prefix, body) => {
        const inner = String(body || '').trim();
        const looksLikeLatex = /\\[a-zA-Z]+|[_^]\{|\\,|\{|\}|\^|_/.test(inner);
        const tooLarge = inner.length > 1200 || /\n\s*\n\s*\n/.test(inner);
        if (!inner || !looksLikeLatex || tooLarge) return match;
        return `${prefix}\\[\n${inner}\n\\]`;
      });
    }

    function protectMath(markdown) {
      const blocks = [];
      const inlines = [];
      const codeParts = [];

      const stashCode = value => {
        const index = codeParts.length;
        codeParts.push(value);
        return `\uE000CODEPART${index}\uE000`;
      };

      const restoreCode = value => value.replace(/\uE000CODEPART(\d+)\uE000/g, (_match, index) => codeParts[Number(index)] || '');

      // Do not scan Markdown code fences or inline code for maths delimiters.
      // Without this, explanatory examples such as `\( ... \)` get converted into
      // temporary maths placeholders and then appear as raw <span> markup in Preview.
      let protectedText = String(markdown || '')
        .replace(/(^|\n)(```|~~~)[^\n]*\n[\s\S]*?\n\2(?=\n|$)/g, match => stashCode(match))
        .replace(/`[^`\n]*`/g, match => stashCode(match));

      protectedText = repairLegacyBareBracketMath(protectedText);

      // Protect display maths using \[ ... \]
      protectedText = protectedText.replace(/\\\[([\s\S]*?)\\\]/g, (_match, equation) => {
        const index = blocks.length;
        blocks.push(equation.trim());
        return `\n\n\uE001MATHBLOCK${index}\uE001\n\n`;
      });

      // Protect display maths using $$ ... $$
      protectedText = protectedText.replace(/\$\$([\s\S]*?)\$\$/g, (_match, equation) => {
        const index = blocks.length;
        blocks.push(equation.trim());
        return `\n\n\uE001MATHBLOCK${index}\uE001\n\n`;
      });

      // Protect inline maths using \( ... \)
      protectedText = protectedText.replace(/\\\(([\s\S]*?)\\\)/g, (_match, equation) => {
        const index = inlines.length;
        inlines.push(equation.trim());
        return `\uE001MATHINLINE${index}\uE001`;
      });

      // Protect simple inline maths using $ ... $, while avoiding $$ blocks.
      protectedText = protectedText.replace(/(^|[^\\$])\$([^$\n]+?)\$/g, (_match, prefix, equation) => {
        const index = inlines.length;
        inlines.push(equation.trim());
        return `${prefix}\uE001MATHINLINE${index}\uE001`;
      });

      protectedText = restoreCode(protectedText);
      return { protectedText, blocks, inlines };
    }

    function restoreMath(container, blocks, inlines) {
      container.querySelectorAll('.math-block[data-math-index]').forEach(node => {
        const index = Number(node.getAttribute('data-math-index'));
        const equation = blocks[index] || '';
        node.textContent = `\\[\n${equation}\n\\]`;
      });

      container.querySelectorAll('.math-inline[data-math-index]').forEach(node => {
        const index = Number(node.getAttribute('data-math-index'));
        const equation = inlines[index] || '';
        node.textContent = `\\(${equation}\\)`;
      });
    }


    function setWysiwygMathNode(node, kind, latex) {
      const type = kind === 'block' ? 'block' : 'inline';
      const equation = String(latex || 'x').trim() || 'x';

      // Leaving this class in place stops renderMathNodeDirectly() from
      // re-typesetting the formula, which made maths stay as raw LaTeX after
      // pressing Done.  Always clear edit state before rebuilding the node.
      node.classList.remove('editing-math');
      node.classList.add('wysiwyg-math');
      node.classList.toggle('math-block', type === 'block');
      node.classList.toggle('math-inline', type !== 'block');
      node.setAttribute('data-wysiwygmd-math', type);
      node.setAttribute('data-latex', equation);
      node.setAttribute('contenteditable', 'false');
      node.setAttribute('tabindex', '0');
      node.setAttribute('role', 'button');
      node.setAttribute('aria-label', type === 'block' ? 'Block maths. Tap to edit.' : 'Inline maths. Tap to edit.');
      node.textContent = type === 'block' ? `\\[
${equation}
\\]` : `\\(${equation}\\)`;
    }

    function restoreMathForWysiwyg(container, blocks, inlines) {
      container.querySelectorAll('.math-block[data-math-index]').forEach(node => {
        const index = Number(node.getAttribute('data-math-index'));
        setWysiwygMathNode(node, 'block', blocks[index] || 'x');
      });

      container.querySelectorAll('.math-inline[data-math-index]').forEach(node => {
        const index = Number(node.getAttribute('data-math-index'));
        setWysiwygMathNode(node, 'inline', inlines[index] || 'x');
      });
    }


    function escapeHtml(value) {
      return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }

    function escapeAttribute(value) {
      return escapeHtml(String(value || ''));
    }

    function getHeadings(markdown) {
      const headings = [];
      const lines = markdown.split(/\r?\n/);
      let offset = 0;
      let inFence = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (/^\s*```/.test(line) || /^\s*~~~/.test(line)) {
          inFence = !inFence;
        }

        if (!inFence) {
          const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
          if (match) {
            headings.push({
              level: match[1].length,
              title: match[2].trim(),
              line: i + 1,
              offset
            });
          }
        }

        offset += line.length + 1;
      }

      return headings;
    }

    function updateNavigation(syncVisual = true) {
      // In WYSIWYG mode the hidden Markdown textarea is not always perfectly current
      // until we explicitly serialise the visual editor. Do that before scanning
      // headings, otherwise the navigator can look empty or jump to stale positions.
      if (syncVisual && isVisualModeActive()) {
        const editingMath = wysiwygEditor.querySelector('.editing-math');
        if (!editingMath) syncMarkdownFromWysiwyg();
      }

      const headings = getHeadings(editor.value);

      if (!headings.length) {
        navList.innerHTML = '<div class="nav-empty">No Markdown headings found. Use headings like <strong># Abstract</strong> or <strong>## 1. Introduction</strong>.</div>';
        return;
      }

      navList.innerHTML = headings.map((heading, index) => {
        heading.navIndex = index;
        const title = escapeHtml(heading.title);
        return `<button class="nav-item nav-level-${heading.level}" type="button" data-heading-index="${index}">${title}<br><span class="status">Line ${heading.line}</span></button>`;
      }).join('');

      navList.querySelectorAll('[data-heading-index]').forEach(button => {
        button.addEventListener('click', () => {
          const heading = headings[Number(button.getAttribute('data-heading-index'))];
          jumpToHeading(heading);
        });
      });
    }

    function openNavigation() {
      updateNavigation();
      drawerBackdrop.classList.add('show');
      navDrawer.classList.add('open');
      navDrawer.setAttribute('aria-hidden', 'false');
    }

    function closeNavigation() {
      drawerBackdrop.classList.remove('show');
      navDrawer.classList.remove('open');
      navDrawer.setAttribute('aria-hidden', 'true');
    }


    function openMathPalette() {
      if (isVisualModeActive()) saveWysiwygSelection();
      drawerBackdrop.classList.add('show');
      mathDrawer.classList.add('open');
      mathDrawer.setAttribute('aria-hidden', 'false');
    }

    function closeMathPalette() {
      mathDrawer.classList.remove('open');
      mathDrawer.setAttribute('aria-hidden', 'true');

      if (!navDrawer.classList.contains('open')) {
        drawerBackdrop.classList.remove('show');
      }
    }

    function closeAllDrawers() {
      closeNavigation();
      closeMathPalette();
      closeFindPanel();
      closeHelpPanel();
    }


    function openFindPanel() {
      drawerBackdrop.classList.add('show');
      findDrawer.classList.add('open');
      findDrawer.setAttribute('aria-hidden', 'false');
      switchView('edit');
      setTimeout(() => {
        findInput.focus();
        findInput.select();
        updateFindMatches(false);
      }, 80);
    }

    function closeFindPanel() {
      findDrawer.classList.remove('open');
      findDrawer.setAttribute('aria-hidden', 'true');

      const mathOpen = typeof mathDrawer !== 'undefined' && mathDrawer && mathDrawer.classList.contains('open');
      if (!navDrawer.classList.contains('open') && !mathOpen) {
        drawerBackdrop.classList.remove('show');
      }
    }

    function escapeRegExp(value) {
      return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function buildFindRegex() {
      const query = findInput.value;
      if (!query) return null;
      return new RegExp(escapeRegExp(query), caseSensitiveFind.checked ? 'g' : 'gi');
    }

    function updateFindMatches(keepIndex = true) {
      const regex = buildFindRegex();
      currentMatches = [];

      if (!regex) {
        currentMatchIndex = -1;
        findStatus.textContent = 'Enter text to search';
        return;
      }

      const text = editor.value;
      let match;
      while ((match = regex.exec(text)) !== null) {
        currentMatches.push({ start: match.index, end: match.index + match[0].length });
        if (match[0].length === 0) regex.lastIndex++;
      }

      if (!currentMatches.length) {
        currentMatchIndex = -1;
        findStatus.textContent = 'No matches';
        return;
      }

      if (!keepIndex || currentMatchIndex < 0 || currentMatchIndex >= currentMatches.length) {
        const cursor = editor.selectionStart;
        currentMatchIndex = currentMatches.findIndex(m => m.start >= cursor);
        if (currentMatchIndex === -1) currentMatchIndex = 0;
      }

      findStatus.textContent = `${currentMatchIndex + 1} of ${currentMatches.length} matches`;
    }

    function scrollEditorToSelection() {
      const before = editor.value.slice(0, editor.selectionStart);
      const lineNumber = (before.match(/\n/g) || []).length;
      const lineHeight = 23;
      editor.scrollTop = Math.max(0, lineNumber * lineHeight - 90);
    }

    function selectCurrentMatch() {
      if (!currentMatches.length || currentMatchIndex < 0) return;
      const match = currentMatches[currentMatchIndex];
      editor.focus();
      editor.setSelectionRange(match.start, match.end);
      scrollEditorToSelection();
      findStatus.textContent = `${currentMatchIndex + 1} of ${currentMatches.length} matches`;
    }

    function goToMatch(direction) {
      updateFindMatches(true);
      if (!currentMatches.length) return;

      currentMatchIndex += direction;
      if (currentMatchIndex < 0) currentMatchIndex = currentMatches.length - 1;
      if (currentMatchIndex >= currentMatches.length) currentMatchIndex = 0;

      selectCurrentMatch();
    }

    function replaceCurrentMatch() {
      updateFindMatches(true);
      if (!currentMatches.length || currentMatchIndex < 0) return;

      const replacement = replaceInput.value;
      const match = currentMatches[currentMatchIndex];

      editor.value = editor.value.slice(0, match.start) + replacement + editor.value.slice(match.end);
      editor.focus();
      editor.setSelectionRange(match.start, match.start + replacement.length);
      saveDraft();

      updateFindMatches(false);
      if (currentMatches.length) {
        selectCurrentMatch();
      } else {
        findStatus.textContent = 'No matches remaining';
      }
    }

    function replaceAllMatches() {
      const regex = buildFindRegex();
      if (!regex) {
        findStatus.textContent = 'Enter text to search';
        return;
      }

      updateFindMatches(false);
      const count = currentMatches.length;
      if (!count) {
        findStatus.textContent = 'No matches';
        return;
      }

      const confirmed = confirm(`Replace all ${count} matches?`);
      if (!confirmed) return;

      editor.value = editor.value.replace(regex, replaceInput.value);
      editor.focus();
      saveDraft();

      currentMatches = [];
      currentMatchIndex = -1;
      findStatus.textContent = `Replaced ${count} matches`;
      showToast(`Replaced ${count} matches`);
    }


    function openHelpPanel() {
      drawerBackdrop.classList.add('show');
      helpDrawer.classList.add('open');
      helpDrawer.setAttribute('aria-hidden', 'false');
    }

    function closeHelpPanel() {
      helpDrawer.classList.remove('open');
      helpDrawer.setAttribute('aria-hidden', 'true');

      const mathOpen = typeof mathDrawer !== 'undefined' && mathDrawer && mathDrawer.classList.contains('open');
      const findOpen = typeof findDrawer !== 'undefined' && findDrawer && findDrawer.classList.contains('open');

      if (!navDrawer.classList.contains('open') && !mathOpen && !findOpen) {
        drawerBackdrop.classList.remove('show');
      }
    }

    function isVisualModeActive() {
      return !sourceMode && wysiwygEditor && !wysiwygEditor.classList.contains('hidden');
    }

    function saveWysiwygSelection() {
      if (!wysiwygEditor) return;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const element = container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement;
      if (element && wysiwygEditor.contains(element)) {
        savedWysiwygRange = range.cloneRange();
      }
    }

    function restoreWysiwygSelection() {
      wysiwygEditor.focus();
      const selection = window.getSelection();
      if (!selection) return null;
      selection.removeAllRanges();

      if (savedWysiwygRange) {
        selection.addRange(savedWysiwygRange.cloneRange());
        return selection.getRangeAt(0);
      }

      const range = document.createRange();
      range.selectNodeContents(wysiwygEditor);
      range.collapse(false);
      selection.addRange(range);
      savedWysiwygRange = range.cloneRange();
      return range;
    }

    function getSelectedTextInWysiwyg() {
      if (!isVisualModeActive()) return '';
      const selection = window.getSelection();
      if (selection && selection.rangeCount) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const element = container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement;
        if (element && wysiwygEditor.contains(element)) return selection.toString();
      }
      if (savedWysiwygRange) return savedWysiwygRange.toString();
      return '';
    }

    function insertSnippetIntoActiveMath(snippet, selectStart = null, selectLength = null) {
      const input = activeMathEditInput;
      if (!input || !document.body.contains(input)) return false;

      const start = typeof input.selectionStart === 'number' ? input.selectionStart : input.value.length;
      const end = typeof input.selectionEnd === 'number' ? input.selectionEnd : start;
      const selected = input.value.slice(start, end);
      const insertText = selected && snippet.includes('x') ? snippet.replace('x', selected) : snippet;
      input.value = input.value.slice(0, start) + insertText + input.value.slice(end);

      let nextStart;
      let nextEnd;
      if (selectStart !== null && selectLength !== null && !selected) {
        nextStart = start + Number(selectStart);
        nextEnd = nextStart + Number(selectLength);
      } else {
        nextStart = nextEnd = start + insertText.length;
      }

      input.focus();
      try { input.setSelectionRange(nextStart, nextEnd); } catch (_error) {}

      const mathNode = input.closest('.wysiwyg-math[data-wysiwygmd-math]');
      if (mathNode) mathNode.setAttribute('data-latex', input.value.trim() || 'x');
      syncMarkdownFromWysiwyg();
      scheduleRender();
      return true;
    }

    function insertSnippetAtCursor(snippet, selectStart = null, selectLength = null) {
      if (insertSnippetIntoActiveMath(snippet, selectStart, selectLength)) return;

      if (isVisualModeActive()) {
        const selected = getSelectedTextInWysiwyg();
        const insertText = selected && snippet.includes('x')
          ? snippet.replace('x', selected)
          : snippet;
        insertMathInWysiwyg('inline', insertText);
        return;
      }

      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const before = editor.value.slice(0, start);
      const selected = editor.value.slice(start, end);
      const after = editor.value.slice(end);

      const insertText = selected && snippet.includes('x')
        ? snippet.replace('x', selected)
        : snippet;

      editor.value = before + insertText + after;
      editor.focus();

      if (selectStart !== null && selectLength !== null && !selected) {
        const s = start + Number(selectStart);
        editor.setSelectionRange(s, s + Number(selectLength));
      } else {
        const pos = start + insertText.length;
        editor.setSelectionRange(pos, pos);
      }

      saveDraft();
    }

    function wrapCurrentSelectionAsMath(kind) {
      if (isVisualModeActive()) {
        const selected = getSelectedTextInWysiwyg().trim() || 'x';
        if (kind === 'block') {
          insertTextInWysiwyg(`
\\[
${selected}
\\]
`, 3, selected.length);
        } else {
          insertTextInWysiwyg(`\\(${selected}\\)`, 2, selected.length);
        }
        return;
      }

      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const selected = editor.value.slice(start, end).trim() || 'x';

      if (kind === 'block') {
        replaceSelection(`
\\[
${selected}
\\]
`, 3, selected.length);
      } else {
        replaceSelection(`\\(${selected}\\)`, 2, selected.length);
      }
    }

    function findWysiwygHeadingElement(heading) {
      if (!wysiwygEditor || !heading) return null;
      const wantedLevel = Number(heading.level);
      const wantedTitle = String(heading.title || '').replace(/\s+/g, ' ').trim();
      let matchingOrdinal = 0;
      const allHeadings = getHeadings(editor.value);
      for (let i = 0; i < allHeadings.length; i++) {
        const item = allHeadings[i];
        if (i === heading.navIndex) break;
        if (Number(item.level) === wantedLevel && String(item.title || '').replace(/\s+/g, ' ').trim() === wantedTitle) {
          matchingOrdinal++;
        }
      }

      const selector = `h${wantedLevel}`;
      let seen = 0;
      for (const node of wysiwygEditor.querySelectorAll(selector)) {
        const title = (node.textContent || '').replace(/\s+/g, ' ').trim();
        if (title !== wantedTitle) continue;
        if (seen === matchingOrdinal) return node;
        seen++;
      }
      return null;
    }

    function jumpToHeading(heading) {
      closeNavigation();
      switchView('edit');

      if (!sourceMode && wysiwygEditor && !wysiwygEditor.classList.contains('hidden')) {
        // Jump in the visual editor rather than the hidden Markdown textarea.
        syncWysiwygFromMarkdown(true);
        requestAnimationFrame(() => {
          const node = findWysiwygHeadingElement(heading);
          if (node) {
            node.scrollIntoView({ block: 'start', behavior: 'smooth' });
            const range = document.createRange();
            range.selectNodeContents(node);
            range.collapse(true);
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
              savedWysiwygRange = range.cloneRange();
            }
            wysiwygEditor.focus({ preventScroll: true });
            showToast(`Jumped to ${heading.title}`);
          } else {
            showToast('Could not find that heading in the visual editor.');
          }
        });
        return;
      }

      const text = editor.value;
      const before = text.slice(0, heading.offset);
      const lineHeight = 23;
      const lineNumber = (before.match(/\n/g) || []).length;
      editor.focus();
      editor.setSelectionRange(heading.offset, heading.offset);
      editor.scrollTop = Math.max(0, lineNumber * lineHeight - 80);

      showToast(`Jumped to ${heading.title}`);
    }




    function setPreviewStyle(style) {
      const validStyles = ['default', 'physics', 'times', 'draft'];
      const selected = validStyles.includes(style) ? style : 'default';

      preview.classList.remove(
        'preview-style-default',
        'preview-style-physics',
        'preview-style-times',
        'preview-style-draft'
      );

      preview.classList.add(`preview-style-${selected}`);
      if (wysiwygEditor) {
        wysiwygEditor.classList.remove('preview-style-default', 'preview-style-physics', 'preview-style-times', 'preview-style-draft');
        wysiwygEditor.classList.add(`preview-style-${selected}`);
      }
      previewStyle.value = selected;
      safeSetStorage(PREVIEW_STYLE_KEY, selected, true);
    }

    function slugifyHeading(value) {
      return value
        .toLowerCase()
        .replace(/<[^>]+>/g, '')
        .replace(/&[a-z0-9#]+;/gi, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-') || 'section';
    }

    function safeUrl(value) {
      const url = String(value || '').trim();
      if (/^(https?:|mailto:|tel:|data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,|data:image\/(png|jpeg|jpg|webp|gif|svg\+xml),)/i.test(url)) {
        return url.replace(/"/g, '%22');
      }
      return '';
    }

    const HTML_COMPAT_TAGS = [
      'a', 'abbr', 'b', 'blockquote', 'br', 'caption', 'cite', 'code', 'col', 'colgroup',
      'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'kbd', 'li', 'mark',
      'ol', 'p', 'pre', 's', 'samp', 'small', 'span', 'strong', 'sub', 'summary',
      'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul', 'var'
    ];

    const HTML_COMPAT_ATTRS = [
      'abbr', 'align', 'alt', 'aria-hidden', 'class', 'colspan', 'height', 'href', 'id',
      'rel', 'rowspan', 'scope', 'src', 'style', 'target', 'title', 'width'
    ];

    const HTML_COMPAT_ALLOWED_STYLES = new Set([
      'text-align', 'break-before', 'break-after', 'page-break-before', 'page-break-after',
      'width', 'height', 'max-width', 'min-width', 'color', 'background-color',
      'font-size', 'font-weight', 'font-style', 'text-decoration', 'vertical-align',
      'margin', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom',
      'padding', 'padding-left', 'padding-right', 'padding-top', 'padding-bottom'
    ]);

    function isPageBreakHtml(value) {
      const raw = String(value || '').trim();
      // Escape the opening angle bracket so HTML-aware JavaScript parsers do not
      // interpret the comment marker as a legacy line comment inside this script.
      if (/^\x3c!--\s*(?:page\s*break|pagebreak|pb)\s*-->$/i.test(raw)) return true;
      if (/class\s*=\s*['"][^'"]*(?:page-break|pagebreak|wysiwygmd-page-break|marktex-page-break)[^'"]*['"]/i.test(raw)) return true;
      if (/style\s*=\s*['"][^'"]*(?:page-break-before\s*:\s*always|break-before\s*:\s*page|page-break-after\s*:\s*always|break-after\s*:\s*page)[^'"]*['"]/i.test(raw)) return true;
      return false;
    }

    function cleanAllowedStyles(root) {
      root.querySelectorAll('[style]').forEach(node => {
        const declarations = String(node.getAttribute('style') || '').split(';');
        const safe = [];
        declarations.forEach(part => {
          const pieces = part.split(':');
          if (pieces.length < 2) return;
          const prop = pieces.shift().trim().toLowerCase();
          const value = pieces.join(':').trim();
          if (!HTML_COMPAT_ALLOWED_STYLES.has(prop)) return;
          if (/url\s*\(|expression\s*\(|javascript\s*:|@import|behavior\s*:/i.test(value)) return;
          safe.push(`${prop}: ${value}`);
        });
        if (safe.length) node.setAttribute('style', safe.join('; '));
        else node.removeAttribute('style');
      });
    }

    function normaliseSanitisedHtml(html) {
      const wrapper = document.createElement('template');
      wrapper.innerHTML = html;

      wrapper.content.querySelectorAll('a[href]').forEach(link => {
        const href = safeUrl(link.getAttribute('href'));
        if (!href) link.removeAttribute('href');
        else {
          link.setAttribute('href', href);
          link.setAttribute('rel', 'noopener noreferrer');
          if (!link.getAttribute('target')) link.setAttribute('target', '_blank');
        }
      });

      wrapper.content.querySelectorAll('img[src]').forEach(img => {
        const src = safeUrl(img.getAttribute('src'));
        if (!src) img.removeAttribute('src');
        else img.setAttribute('src', src);
      });

      cleanAllowedStyles(wrapper.content);
      return wrapper.innerHTML;
    }

    function sanitiseHtmlFragment(html) {
      if (isPageBreakHtml(html)) return '<div class="wysiwygmd-page-break" aria-hidden="true"></div>';

      if (!window.DOMPurify || typeof DOMPurify.sanitize !== 'function') {
        return escapeHtml(String(html || ''));
      }

      const clean = DOMPurify.sanitize(String(html || ''), {
        ALLOWED_TAGS: HTML_COMPAT_TAGS,
        ALLOWED_ATTR: HTML_COMPAT_ATTRS,
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'option', 'link', 'meta'],
        FORBID_ATTR: ['srcset'],
        RETURN_TRUSTED_TYPE: false
      });
      return normaliseSanitisedHtml(clean);
    }

    function sanitiseRenderedHtml(html) {
      if (!window.DOMPurify || typeof DOMPurify.sanitize !== 'function') return String(html || '');
      const clean = DOMPurify.sanitize(String(html || ''), {
        ALLOWED_TAGS: HTML_COMPAT_TAGS.concat(['mjx-container', 'svg', 'path', 'g', 'defs', 'use', 'rect', 'text']),
        ALLOWED_ATTR: HTML_COMPAT_ATTRS.concat(['data-math-index', 'jax', 'display', 'viewBox', 'd', 'x', 'y', 'role', 'focusable', 'xmlns', 'aria-label']),
        ALLOW_DATA_ATTR: true,
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'option', 'link', 'meta'],
        FORBID_ATTR: ['srcset'],
        RETURN_TRUSTED_TYPE: false
      });
      return normaliseSanitisedHtml(clean);
    }

    function protectInlineHtml(value) {
      const htmlParts = [];
      const stashHtml = fragment => {
        const clean = sanitiseHtmlFragment(fragment);
        if (!clean) return escapeHtml(fragment);
        const index = htmlParts.length;
        htmlParts.push(clean);
        return `\uE002HTMLPART${index}\uE002`;
      };
      let text = String(value || '');
      text = text.replace(/\x3c!--\s*(?:page\s*break|pagebreak|pb)\s*-->/gi, match => stashHtml(match));
      text = text.replace(/<\/?(?:a|abbr|b|br|cite|code|del|dfn|em|i|img|kbd|mark|s|samp|small|span|strong|sub|sup|u|var)(?:\s+[^<>]*?)?\s*\/?>/gi, match => stashHtml(match));
      return { text, htmlParts };
    }

    function restoreInlineHtml(value, htmlParts) {
      return value.replace(/\uE002HTMLPART(\d+)\uE002/g, (_match, index) => htmlParts[Number(index)] || '');
    }

    function isRawHtmlBlockStart(line) {
      return /^\s*\x3c!--\s*(?:page\s*break|pagebreak|pb)\s*-->\s*$/i.test(line)
        || /^\s*<\/?(?:div|p|table|thead|tbody|tfoot|tr|td|th|details|summary|figure|figcaption|h[1-6]|img|br|hr|ul|ol|li|blockquote)(?:\s+[^<>]*?)?\s*\/?>/i.test(line);
    }

    function collectRawHtmlBlock(lines, startIndex) {
      const collected = [];
      let i = startIndex;
      const first = lines[startIndex] || '';
      const tagMatch = /^\s*<([a-z][a-z0-9-]*)\b/i.exec(first);
      const tag = tagMatch ? tagMatch[1].toLowerCase() : '';
      while (i < lines.length) {
        const line = lines[i];
        collected.push(line);
        i++;
        if (/^\s*\x3c!--\s*(?:page\s*break|pagebreak|pb)\s*-->\s*$/i.test(line)) break;
        if (tag && new RegExp(`</${tag}>`, 'i').test(line)) break;
        if (!tag || /^\s*<(?:br|hr|img)\b/i.test(first)) break;
        if (i < lines.length && !(lines[i] || '').trim()) break;
      }
      return { html: sanitiseHtmlFragment(collected.join('\n')), nextIndex: i };
    }

    function renderInlineMarkdown(value) {
      const protectedInline = protectInlineHtml(value || '');
      let html = escapeHtml(protectedInline.text || '');

      const codeSpans = [];
      html = html.replace(/`([^`]+?)`/g, (_match, code) => {
        const index = codeSpans.length;
        codeSpans.push(`<code>${code}</code>`);
        return `\u0000CODE${index}\u0000`;
      });

      const imageFallbacks = [];
      html = html.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g, (_match, alt, url) => {
        const expandedUrl = /^wysiwygmd-embed:image-\d+$/i.test(url) ? (embeddedImages[url.replace(/^wysiwygmd-embed:/i, '')] || '') : url;
        const safe = safeUrl(expandedUrl);
        if (safe) return `<img src="${safe}" alt="${escapeHtml(alt)}">`;
        const index = imageFallbacks.length;
        imageFallbacks.push(`<span class="missing-image">[missing embedded image: ${escapeHtml(alt || url)}]</span>`);
        return `\u0000IMAGEFALLBACK${index}\u0000`;
      });

      html = html.replace(/\[([^\]]+)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g, (_match, label, url) => {
        const safe = safeUrl(url);
        return safe ? `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>` : label;
      });

      html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/__([^_]+?)__/g, '<strong>$1</strong>');
      html = html.replace(/(^|[^*])\*([^*\n]+?)\*/g, '$1<em>$2</em>');
      html = html.replace(/(^|[^_])_([^_\n]+?)_/g, '$1<em>$2</em>');
      html = html.replace(/~~([^~]+?)~~/g, '<del>$1</del>');
      html = html.replace(/\u0000IMAGEFALLBACK(\d+)\u0000/g, (_match, index) => imageFallbacks[Number(index)] || '');

      html = html.replace(/\u0000CODE(\d+)\u0000/g, (_match, index) => codeSpans[Number(index)] || '');
      html = html.replace(/\uE001MATHINLINE(\d+)\uE001/g, (_match, index) => `<span class="math-inline" data-math-index="${index}"></span>`);
      html = restoreInlineHtml(html, protectedInline.htmlParts);
      return html;
    }

    function renderListItem(itemLines) {
      const text = itemLines.join('\n').trimEnd();
      const hasBlockContent = /\n\s*\n|\n\s*(#{1,6}\s+|```|~~~|>\s?|[-+*]\s+|\d+[.)]\s+|\uE001MATHBLOCK\d+\uE001|\|)/.test(text);

      if (!hasBlockContent) {
        return renderInlineMarkdown(text.trim());
      }

      return simpleMarkdownToHtml(text);
    }

    function parseListBlock(lines, startIndex, ordered) {
      const itemRegex = ordered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-+*]\s+(.*)$/;
      const otherListRegex = ordered ? /^\s*[-+*]\s+/ : /^\s*\d+[.)]\s+/;

      if (!itemRegex.test(lines[startIndex] || '')) {
        return null;
      }

      const items = [];
      let i = startIndex;

      while (i < lines.length) {
        const first = itemRegex.exec(lines[i] || '');
        if (!first) break;

        const itemLines = [first[1]];
        i++;

        while (i < lines.length) {
          const current = lines[i] || '';
          const next = lines[i + 1] || '';

          if (itemRegex.test(current)) break;
          if (otherListRegex.test(current) && !/^\s{2,}/.test(current)) break;

          if (!current.trim()) {
            // Blank lines inside list items are allowed when the next meaningful
            // line is still part of the item, such as an indented display-maths
            // block. protectMath() may add an extra blank line around maths, so
            // look past consecutive blank lines rather than only checking the
            // immediate next line.
            let lookAhead = i + 1;
            while (lookAhead < lines.length && !(lines[lookAhead] || '').trim()) {
              lookAhead++;
            }
            const following = lines[lookAhead] || '';

            if (/^\s{2,}\S/.test(following) || /^\uE001MATHBLOCK\d+\uE001$/.test(following.trim()) || itemRegex.test(following)) {
              itemLines.push('');
              i++;
              continue;
            }
            break;
          }

          if (/^\uE001MATHBLOCK\d+\uE001$/.test(current.trim())) {
            itemLines.push(current.trim());
            i++;
            continue;
          }

          if (/^\s{2,}\S/.test(current)) {
            itemLines.push(current.replace(/^\s{2,4}/, ''));
            i++;
            continue;
          }

          break;
        }

        items.push(itemLines);

        if (i >= lines.length || !itemRegex.test(lines[i] || '')) break;
      }

      const tag = ordered ? 'ol' : 'ul';
      const html = `<${tag}>${items.map(item => `<li>${renderListItem(item)}</li>`).join('')}</${tag}>`;
      return { html, nextIndex: i };
    }

    function parseTable(lines, startIndex) {
      const header = lines[startIndex];
      const divider = lines[startIndex + 1] || '';
      if (!/^\s*\|?.+\|.+\|?\s*$/.test(header) || !/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(divider)) {
        return null;
      }

      const splitRow = row => {
        const source = row.trim().replace(/^\|/, '').replace(/\|$/, '');
        const cells = [];
        let current = '';
        for (let index = 0; index < source.length; index++) {
          const char = source[index];
          if (char === '\\' && source[index + 1] === '|') {
            current += '|';
            index++;
          } else if (char === '|') {
            cells.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        cells.push(current.trim());
        return cells;
      };
      const headers = splitRow(header);
      const rows = [];
      let i = startIndex + 2;
      while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim()) {
        rows.push(splitRow(lines[i]));
        i++;
      }

      const thead = `<thead><tr>${headers.map(cell => `<th>${renderInlineMarkdown(cell)}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${rows.map(row => `<tr>${headers.map((_h, idx) => `<td>${renderInlineMarkdown(row[idx] || '')}</td>`).join('')}</tr>`).join('')}</tbody>`;
      return { html: `<table>${thead}${tbody}</table>`, nextIndex: i };
    }

    function simpleMarkdownToHtml(markdown) {
      const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
      const out = [];
      let i = 0;

      const closeParagraph = paragraph => {
        if (paragraph.length) {
          out.push(`<p>${renderInlineMarkdown(paragraph.join(' ').trim())}</p>`);
          paragraph.length = 0;
        }
      };

      const paragraph = [];

      while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
          closeParagraph(paragraph);
          i++;
          continue;
        }

        if (isRawHtmlBlockStart(line)) {
          closeParagraph(paragraph);
          const rawHtmlBlock = collectRawHtmlBlock(lines, i);
          out.push(rawHtmlBlock.html);
          i = rawHtmlBlock.nextIndex;
          continue;
        }

        const mathBlockMarker = /^\uE001MATHBLOCK(\d+)\uE001$/.exec(trimmed);
        if (mathBlockMarker) {
          closeParagraph(paragraph);
          out.push(`<div class="math-block" data-math-index="${mathBlockMarker[1]}"></div>`);
          i++;
          continue;
        }

        const fence = /^\s*(```|~~~)\s*([^`]*)$/.exec(line);
        if (fence) {
          closeParagraph(paragraph);
          const marker = fence[1];
          const lang = (fence[2] || '').trim().replace(/[^a-z0-9_-]/gi, '');
          i++;
          const code = [];
          while (i < lines.length && !new RegExp('^\\s*' + marker).test(lines[i])) {
            code.push(lines[i]);
            i++;
          }
          if (i < lines.length) i++;
          out.push(`<pre><code${lang ? ` class="language-${lang}"` : ''}>${escapeHtml(code.join('\n'))}</code></pre>`);
          continue;
        }

        const table = parseTable(lines, i);
        if (table) {
          closeParagraph(paragraph);
          out.push(table.html);
          i = table.nextIndex;
          continue;
        }

        const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
        if (heading) {
          closeParagraph(paragraph);
          const level = heading[1].length;
          const content = renderInlineMarkdown(heading[2]);
          const id = slugifyHeading(heading[2]);
          out.push(`<h${level} id="${id}">${content}</h${level}>`);
          i++;
          continue;
        }

        if (/^\s*([-*_])\s*\1\s*\1(?:\s*\1)*\s*$/.test(line)) {
          closeParagraph(paragraph);
          out.push('<hr>');
          i++;
          continue;
        }

        if (/^\s*>\s?/.test(line)) {
          closeParagraph(paragraph);
          const quote = [];
          while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
            quote.push(lines[i].replace(/^\s*>\s?/, ''));
            i++;
          }
          out.push(`<blockquote>${simpleMarkdownToHtml(quote.join('\n'))}</blockquote>`);
          continue;
        }

        const bulletList = parseListBlock(lines, i, false);
        if (bulletList) {
          closeParagraph(paragraph);
          out.push(bulletList.html);
          i = bulletList.nextIndex;
          continue;
        }

        const orderedList = parseListBlock(lines, i, true);
        if (orderedList) {
          closeParagraph(paragraph);
          out.push(orderedList.html);
          i = orderedList.nextIndex;
          continue;
        }

        paragraph.push(line);
        i++;
      }

      closeParagraph(paragraph);
      return out.join('\n');
    }


    function markSubmissionStructure(container) {
      container.querySelectorAll('.appendix-page-break').forEach(marker => marker.remove());

      container.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
        const text = (heading.textContent || '').trim();
        const isAppendix = /^Appendix\s+[A-Z0-9]/i.test(text);
        const isReferences = /^References$/i.test(text);
        const needsSciencePaperBreak = isAppendix || isReferences;

        heading.classList.toggle('appendix-heading', isAppendix);
        heading.classList.toggle('backmatter-heading', isReferences);

        if (needsSciencePaperBreak && heading.parentNode) {
          const marker = document.createElement('div');
          marker.className = 'appendix-page-break';
          marker.setAttribute('aria-hidden', 'true');
          heading.parentNode.insertBefore(marker, heading);
        }
      });
    }



    function prepareWysiwygHtmlFromMarkdown(markdown) {
      const raw = expandEmbeddedImages(markdown || '');
      const protected = protectMath(raw);
      const holder = document.createElement('div');
      holder.innerHTML = sanitiseRenderedHtml(simpleMarkdownToHtml(protected.protectedText));
      restoreMathForWysiwyg(holder, protected.blocks, protected.inlines);
      return holder.innerHTML;
    }

    function renderMathNodeDirectly(node) {
      if (!node || node.classList.contains('editing-math')) return Promise.resolve();

      const latex = node.getAttribute('data-latex') || '';
      const display = (node.getAttribute('data-wysiwygmd-math') || node.getAttribute('data-math-display')) === 'block';
      const fallback = display ? `\[
${latex}
\]` : `\(${latex}\)`;

      if (!window.MathJax || typeof MathJax.tex2svgPromise !== 'function') {
        node.textContent = fallback;
        return Promise.resolve();
      }

      return MathJax.tex2svgPromise(latex || 'x', { display })
        .then(svg => {
          node.innerHTML = '';
          node.appendChild(svg);
        })
        .catch(error => {
          console.error(error);
          node.textContent = fallback;
        });
    }

    function typesetWysiwygMath(target = wysiwygEditor) {
      if (!target) return;

      const root = target.nodeType === Node.ELEMENT_NODE ? target : wysiwygEditor;
      const nodes = root.matches && root.matches('.wysiwyg-math, .math-inline[data-latex], .math-block[data-latex]')
        ? [root]
        : Array.from(root.querySelectorAll('.wysiwyg-math, .math-inline[data-latex], .math-block[data-latex]'));

      if (nodes.length) {
        Promise.all(nodes.map(renderMathNodeDirectly)).catch(error => {
          console.error(error);
          showToast('Maths preview had a rendering issue.');
        });
        return;
      }

      if (!window.MathJax?.typesetPromise) return;
      try {
        MathJax.typesetClear([root]);
        MathJax.typesetPromise([root]).catch(error => {
          console.error(error);
          showToast('Maths preview had a rendering issue.');
        });
      } catch (error) {
        console.error(error);
      }
    }

    function syncWysiwygFromMarkdown(force = false) {
      if (!wysiwygEditor || wysiwygSyncLock) return;
      if (!force && document.activeElement === wysiwygEditor) return;
      hideTableTools();
      try {
        wysiwygSyncLock = true;
        wysiwygEditor.innerHTML = prepareWysiwygHtmlFromMarkdown(editor.value);
      } catch (error) {
        console.error('Could not sync visual editor:', error);
        wysiwygEditor.textContent = editor.value || '';
        showToast('Visual editor could not render this section. Try MD mode.');
      } finally {
        wysiwygSyncLock = false;
      }
      typesetWysiwygMath(wysiwygEditor);
    }

    function textOf(node) {
      return (node.textContent || '').replace(/\u00a0/g, ' ');
    }

    function inlineMarkdownFromNode(node) {
      if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || '';
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const mathKind = node.getAttribute('data-wysiwygmd-math');
      if (mathKind) {
        const latex = node.getAttribute('data-latex') || '';
        return mathKind === 'block' ? `\\[
${latex}
\\]` : `\\(${latex}\\)`;
      }
      const tag = node.tagName.toLowerCase();
      if (tag === 'br') return '\n';
      if (tag === 'img') {
        const alt = node.getAttribute('alt') || '';
        const src = node.getAttribute('src') || '';
        if (!src) return '';
        if (/^data:image\//i.test(src)) {
          const collapsed = collapseEmbeddedImages(`![${alt}](${src})`);
          saveImageMap();
          return collapsed;
        }
        return `![${alt}](${src})`;
      }
      if (tag === 'a') {
        const href = node.getAttribute('href') || '';
        const label = Array.from(node.childNodes).map(inlineMarkdownFromNode).join('') || href;
        return href ? `[${label}](${href})` : label;
      }
      const inner = Array.from(node.childNodes).map(inlineMarkdownFromNode).join('');
      if (tag === 'strong' || tag === 'b') return `**${inner}**`;
      if (tag === 'em' || tag === 'i') return `*${inner}*`;
      if (tag === 'code') return '`' + inner.replace(/`/g, '\\`') + '`';
      if (tag === 'del' || tag === 's') return `~~${inner}~~`;
      return inner;
    }

    function blockMarkdownFromNode(node, listPrefix = '') {
      if (node.nodeType === Node.TEXT_NODE) return textOf(node).trim();
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const mathKind = node.getAttribute('data-wysiwygmd-math');
      if (mathKind) {
        const latex = node.getAttribute('data-latex') || '';
        return mathKind === 'block' ? `\\[
${latex}
\\]` : `\\(${latex}\\)`;
      }
      const tag = node.tagName.toLowerCase();
      const inline = () => Array.from(node.childNodes).map(inlineMarkdownFromNode).join('').trim();

      if (/^h[1-6]$/.test(tag)) return '#'.repeat(Number(tag.charAt(1))) + ' ' + inline();
      if (tag === 'p' || tag === 'div') return inline();
      if (tag === 'hr') return '---';
      if (tag === 'pre') return '```\n' + textOf(node).trimEnd() + '\n```';
      if (tag === 'blockquote') {
        return Array.from(node.childNodes).map(child => blockMarkdownFromNode(child)).join('\n\n').split('\n').map(line => line ? '> ' + line : '>').join('\n');
      }
      if (tag === 'ul' || tag === 'ol') {
        let i = 1;
        return Array.from(node.children).filter(child => child.tagName && child.tagName.toLowerCase() === 'li').map(li => {
          const bullet = tag === 'ol' ? `${i++}. ` : '- ';
          const body = Array.from(li.childNodes).map(child => {
            const childTag = child.nodeType === Node.ELEMENT_NODE ? child.tagName.toLowerCase() : '';
            return childTag === 'ul' || childTag === 'ol' ? '\n' + blockMarkdownFromNode(child).split('\n').map(x => '  ' + x).join('\n') : inlineMarkdownFromNode(child);
          }).join('').trim();
          return bullet + body;
        }).join('\n');
      }
      if (tag === 'table') {
        const cellMarkdown = cell => {
          const raw = Array.from(cell.childNodes).map(inlineMarkdownFromNode).join('');
          if (!raw.replace(/\s/g, '')) return '';
          return raw.replace(/\r?\n/g, '<br>').trim().replace(/\|/g, '\\|');
        };
        const rows = Array.from(node.rows || []).map(tr => Array.from(tr.cells || []).map(cellMarkdown));
        if (!rows.length) return '';
        const width = Math.max(...rows.map(row => row.length));
        const normalise = row => Array.from({ length: width }, (_unused, index) => row[index] || '');
        const head = normalise(rows[0]);
        const sep = head.map(() => '---');
        return [head, sep, ...rows.slice(1).map(normalise)].map(row => '| ' + row.join(' | ') + ' |').join('\n');
      }
      if (tag === 'img') return inlineMarkdownFromNode(node);
      return inline();
    }

    function markdownFromWysiwyg() {
      const blocks = Array.from(wysiwygEditor.childNodes).map(node => blockMarkdownFromNode(node)).filter(Boolean);
      return blocks.join('\n\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
    }

    function syncMarkdownFromWysiwyg() {
      if (!wysiwygEditor || wysiwygSyncLock || documentLoadInProgress) return;
      wysiwygSyncLock = true;
      editor.value = markdownFromWysiwyg();
      wysiwygSyncLock = false;
      saveDraft(false);
    }

    function hideTableTools() {
      if (activeTableCell) activeTableCell.classList.remove('table-cell-active');
      activeTableCell = null;
      if (tableTools) {
        tableTools.classList.remove('show');
        tableTools.setAttribute('aria-hidden', 'true');
      }
    }

    function tableCellFromSelection() {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return null;
      let node = selection.anchorNode;
      if (!node) return null;
      if (node.nodeType !== Node.ELEMENT_NODE) node = node.parentElement;
      const cell = node && node.closest ? node.closest('th, td') : null;
      return cell && wysiwygEditor.contains(cell) ? cell : null;
    }

    function setActiveTableCell(cell) {
      if (!cell || !wysiwygEditor.contains(cell)) {
        hideTableTools();
        return;
      }
      if (activeTableCell && activeTableCell !== cell) activeTableCell.classList.remove('table-cell-active');
      activeTableCell = cell;
      activeTableCell.classList.add('table-cell-active');
      tableTools.classList.add('show');
      tableTools.setAttribute('aria-hidden', 'false');

      const table = cell.closest('table');
      const row = cell.closest('tr');
      const deleteRowButton = tableTools.querySelector('[data-table-action="deleteRow"]');
      const deleteColumnButton = tableTools.querySelector('[data-table-action="deleteColumn"]');
      if (deleteRowButton) {
        const isHeader = !!row.closest('thead') || Array.from(row.cells).every(item => item.tagName.toLowerCase() === 'th');
        deleteRowButton.disabled = isHeader;
        deleteRowButton.title = isHeader ? 'The Markdown heading row cannot be deleted' : 'Delete this row';
      }
      if (deleteColumnButton) deleteColumnButton.disabled = !table || (table.rows[0]?.cells.length || 0) <= 1;
    }

    function focusTableCell(cell, selectContents = false) {
      if (!cell) return;
      wysiwygEditor.focus({ preventScroll: true });
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(cell);
      if (!selectContents) range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      savedWysiwygRange = range.cloneRange();
      setActiveTableCell(cell);
      cell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    function createVisualTable(dataRows, columns) {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      for (let column = 0; column < columns; column++) {
        const th = document.createElement('th');
        th.textContent = `Heading ${column + 1}`;
        headerRow.appendChild(th);
      }
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      for (let row = 0; row < dataRows; row++) {
        const tr = document.createElement('tr');
        for (let column = 0; column < columns; column++) {
          const td = document.createElement('td');
          td.appendChild(document.createElement('br'));
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      return table;
    }

    function insertVisualTable(dataRows, columns) {
      const range = restoreWysiwygSelection();
      if (!range) return;
      range.deleteContents();

      const table = createVisualTable(dataRows, columns);
      const trailingParagraph = document.createElement('p');
      trailingParagraph.appendChild(document.createElement('br'));

      let directChild = range.startContainer.nodeType === Node.ELEMENT_NODE
        ? range.startContainer
        : range.startContainer.parentElement;
      while (directChild && directChild.parentNode !== wysiwygEditor) directChild = directChild.parentElement;

      const isEmptyBlock = directChild
        && /^(P|DIV)$/i.test(directChild.tagName || '')
        && !(directChild.textContent || '').trim()
        && !directChild.querySelector('img, table, .wysiwyg-math');

      if (isEmptyBlock) {
        directChild.replaceWith(table, trailingParagraph);
      } else if (directChild && directChild.parentNode === wysiwygEditor) {
        directChild.after(table, trailingParagraph);
      } else {
        wysiwygEditor.append(table, trailingParagraph);
      }

      syncMarkdownFromWysiwyg();
      scheduleRender();
      focusTableCell(table.rows[0]?.cells[0], true);
      showToast(`Inserted ${columns}-column table`);
    }

    function markdownTableText(dataRows, columns) {
      const header = Array.from({ length: columns }, (_unused, index) => `Heading ${index + 1}`);
      const divider = Array.from({ length: columns }, () => '---');
      const row = Array.from({ length: columns }, () => '');
      return [header, divider, ...Array.from({ length: dataRows }, () => row)]
        .map(cells => '| ' + cells.join(' | ') + ' |')
        .join('\n');
    }

    function openTableDialog() {
      if (isVisualModeActive()) {
        saveWysiwygSelection();
        savedTableSourceSelection = null;
      } else {
        savedTableSourceSelection = { start: editor.selectionStart, end: editor.selectionEnd };
      }
      tableColumns.value = '3';
      tableRows.value = '2';
      if (typeof tableDialog.showModal === 'function') {
        tableDialog.showModal();
        setTimeout(() => tableColumns.focus(), 0);
      } else {
        const columns = Math.max(1, Math.min(12, Number(prompt('Number of columns', '3')) || 3));
        const rows = Math.max(1, Math.min(30, Number(prompt('Number of data rows', '2')) || 2));
        if (isVisualModeActive()) {
          insertVisualTable(rows, columns);
        } else {
          if (savedTableSourceSelection) {
            editor.focus();
            editor.setSelectionRange(savedTableSourceSelection.start, savedTableSourceSelection.end);
          }
          replaceSelection('\n\n' + markdownTableText(rows, columns) + '\n\n', 2, 0);
          savedTableSourceSelection = null;
        }
      }
    }

    function addTableRowBelow(cell = activeTableCell) {
      const table = cell?.closest('table');
      if (!table) return;
      const columnCount = table.rows[0]?.cells.length || 1;
      const newRow = document.createElement('tr');
      for (let column = 0; column < columnCount; column++) {
        const td = document.createElement('td');
        td.appendChild(document.createElement('br'));
        newRow.appendChild(td);
      }
      const currentRow = cell.closest('tr');
      const tbody = table.tBodies[0] || table.appendChild(document.createElement('tbody'));
      if (currentRow.closest('thead')) tbody.insertBefore(newRow, tbody.firstChild);
      else currentRow.after(newRow);
      syncMarkdownFromWysiwyg();
      scheduleRender();
      focusTableCell(newRow.cells[Math.min(cell.cellIndex, columnCount - 1)]);
    }

    function deleteActiveTableRow() {
      const cell = activeTableCell;
      const table = cell?.closest('table');
      const row = cell?.closest('tr');
      if (!table || !row || row.closest('thead')) return;
      const columnIndex = cell.cellIndex;
      const nextRow = row.nextElementSibling || row.previousElementSibling || table.rows[0];
      row.remove();
      syncMarkdownFromWysiwyg();
      scheduleRender();
      focusTableCell(nextRow?.cells[Math.min(columnIndex, (nextRow?.cells.length || 1) - 1)] || table.rows[0]?.cells[0]);
    }

    function addTableColumnRight() {
      const cell = activeTableCell;
      const table = cell?.closest('table');
      if (!table) return;
      const insertIndex = cell.cellIndex + 1;
      Array.from(table.rows).forEach((row, rowIndex) => {
        const newCell = document.createElement(rowIndex === 0 ? 'th' : 'td');
        if (rowIndex === 0) newCell.textContent = `Heading ${insertIndex + 1}`;
        else newCell.appendChild(document.createElement('br'));
        const reference = row.cells[insertIndex] || null;
        row.insertBefore(newCell, reference);
      });
      syncMarkdownFromWysiwyg();
      scheduleRender();
      focusTableCell(table.rows[cell.parentElement.rowIndex]?.cells[insertIndex] || table.rows[0]?.cells[insertIndex], true);
    }

    function deleteActiveTableColumn() {
      const cell = activeTableCell;
      const table = cell?.closest('table');
      if (!table || (table.rows[0]?.cells.length || 0) <= 1) return;
      const columnIndex = cell.cellIndex;
      const rowIndex = cell.parentElement.rowIndex;
      Array.from(table.rows).forEach(row => {
        if (row.cells[columnIndex]) row.deleteCell(columnIndex);
      });
      syncMarkdownFromWysiwyg();
      scheduleRender();
      const targetRow = table.rows[Math.min(rowIndex, table.rows.length - 1)];
      focusTableCell(targetRow?.cells[Math.min(columnIndex, targetRow.cells.length - 1)] || table.rows[0]?.cells[0]);
    }

    function deleteActiveTable() {
      const table = activeTableCell?.closest('table');
      if (!table) return;
      if (!confirm('Delete this table?')) return;
      const replacement = document.createElement('p');
      replacement.appendChild(document.createElement('br'));
      table.replaceWith(replacement);
      hideTableTools();
      syncMarkdownFromWysiwyg();
      scheduleRender();
      const range = document.createRange();
      range.selectNodeContents(replacement);
      range.collapse(true);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      savedWysiwygRange = range.cloneRange();
      showToast('Table deleted');
    }

    function handleTableToolAction(action) {
      switch (action) {
        case 'addRow': addTableRowBelow(); break;
        case 'deleteRow': deleteActiveTableRow(); break;
        case 'addColumn': addTableColumnRight(); break;
        case 'deleteColumn': deleteActiveTableColumn(); break;
        case 'deleteTable': deleteActiveTable(); break;
      }
    }

    function moveThroughTable(event, cell) {
      const table = cell.closest('table');
      if (!table) return;
      const cells = Array.from(table.querySelectorAll('th, td'));
      let index = cells.indexOf(cell);
      if (index < 0) return;
      event.preventDefault();
      if (event.shiftKey) {
        if (index > 0) focusTableCell(cells[index - 1]);
        return;
      }
      if (index === cells.length - 1) {
        addTableRowBelow(cell);
        return;
      }
      focusTableCell(cells[index + 1]);
    }

    function setSourceMode(enabled) {
      const previousProgress = getScrollProgress(getActiveEditorScroller());

      sourceMode = !!enabled;
      if (sourceMode) {
        hideTableTools();
        syncMarkdownFromWysiwyg();
        editor.value = collapseEmbeddedImages(editor.value);
        saveImageMap();
        safeSetStorage(STORAGE_KEY, editor.value);
        wysiwygEditor.classList.add('hidden');
        editor.classList.remove('hidden');
        editModeLabel.textContent = 'Markdown source';
      } else {
        syncWysiwygFromMarkdown(true);
        editor.classList.add('hidden');
        wysiwygEditor.classList.remove('hidden');
        editModeLabel.textContent = 'Visual editor';
      }

      const restorePosition = () => {
        const destinationScroller = getActiveEditorScroller();
        setScrollProgress(destinationScroller, previousProgress);
        lastScrollProgress = previousProgress;
      };

      restorePosition();
      requestAnimationFrame(() => {
        restorePosition();
        requestAnimationFrame(restorePosition);
      });
      setTimeout(restorePosition, 80);
      setTimeout(restorePosition, 250);
      setTimeout(restorePosition, 600);
    }

    function execWysiwyg(command, value = null) {
      restoreWysiwygSelection();
      document.execCommand(command, false, value);
      saveWysiwygSelection();
      syncMarkdownFromWysiwyg();
    }

    function insertTextInWysiwyg(text, selectStart = null, selectLength = null) {
      const range = restoreWysiwygSelection();
      if (!range) return;

      const textNode = document.createTextNode(text);
      range.deleteContents();
      range.insertNode(textNode);

      const selection = window.getSelection();
      const newRange = document.createRange();
      const hasSelection = selectStart !== null && selectLength !== null;
      const startOffset = hasSelection ? Number(selectStart) : text.length;
      const endOffset = hasSelection ? startOffset + Number(selectLength) : startOffset;

      newRange.setStart(textNode, Math.max(0, Math.min(startOffset, text.length)));
      newRange.setEnd(textNode, Math.max(0, Math.min(endOffset, text.length)));
      selection.removeAllRanges();
      selection.addRange(newRange);
      savedWysiwygRange = newRange.cloneRange();

      syncMarkdownFromWysiwyg();
      scheduleRender();
    }

    function insertMathInWysiwyg(kind, latex) {
      const range = restoreWysiwygSelection();
      if (!range) return false;

      const type = kind === 'block' ? 'block' : 'inline';
      const node = document.createElement(type === 'block' ? 'div' : 'span');
      setWysiwygMathNode(node, type, latex || 'x');

      const spacer = document.createTextNode(type === 'block' ? '\n' : ' ');
      const fragment = document.createDocumentFragment();
      fragment.appendChild(node);
      fragment.appendChild(spacer);

      range.deleteContents();
      range.insertNode(fragment);

      const selection = window.getSelection();
      const newRange = document.createRange();
      newRange.setStart(spacer, spacer.nodeValue.length);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      savedWysiwygRange = newRange.cloneRange();

      typesetWysiwygMath(node);
      syncMarkdownFromWysiwyg();
      scheduleRender();
      return true;
    }

    function finishWysiwygMathEdit(input, commit, options = {}) {
      if (!input) return false;
      const node = input.closest('.wysiwyg-math[data-wysiwygmd-math]');
      if (!node) return false;
      const type = node.getAttribute('data-wysiwygmd-math') === 'block' ? 'block' : 'inline';
      const original = input.getAttribute('data-original-latex') || node.getAttribute('data-latex') || 'x';
      const next = commit ? (input.value.trim() || 'x') : original;
      const quiet = !!(options && options.quiet);

      if (activeMathEditInput === input) activeMathEditInput = null;
      setWysiwygMathNode(node, type, next);
      typesetWysiwygMath(node);
      syncMarkdownFromWysiwyg();
      scheduleRender();
      if (!quiet) showToast(commit ? 'Maths updated' : 'Maths edit cancelled');
      return true;
    }

    function commitActiveWysiwygMathEdit(options = {}) {
      const input = activeMathEditInput;
      if (!input || !document.body.contains(input)) {
        activeMathEditInput = null;
        return false;
      }
      return finishWysiwygMathEdit(input, true, options);
    }

    function editWysiwygMathNode(node) {
      if (!node || !node.getAttribute('data-wysiwygmd-math')) return;
      if (activeMathEditInput && document.body.contains(activeMathEditInput)) {
        const activeNode = activeMathEditInput.closest('.wysiwyg-math[data-wysiwygmd-math]');
        if (activeNode === node) {
          activeMathEditInput.focus();
          activeMathEditInput.select();
          return;
        }
        finishWysiwygMathEdit(activeMathEditInput, true);
      }

      const type = node.getAttribute('data-wysiwygmd-math') === 'block' ? 'block' : 'inline';
      const current = node.getAttribute('data-latex') || 'x';
      node.classList.add('editing-math');
      node.innerHTML = '';

      const input = document.createElement(type === 'block' ? 'textarea' : 'input');
      input.className = 'math-edit-input';
      input.value = current;
      input.setAttribute('data-original-latex', current);
      input.setAttribute('aria-label', type === 'block' ? 'Edit block maths' : 'Edit inline maths');
      if (type !== 'block') {
        input.type = 'text';
      } else {
        input.rows = Math.min(3, Math.max(2, current.split(/\r?\n/).length));
        input.setAttribute('spellcheck', 'false');
      }
      activeMathEditInput = input;

      const controls = document.createElement('span');
      controls.className = 'math-edit-controls';
      const doneBtn = document.createElement('button');
      doneBtn.type = 'button';
      doneBtn.textContent = '✓ Done';
      doneBtn.setAttribute('aria-label', 'Done editing maths');
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.textContent = '× Cancel';
      cancelBtn.setAttribute('aria-label', 'Cancel maths edit');
      controls.appendChild(doneBtn);
      controls.appendChild(cancelBtn);

      node.appendChild(input);
      node.appendChild(controls);

      const resizeMathInput = () => {
        if (type !== 'block') return;
        input.style.height = 'auto';
        const maxHeight = Math.round(7.5 * parseFloat(getComputedStyle(document.documentElement).fontSize || '16'));
        input.style.height = Math.min(input.scrollHeight, maxHeight) + 'px';
      };
      resizeMathInput();

      input.addEventListener('input', () => {
        resizeMathInput();
        node.setAttribute('data-latex', input.value.trim() || 'x');
        syncMarkdownFromWysiwyg();
        scheduleRender();
      });
      input.addEventListener('blur', () => {
        // Desktop fix: if the user clicks Save, Preview, or another part of the
        // editor while a formula is open, commit it and re-render it instead of
        // leaving the raw LaTeX edit box on the page.
        setTimeout(() => {
          if (activeMathEditInput === input && document.body.contains(input)) {
            finishWysiwygMathEdit(input, true, { quiet: true });
          }
        }, 0);
      });
      input.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          finishWysiwygMathEdit(input, false);
          return;
        }
        if (event.key === 'Enter' && type !== 'block' && !event.shiftKey) {
          event.preventDefault();
          finishWysiwygMathEdit(input, true);
        }
      });
      let mathEditFinished = false;
      const finishMathEditFromButton = (event, commit) => {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        if (mathEditFinished) return;
        mathEditFinished = true;
        finishWysiwygMathEdit(input, commit);
      };

      // Commit on pointer/mouse down rather than waiting for click.  In some
      // desktop browsers the click can be swallowed because the formula wrapper
      // is contenteditable=false and the input loses focus first.
      ['pointerdown', 'mousedown', 'touchstart', 'click'].forEach(eventName => {
        doneBtn.addEventListener(eventName, event => finishMathEditFromButton(event, true));
        cancelBtn.addEventListener(eventName, event => finishMathEditFromButton(event, false));
      });

      setTimeout(() => {
        resizeMathInput();
        input.focus();
        try { input.setSelectionRange(input.value.length, input.value.length); } catch (_error) {}
      }, 0);
    }


    function insertImageInWysiwyg(dataUri, altText) {
      const range = restoreWysiwygSelection();
      if (!range) return false;

      const img = document.createElement('img');
      img.src = dataUri;
      img.alt = altText || 'Image';
      img.setAttribute('data-wysiwygmd-embedded', 'true');

      const spacer = document.createTextNode(' ');
      const fragment = document.createDocumentFragment();
      fragment.appendChild(img);
      fragment.appendChild(spacer);

      range.deleteContents();
      range.insertNode(fragment);

      const selection = window.getSelection();
      const newRange = document.createRange();
      newRange.setStart(spacer, 1);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      savedWysiwygRange = newRange.cloneRange();

      syncMarkdownFromWysiwyg();
      scheduleRender();
      return true;
    }

    function renderNow() {
      const linkedProgressBeforeRender = linkedScrollEnabled() ? getScrollProgress(getActiveEditorScroller()) : null;

      try {
        const editorRaw = editor.value || '';
        const raw = expandEmbeddedImages(editorRaw);
        updateStats(editorRaw);
        syncWysiwygFromMarkdown(false);

        const { protectedText, blocks, inlines } = protectMath(raw);
        preview.innerHTML = sanitiseRenderedHtml(simpleMarkdownToHtml(protectedText));

        restoreMath(preview, blocks, inlines);
        markSubmissionStructure(preview);
        resyncLinkedScrollAfterRender(linkedProgressBeforeRender);

        if (window.MathJax?.typesetPromise) {
          MathJax.typesetClear([preview]);
          MathJax.typesetPromise([preview]).then(() => {
            resyncLinkedScrollAfterRender(linkedProgressBeforeRender);
          }).catch(err => {
            console.error(err);
            showToast('Maths preview had a rendering issue. Check the equation syntax.');
          });
        }
      } catch (error) {
        console.error('Preview render failed:', error);
        preview.innerHTML = '<p><strong>The print renderer could not prepare this file.</strong></p><p>Save a Markdown copy or start a new document.</p>';
        showToast('The print renderer could not prepare this file.');
      }
    }


    function scheduleRender() {
      clearTimeout(renderTimer);
      renderTimer = setTimeout(renderNow, 220);
    }

    function saveDraft(updateVisual = true) {
      try {
        queueHistoryCapture();
        safeSetStorage(STORAGE_KEY, editor.value || '');
        saveImageMap();
        updateNavigation(false);
        if (updateVisual) syncWysiwygFromMarkdown(false);
        scheduleRender();
      } catch (error) {
        console.error('Autosave failed:', error);
        showToast('Autosave failed. Save the file manually.');
      }
    }


    function updateHistoryButtons() {
      const pendingChange = historyCurrentMarkdown !== null && (editor.value || '') !== historyCurrentMarkdown;
      if (undoBtn) undoBtn.disabled = undoStack.length === 0 && !pendingChange;
      if (redoBtn) redoBtn.disabled = redoStack.length === 0 || pendingChange;
    }

    function resetHistory(markdown = editor.value || '') {
      clearTimeout(historyTimer);
      historyTimer = null;
      undoStack = [];
      redoStack = [];
      historyCurrentMarkdown = markdown;
      updateHistoryButtons();
    }

    function flushHistoryCapture() {
      clearTimeout(historyTimer);
      historyTimer = null;
      if (historyApplying || documentLoadInProgress) return;

      const currentMarkdown = editor.value || '';
      if (historyCurrentMarkdown === null) {
        historyCurrentMarkdown = currentMarkdown;
        updateHistoryButtons();
        return;
      }
      if (currentMarkdown === historyCurrentMarkdown) return;

      undoStack.push(historyCurrentMarkdown);
      if (undoStack.length > HISTORY_LIMIT) undoStack.shift();
      historyCurrentMarkdown = currentMarkdown;
      redoStack = [];
      updateHistoryButtons();
    }

    function queueHistoryCapture(delay = 450) {
      if (historyApplying || documentLoadInProgress) return;
      clearTimeout(historyTimer);
      updateHistoryButtons();
      historyTimer = setTimeout(flushHistoryCapture, delay);
    }

    function applyHistoryMarkdown(markdown) {
      historyApplying = true;
      clearTimeout(historyTimer);
      historyTimer = null;
      activeMathEditInput = null;
      savedWysiwygRange = null;
      hideTableTools();

      try {
        editor.value = markdown;
        safeSetStorage(STORAGE_KEY, editor.value || '');
        saveImageMap();
        updateNavigation(false);
        forceWysiwygFromMarkdown({ resetScroll: false, focusStart: false });
        renderNow();
      } finally {
        historyApplying = false;
        updateHistoryButtons();
      }
    }

    function undoDocument() {
      if (isVisualModeActive()) commitActiveWysiwygMathEdit({ quiet: true });
      flushHistoryCapture();
      if (!undoStack.length) return;

      const currentMarkdown = editor.value || '';
      const previousMarkdown = undoStack.pop();
      redoStack.push(currentMarkdown);
      if (redoStack.length > HISTORY_LIMIT) redoStack.shift();
      historyCurrentMarkdown = previousMarkdown;
      applyHistoryMarkdown(previousMarkdown);
    }

    function redoDocument() {
      if (isVisualModeActive()) commitActiveWysiwygMathEdit({ quiet: true });
      flushHistoryCapture();
      if (!redoStack.length) return;

      const currentMarkdown = editor.value || '';
      const nextMarkdown = redoStack.pop();
      undoStack.push(currentMarkdown);
      if (undoStack.length > HISTORY_LIMIT) undoStack.shift();
      historyCurrentMarkdown = nextMarkdown;
      applyHistoryMarkdown(nextMarkdown);
    }

    function editorHistoryShortcutTarget(target) {
      return target === editor || target === wysiwygEditor || (wysiwygEditor && wysiwygEditor.contains(target));
    }

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function getScrollProgress(element) {
      if (!element) return 0;
      const maxScroll = Math.max(1, element.scrollHeight - element.clientHeight);
      return clamp(element.scrollTop / maxScroll, 0, 1);
    }

    function setScrollProgress(element, progress) {
      if (!element) return;
      const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
      element.scrollTop = maxScroll * clamp(progress, 0, 1);
    }

    function getActiveEditorScroller() {
      if (sourceMode) return editor;
      return document.querySelector('main') || wysiwygEditor;
    }

    function linkedScrollEnabled() {
      return isWideScreen()
        && currentView === 'split'
        && editorPanel
        && previewPanel
        && !editorPanel.classList.contains('hidden')
        && !previewPanel.classList.contains('hidden');
    }

    function mirrorLinkedScroll(fromElement, toElement) {
      if (!linkedScrollEnabled() || linkedScrollLock || !fromElement || !toElement || fromElement === toElement) return;

      const progress = getScrollProgress(fromElement);
      lastScrollProgress = progress;

      linkedScrollLock = true;
      setScrollProgress(toElement, progress);

      clearTimeout(linkedScrollTimer);
      linkedScrollTimer = setTimeout(() => {
        linkedScrollLock = false;
      }, 40);
    }

    function syncPreviewScrollToEditor() {
      if (!linkedScrollEnabled()) return;
      mirrorLinkedScroll(getActiveEditorScroller(), preview);
    }

    function syncEditorScrollToPreview() {
      if (!linkedScrollEnabled()) return;
      mirrorLinkedScroll(preview, getActiveEditorScroller());
    }

    function resyncLinkedScrollAfterRender(progress = null) {
      if (!linkedScrollEnabled()) return;
      const editorScroller = getActiveEditorScroller();
      const targetProgress = progress === null ? getScrollProgress(editorScroller) : progress;
      requestAnimationFrame(() => {
        setScrollProgress(preview, targetProgress);
      });
    }

    function getCurrentScrollProgress() {
      if (currentView === 'preview') {
        return getScrollProgress(preview);
      }

      if (currentView === 'split') {
        return getScrollProgress(getActiveEditorScroller());
      }

      return getScrollProgress(getActiveEditorScroller());
    }

    function applyScrollProgress(view, progress) {
      requestAnimationFrame(() => {
        if (view === 'edit') {
          setScrollProgress(getActiveEditorScroller(), progress);
        } else if (view === 'preview') {
          setScrollProgress(preview, progress);
        } else {
          setScrollProgress(getActiveEditorScroller(), progress);
          setScrollProgress(preview, progress);
        }
      });
    }

    function isWideScreen() {
      return window.matchMedia('(min-width: 900px)').matches;
    }

    function switchView(_view) {
      lastScrollProgress = getScrollProgress(getActiveEditorScroller());
      currentView = 'edit';

      editTab.classList.add('active');
      previewTab.classList.remove('active');
      splitTab.classList.remove('active');

      editorPanel.classList.remove('hidden');
      previewPanel.classList.add('hidden');

      if (!sourceMode && !wysiwygEditor.classList.contains('hidden') && !wysiwygEditor.innerHTML.trim()) {
        syncWysiwygFromMarkdown(true);
      }

      applyScrollProgress('edit', lastScrollProgress);
    }

    function handleResponsiveLayout() {
      switchView('edit');
    }

    function getLineStart(text, index) {
      return text.lastIndexOf('\n', Math.max(0, index - 1)) + 1;
    }

    function getLineEnd(text, index) {
      const nextBreak = text.indexOf('\n', index);
      return nextBreak === -1 ? text.length : nextBreak;
    }

    function replaceSelection(replacement, selectionOffset = 0, selectionLength = null) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const before = editor.value.slice(0, start);
      const after = editor.value.slice(end);
      editor.value = before + replacement + after;

      const newStart = start + selectionOffset;
      const newEnd = selectionLength === null ? newStart : newStart + selectionLength;
      editor.focus();
      editor.setSelectionRange(newStart, newEnd);
      saveDraft();
    }

    function wrapSelection(prefix, suffix = prefix, placeholder = 'text') {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const selected = editor.value.slice(start, end) || placeholder;
      replaceSelection(prefix + selected + suffix, prefix.length, selected.length);
    }

    function prefixSelectedLines(prefix, numbered = false) {
      const text = editor.value;
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const lineStart = getLineStart(text, start);
      const lineEnd = getLineEnd(text, end);
      const selectedBlock = text.slice(lineStart, lineEnd);
      const lines = selectedBlock.split('\n');

      const updated = lines.map((line, index) => {
        if (numbered) {
          return `${index + 1}. ${line.replace(/^\d+\.\s+/, '')}`;
        }
        return prefix + line.replace(/^(#{1,6}\s+|>\s+|[-*]\s+)/, '');
      }).join('\n');

      editor.value = text.slice(0, lineStart) + updated + text.slice(lineEnd);
      editor.focus();
      editor.setSelectionRange(lineStart, lineStart + updated.length);
      saveDraft();
    }

    function setHeading(level) {
      const hashes = '#'.repeat(level) + ' ';
      const text = editor.value;
      const start = editor.selectionStart;
      const lineStart = getLineStart(text, start);
      const lineEnd = getLineEnd(text, start);
      const line = text.slice(lineStart, lineEnd);
      const clean = line.replace(/^#{1,6}\s+/, '');
      const updated = hashes + clean;

      editor.value = text.slice(0, lineStart) + updated + text.slice(lineEnd);
      editor.focus();
      editor.setSelectionRange(lineStart + hashes.length, lineStart + updated.length);
      saveDraft();
    }

    function insertBlockMath() {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const selected = editor.value.slice(start, end).trim() || 'E = mc^2';
      const block = `\n\\[\n${selected}\n\\]\n`;
      replaceSelection(block, 3, selected.length);
    }

    function insertHorizontalRule() {
      replaceSelection('\n\n---\n\n', 5, 0);
    }

    function handleFormatAction(action) {
      if (action === 'sourceToggle') {
        setSourceMode(!sourceMode);
        return;
      }
      if (action === 'table') {
        openTableDialog();
        return;
      }

      if (!sourceMode && wysiwygEditor && !wysiwygEditor.classList.contains('hidden')) {
        switch (action) {
          case 'h1': execWysiwyg('formatBlock', '<h1>'); break;
          case 'h2': execWysiwyg('formatBlock', '<h2>'); break;
          case 'h3': execWysiwyg('formatBlock', '<h3>'); break;
          case 'bold': execWysiwyg('bold'); break;
          case 'italic': execWysiwyg('italic'); break;
          case 'quote': execWysiwyg('formatBlock', '<blockquote>'); break;
          case 'bullet': execWysiwyg('insertUnorderedList'); break;
          case 'numbered': execWysiwyg('insertOrderedList'); break;
          case 'inlineMath': insertMathInWysiwyg('inline', 'x'); break;
          case 'blockMath': insertMathInWysiwyg('block', 'E = mc^2'); break;
          case 'image': imageInput.click(); break;
          case 'hr': execWysiwyg('insertHorizontalRule'); break;
        }
        return;
      }

      switch (action) {
        case 'h1': setHeading(1); break;
        case 'h2': setHeading(2); break;
        case 'h3': setHeading(3); break;
        case 'bold': wrapSelection('**', '**', 'bold text'); break;
        case 'italic': wrapSelection('*', '*', 'italic text'); break;
        case 'quote': prefixSelectedLines('> '); break;
        case 'bullet': prefixSelectedLines('- '); break;
        case 'numbered': prefixSelectedLines('', true); break;
        case 'inlineMath': wrapSelection('\\(', '\\)', 'x'); break;
        case 'blockMath': insertBlockMath(); break;
        case 'image': imageInput.click(); break;
        case 'hr': insertHorizontalRule(); break;
      }
    }

    function normaliseMarkdownFileName(name) {
      const cleaned = (name || 'science-draft.md')
        .trim()
        .replace(/[\\/:*?"<>|]/g, '-')
        .replace(/\s+/g, ' ');

      const fallback = cleaned || 'science-draft.md';
      return fallback.replace(/\.(markdown|md|txt|html?)$/i, '') + '.md';
    }

    function normaliseHtmlFileName(name) {
      const cleaned = (name || 'draft.html')
        .trim()
        .replace(/[\\/:*?"<>|]/g, '-')
        .replace(/\s+/g, ' ');

      const fallback = cleaned || 'draft.html';
      return fallback.replace(/\.(markdown|md|txt|html?)$/i, '') + '.html';
    }

    function getDocumentTitleFromMarkdown() {
      const match = /^#\s+(.+?)\s*#*\s*$/m.exec(editor.value || '');
      const title = match ? match[1].replace(/[`*_~\[\]()`]/g, '').trim() : '';
      return title || (currentFileName || 'Sciwrix document').replace(/\.(markdown|md|txt|html?)$/i, '');
    }

    function downloadTextFile(text, fileName, type) {
      const blob = new Blob([text], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }



    function applyPrintClasses() {
      document.body.classList.remove(
        'print-style-paper',
        'print-style-compact',
        'print-style-large',
        'print-page-numbers'
      );

      const selected = previewStyle.value;

      if (selected === 'physics' || selected === 'times') {
        document.body.classList.add('print-style-paper');
      } else if (selected === 'draft') {
        document.body.classList.add('print-style-large');
      }

      document.body.classList.add('print-page-numbers');
    }

    function clearPrintClasses() {
      document.body.classList.remove(
        'print-style-paper',
        'print-style-compact',
        'print-style-large',
        'print-page-numbers'
      );
    }

    async function printPreview() {
      if (isVisualModeActive()) {
        const committedMath = commitActiveWysiwygMathEdit({ quiet: true });
        if (!committedMath) syncMarkdownFromWysiwyg();
      }

      const previousProgress = getScrollProgress(getActiveEditorScroller());
      const previousTitle = document.title;
      document.title = getDocumentTitleFromMarkdown();

      renderNow();

      try {
        if (window.MathJax?.typesetPromise) {
          await MathJax.typesetPromise([preview]);
        }
      } catch (error) {
        console.error(error);
      }

      applyPrintClasses();

      // Allow browsers to apply the print stylesheet and finish SVG maths layout.
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await new Promise(resolve => setTimeout(resolve, 180));

      window.print();

      setTimeout(() => {
        clearPrintClasses();
        document.title = previousTitle;
        applyScrollProgress('edit', previousProgress);
      }, 450);
    }

    function downloadMarkdown(fileNameOverride = null) {
      if (isVisualModeActive()) {
        const committedMath = commitActiveWysiwygMathEdit({ quiet: true });
        if (!committedMath) syncMarkdownFromWysiwyg();
      }
      const text = expandEmbeddedImages(editor.value);
      const safeName = normaliseMarkdownFileName(fileNameOverride || currentFileName || 'science-draft.md');
      downloadTextFile(text, safeName, 'text/markdown;charset=utf-8');
      setFileName(safeName);
      showToast(`Saved ${safeName}`);
    }

    function normaliseLatexFileName(fileName) {
      const raw = String(fileName || '').trim() || 'science-draft.tex';
      const stem = raw.replace(/\.(?:md|markdown|html?|tex)$/i, '') || 'science-draft';
      return `${stem}.tex`;
    }

    function normaliseExportFileName(fileName, format) {
      if (format === 'html') return normaliseHtmlFileName(fileName);
      if (format === 'latex') return normaliseLatexFileName(fileName);
      return normaliseMarkdownFileName(fileName);
    }

    function getSaveAsOptions() {
      const suggestedName = normaliseMarkdownFileName(currentFileName || 'science-draft.md');

      if (typeof HTMLDialogElement === 'undefined') {
        const requestedName = prompt('Save as filename:', suggestedName);
        if (requestedName === null) return Promise.resolve(null);
        const requestedFormat = prompt('Output format: Markdown, HTML, or LaTeX', 'Markdown');
        if (requestedFormat === null) return Promise.resolve(null);
        const format = /^(?:latex|tex)$/i.test(requestedFormat.trim())
          ? 'latex'
          : /^html?$/i.test(requestedFormat.trim())
            ? 'html'
            : 'markdown';
        return Promise.resolve({
          fileName: normaliseExportFileName(requestedName, format),
          format
        });
      }

      return new Promise(resolve => {
        const dialog = document.createElement('dialog');
        dialog.className = 'save-as-dialog';
        dialog.innerHTML = `
          <form method="dialog" class="save-as-form">
            <h3>Save As</h3>
            <label class="save-as-field">
              <span>Filename</span>
              <input name="fileName" type="text" value="${escapeHtml(suggestedName)}" autocomplete="off">
            </label>
            <label class="save-as-field">
              <span>Format</span>
              <select name="format">
                <option value="markdown">Markdown source (.md)</option>
                <option value="html">Rendered HTML (.html)</option>
                <option value="latex">LaTeX document (.tex)</option>
              </select>
            </label>
            <p class="save-as-note">LaTeX export preserves maths and converts common Markdown structures into a compile-ready document.</p>
            <div class="save-as-actions">
              <button value="cancel" formnovalidate>Cancel</button>
              <button class="primary" value="save">Save</button>
            </div>
          </form>
        `;

        const style = document.createElement('style');
        style.textContent = `
          .save-as-dialog { border: 1px solid var(--border); border-radius: 22px; padding: 0; background: var(--panel); color: var(--text); box-shadow: var(--shadow); width: min(92vw, 430px); }
          .save-as-dialog::backdrop { background: rgba(15, 23, 42, 0.42); backdrop-filter: blur(3px); }
          .save-as-form { padding: 18px; display: grid; gap: 14px; }
          .save-as-form h3 { margin: 0; font-size: 1.1rem; }
          .save-as-field { display: grid; gap: 7px; font-weight: 700; }
          .save-as-field input, .save-as-field select { min-height: 44px; border-radius: 14px; border: 1px solid var(--border); background: var(--panel-2); color: var(--text); padding: 0 12px; font: inherit; }
          .save-as-note { margin: -4px 0 0; color: var(--muted); font-size: 0.9rem; }
          .save-as-actions { display: flex; justify-content: flex-end; gap: 10px; }
          .save-as-actions button { min-height: 42px; border-radius: 14px; border: 1px solid var(--border); background: var(--panel-2); color: var(--text); padding: 0 14px; font-weight: 800; }
          .save-as-actions .primary { background: var(--accent); color: white; border-color: var(--accent); }
        `;

        document.head.appendChild(style);
        document.body.appendChild(dialog);

        const input = dialog.querySelector('input[name="fileName"]');
        const formatSelect = dialog.querySelector('select[name="format"]');

        formatSelect.addEventListener('change', () => {
          input.value = normaliseExportFileName(input.value, formatSelect.value);
        });

        dialog.addEventListener('close', () => {
          const format = formatSelect.value;
          const result = dialog.returnValue === 'save'
            ? { fileName: normaliseExportFileName(input.value, format), format }
            : null;
          dialog.remove();
          style.remove();
          resolve(result);
        }, { once: true });

        dialog.showModal();
        input.focus();
        input.select();
      });
    }

    async function ensurePreviewRenderedForExport() {
      if (isVisualModeActive()) {
        const committedMath = commitActiveWysiwygMathEdit({ quiet: true });
        if (!committedMath) syncMarkdownFromWysiwyg();
      }
      renderNow();
      if (window.MathJax?.typesetPromise) {
        try {
          await MathJax.typesetPromise([preview]);
        } catch (error) {
          console.error(error);
          showToast('Maths export had a rendering issue. Check the equation syntax.');
        }
      }
    }

    function getEmbeddedMathJaxScriptsForExport() {
      // The first two scripts in the head are the MathJax configuration and the
      // embedded MathJax library. The main app script is deliberately not exported.
      return Array.from(document.querySelectorAll('head > script'))
        .slice(0, 2)
        .map(script => `<script>${(script.textContent || '').replace(/<\/script/gi, '<\\/script')}<\/script>`)
        .join('\n');
    }

    function buildUntypesetPreviewHtmlForExport() {
      // Build from the Markdown source rather than from preview.innerHTML.
      // preview.innerHTML may contain MathJax's live DOM, which is not reliable
      // when copied into a standalone saved HTML file on Android/Chrome.
      const raw = expandEmbeddedImages(editor.value);
      const { protectedText, blocks, inlines } = protectMath(raw);
      const temp = document.createElement('article');
      temp.innerHTML = sanitiseRenderedHtml(simpleMarkdownToHtml(protectedText));
      restoreMath(temp, blocks, inlines);
      markSubmissionStructure(temp);
      return temp.innerHTML;
    }

    function buildStaticHtmlDocument() {
      const title = getDocumentTitleFromMarkdown();
      const styleText = Array.from(document.querySelectorAll('style'))
        .map(style => style.textContent || '')
        .join('\n');
      const mathJaxScripts = getEmbeddedMathJaxScriptsForExport();
      const themeClass = document.body.classList.contains('dark') ? 'dark' : '';
      const previewClasses = Array.from(preview.classList).join(' ');
      const exportPrintClass = preview.classList.contains('preview-style-physics') || preview.classList.contains('preview-style-times')
        ? 'print-style-paper print-page-numbers'
        : preview.classList.contains('preview-style-draft')
          ? 'print-style-large print-page-numbers'
          : 'print-page-numbers';
      const bodyClasses = [themeClass, exportPrintClass].filter(Boolean).join(' ');
      const articleHtml = buildUntypesetPreviewHtmlForExport();

      return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
${mathJaxScripts}
<style>
${styleText}
body { background: var(--bg); padding: 0; }
.export-wrap { max-width: 920px; margin: 0 auto; padding: 24px 16px; }
.export-wrap .preview { height: auto !important; min-height: 0 !important; overflow: visible !important; }
@media print { .export-wrap { padding: 0; max-width: none; } }


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



  /* CKMARK-PREVIEW-PHYSICS-WIDTH-FAST-FIX */
  @media screen {
    .preview.preview-style-physics {
      max-width: none !important;
      width: 100% !important;
    }
  }

</style>
</head>
<body class="${escapeHtml(bodyClasses)}">
<main class="export-wrap">
<article class="${escapeHtml(previewClasses)}">
${articleHtml}
</article>
</main>
<script>
window.addEventListener('load', function () {
  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise().catch(function (error) { console.error(error); });
  }
});
<\/script>
</body>
</html>`;
    }

    async function downloadRenderedHtml(fileNameOverride = null) {
      await ensurePreviewRenderedForExport();
      const safeName = normaliseHtmlFileName(fileNameOverride || currentFileName || 'draft.html');
      downloadTextFile(buildStaticHtmlDocument(), safeName, 'text/html;charset=utf-8');
      showToast(`Saved ${safeName}`);
    }

    function escapeLatexText(value) {
      const replacements = {
        '\\': String.raw`\textbackslash{}`,
        '{': String.raw`\{`,
        '}': String.raw`\}`,
        '$': String.raw`\$`,
        '&': String.raw`\&`,
        '#': String.raw`\#`,
        '_': String.raw`\_`,
        '%': String.raw`\%`,
        '^': String.raw`\textasciicircum{}`,
        '~': String.raw`\textasciitilde{}`
      };
      return String(value ?? '').replace(/[\\{}$&#_%^~]/g, character => replacements[character]);
    }

    function decodeHtmlText(value) {
      const holder = document.createElement('div');
      holder.innerHTML = String(value ?? '').replace(/<br\s*\/?\s*>/gi, '\n');
      return holder.textContent || '';
    }

    function convertInlineMarkdownToLatex(value) {
      const tokens = [];
      const hold = content => `\uE000${tokens.push(content) - 1}\uE001`;
      let text = String(value ?? '');

      text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, body) => hold(String.raw`\[${body}\]`));
      text = text.replace(/\\\(([\s\S]+?)\\\)/g, match => hold(match));
      text = text.replace(/(^|[^\\$])\$(?!\$)([^$\n]+)\$/g, (_, prefix, body) => `${prefix}${hold(`$${body}$`)}`);
      text = text.replace(/`([^`\n]+)`/g, (_, code) => hold(String.raw`\texttt{${escapeLatexText(code)}}`));
      text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, alt, source) => {
        const label = escapeLatexText(alt || 'image');
        if (/^(?:data:|blob:)/i.test(source)) {
          return hold(String.raw`\textit{[Embedded image omitted from single-file LaTeX export: ${label}]}`);
        }
        return hold(String.raw`\includegraphics[width=0.9\linewidth]{\detokenize{${source}}}`);
      });
      text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, label, target) =>
        hold(String.raw`\href{\detokenize{${target}}}{${escapeLatexText(label)}}`)
      );
      text = text.replace(/\*\*([^*\n]+)\*\*/g, (_, inner) => hold(String.raw`\textbf{${escapeLatexText(inner)}}`));
      text = text.replace(/__([^_\n]+)__/g, (_, inner) => hold(String.raw`\textbf{${escapeLatexText(inner)}}`));
      text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, (_, prefix, inner) => `${prefix}${hold(String.raw`\emph{${escapeLatexText(inner)}}`)}`);
      text = text.replace(/(^|[^_])_([^_\n]+)_/g, (_, prefix, inner) => `${prefix}${hold(String.raw`\emph{${escapeLatexText(inner)}}`)}`);

      let resolved = escapeLatexText(decodeHtmlText(text));
      for (let pass = 0; pass <= tokens.length && /\uE000\d+\uE001/.test(resolved); pass += 1) {
        resolved = resolved.replace(/\uE000(\d+)\uE001/g, (_, index) => tokens[Number(index)] || '');
      }
      return resolved;
    }

    function splitMarkdownTableRow(line) {
      const source = String(line || '').trim().replace(/^\|/, '').replace(/\|$/, '');
      const cells = [];
      let current = '';
      let escaped = false;
      for (const character of source) {
        if (escaped) {
          current += character;
          escaped = false;
        } else if (character === '\\') {
          escaped = true;
          current += character;
        } else if (character === '|') {
          cells.push(current.trim());
          current = '';
        } else {
          current += character;
        }
      }
      cells.push(current.trim());
      return cells;
    }

    function isMarkdownTableSeparator(line) {
      const cells = splitMarkdownTableRow(line);
      return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell));
    }

    function buildLatexTable(headerLine, separatorLine, rowLines) {
      const headers = splitMarkdownTableRow(headerLine);
      const separators = splitMarkdownTableRow(separatorLine);
      const rows = rowLines.map(splitMarkdownTableRow);
      const columnSpec = separators.map(cell => {
        if (/^:-+:$/.test(cell)) return String.raw`>{\centering\arraybackslash}X`;
        if (/^-+:$/.test(cell)) return String.raw`>{\raggedleft\arraybackslash}X`;
        return String.raw`>{\raggedright\arraybackslash}X`;
      }).join(' ');
      const formatRow = cells => headers.map((_, index) => convertInlineMarkdownToLatex(cells[index] || '')).join(' & ') + String.raw` \\`;
      return [
        String.raw`\begin{table}[htbp]`,
        String.raw`\centering`,
        String.raw`\begin{tabularx}{\linewidth}{${columnSpec}}`,
        String.raw`\toprule`,
        formatRow(headers),
        String.raw`\midrule`,
        ...rows.map(formatRow),
        String.raw`\bottomrule`,
        String.raw`\end{tabularx}`,
        String.raw`\end{table}`
      ].join('\n');
    }

    function markdownToLatexBody(markdown) {
      const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
      const output = [];
      let paragraph = [];
      let listType = null;
      let quoteLines = [];
      let inCodeBlock = false;
      let codeLanguage = '';
      let codeLines = [];
      let inDisplayMath = false;
      let displayMathLines = [];
      let titleHeadingSkipped = false;

      const flushParagraph = () => {
        if (!paragraph.length) return;
        output.push(convertInlineMarkdownToLatex(paragraph.join(' ')));
        paragraph = [];
      };
      const closeList = () => {
        if (!listType) return;
        output.push(listType === 'ordered' ? String.raw`\end{enumerate}` : String.raw`\end{itemize}`);
        listType = null;
      };
      const flushQuote = () => {
        if (!quoteLines.length) return;
        output.push([
          String.raw`\begin{quote}`,
          convertInlineMarkdownToLatex(quoteLines.join(' ')),
          String.raw`\end{quote}`
        ].join('\n'));
        quoteLines = [];
      };
      const flushOpenBlocks = () => {
        flushParagraph();
        closeList();
        flushQuote();
      };

      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const trimmed = line.trim();

        if (inCodeBlock) {
          if (/^```/.test(trimmed)) {
            const languageComment = codeLanguage ? `% Source language: ${codeLanguage}\n` : '';
            output.push(`${languageComment}${String.raw`\begin{lstlisting}`}\n${codeLines.join('\n')}\n${String.raw`\end{lstlisting}`}`);
            inCodeBlock = false;
            codeLanguage = '';
            codeLines = [];
          } else {
            codeLines.push(line);
          }
          continue;
        }

        if (inDisplayMath) {
          if (trimmed === '$$' || trimmed === String.raw`\]`) {
            output.push(`${String.raw`\[`}\n${displayMathLines.join('\n')}\n${String.raw`\]`}`);
            inDisplayMath = false;
            displayMathLines = [];
          } else {
            displayMathLines.push(line);
          }
          continue;
        }

        const fence = trimmed.match(/^```\s*([^\s`]*)/);
        if (fence) {
          flushOpenBlocks();
          inCodeBlock = true;
          codeLanguage = fence[1] || '';
          continue;
        }

        if (trimmed === '$$' || trimmed === String.raw`\[`) {
          flushOpenBlocks();
          inDisplayMath = true;
          displayMathLines = [];
          continue;
        }

        const singleLineDisplayMath = trimmed.match(/^\$\$([\s\S]+)\$\$$/);
        if (singleLineDisplayMath) {
          flushOpenBlocks();
          output.push(`${String.raw`\[`}${singleLineDisplayMath[1]}${String.raw`\]`}`);
          continue;
        }

        if (/page-break-(?:before|after)|break-(?:before|after)\s*:\s*page|class=["'][^"']*page-break/i.test(trimmed)) {
          flushOpenBlocks();
          output.push(String.raw`\newpage`);
          continue;
        }

        if (!trimmed) {
          flushOpenBlocks();
          continue;
        }

        if (index + 1 < lines.length && trimmed.includes('|') && isMarkdownTableSeparator(lines[index + 1])) {
          flushOpenBlocks();
          const separatorLine = lines[index + 1];
          const rows = [];
          index += 2;
          while (index < lines.length && lines[index].trim() && lines[index].includes('|')) {
            rows.push(lines[index]);
            index += 1;
          }
          index -= 1;
          output.push(buildLatexTable(line, separatorLine, rows));
          continue;
        }

        const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (heading) {
          flushOpenBlocks();
          if (heading[1].length === 1 && !titleHeadingSkipped) {
            titleHeadingSkipped = true;
            continue;
          }
          const command = ['section', 'section', 'subsection', 'subsubsection', 'paragraph', 'subparagraph'][heading[1].length - 1];
          output.push(`\\${command}{${convertInlineMarkdownToLatex(heading[2])}}`);
          continue;
        }

        if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
          flushOpenBlocks();
          output.push(String.raw`\noindent\rule{\linewidth}{0.4pt}`);
          continue;
        }

        const unordered = line.match(/^\s*[-+*]\s+(.+)$/);
        const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
        if (unordered || ordered) {
          flushParagraph();
          flushQuote();
          const nextType = ordered ? 'ordered' : 'unordered';
          if (listType && listType !== nextType) closeList();
          if (!listType) {
            listType = nextType;
            output.push(nextType === 'ordered' ? String.raw`\begin{enumerate}` : String.raw`\begin{itemize}`);
          }
          let itemText = (ordered || unordered)[1];
          itemText = itemText.replace(/^\[([ xX])\]\s*/, (_, checked) => checked.trim() ? '[x] ' : '[ ] ');
          output.push(String.raw`\item ${convertInlineMarkdownToLatex(itemText)}`);
          continue;
        }

        const quote = line.match(/^\s*>\s?(.*)$/);
        if (quote) {
          flushParagraph();
          closeList();
          quoteLines.push(quote[1]);
          continue;
        }

        closeList();
        flushQuote();
        paragraph.push(trimmed);
      }

      if (inCodeBlock) {
        output.push(`${String.raw`\begin{lstlisting}`}\n${codeLines.join('\n')}\n${String.raw`\end{lstlisting}`}`);
      }
      if (inDisplayMath) {
        output.push(`${String.raw`\[`}\n${displayMathLines.join('\n')}\n${String.raw`\]`}`);
      }
      flushOpenBlocks();
      return output.join('\n\n').replace(/\n{3,}/g, '\n\n');
    }

    function buildLatexDocument() {
      const title = escapeLatexText(getDocumentTitleFromMarkdown());
      const body = markdownToLatexBody(expandEmbeddedImages(editor.value));
      return String.raw`% Generated by Sciwrix
\documentclass[11pt,a4paper]{article}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{lmodern}
\usepackage{amsmath,amssymb}
\usepackage{graphicx}
\usepackage{booktabs}
\usepackage{array}
\usepackage{tabularx}
\usepackage{hyperref}
\usepackage[margin=1in]{geometry}
\usepackage{enumitem}
\usepackage{xcolor}
\usepackage{listings}
\usepackage{float}
\hypersetup{hidelinks}
\setlength{\parindent}{0pt}
\setlength{\parskip}{0.7em}
\title{${title}}
\author{}
\date{}

\begin{document}
\maketitle

${body}

\end{document}
`;
    }

    function downloadLatex(fileNameOverride = null) {
      const safeName = normaliseLatexFileName(fileNameOverride || currentFileName || 'science-draft.tex');
      downloadTextFile(buildLatexDocument(), safeName, 'application/x-tex;charset=utf-8');
      showToast(`Saved ${safeName}`);
    }

    async function saveMarkdownAs() {
      if (isVisualModeActive()) {
        const committedMath = commitActiveWysiwygMathEdit({ quiet: true });
        if (!committedMath) syncMarkdownFromWysiwyg();
      }
      const options = await getSaveAsOptions();
      if (!options) return;
      if (options.format === 'html') {
        await downloadRenderedHtml(options.fileName);
        return;
      }
      if (options.format === 'latex') {
        downloadLatex(options.fileName);
        return;
      }
      downloadMarkdown(options.fileName);
    }


    function clearDraft() {
      const confirmed = confirm('Start a new document from the built-in Sciwrix starter? This will replace the current editor text, but it will not delete any files from your device.');
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

    function prepareForDocumentOpen() {
      // Android WebView can leave an active composition attached to the
      // contenteditable editor while its file picker is open. Commit the
      // current visual document, then blur it before handing control to the
      // picker so a delayed IME event cannot restore stale WYSIWYG content.
      if (isVisualModeActive()) syncMarkdownFromWysiwyg();
      activeMathEditInput = null;
      savedWysiwygRange = null;
      hideTableTools();
      try { wysiwygEditor.blur(); } catch (_error) {}
      try { editor.blur(); } catch (_error) {}
    }

    const fileOpenControl = document.querySelector('label[for="fileInput"]');
    if (fileOpenControl) fileOpenControl.addEventListener('pointerdown', prepareForDocumentOpen);
    fileInput.addEventListener('click', prepareForDocumentOpen);

    fileInput.addEventListener('change', async event => {
      const file = event.target.files?.[0];
      if (!file) return;

      prepareForDocumentOpen();
      const previousMarkdown = editor.value;
      const previousFileName = currentFileName;
      const previousImages = { ...embeddedImages };
      documentLoadInProgress = true;
      clearTimeout(renderTimer);
      clearTimeout(historyTimer);

      let text;
      try {
        text = await file.text();
      } catch (error) {
        console.error('Could not read Markdown file:', error);
        editor.value = previousMarkdown || starterText;
        embeddedImages = previousImages || {};
        setFileName(previousFileName || 'science-draft.md');
        showToast('Could not read that file. Your previous document was kept.');
        fileInput.value = '';
        documentLoadInProgress = false;
        return;
      }

      // Reading the file is the transaction boundary. Once its contents and
      // identity reach autosave, later visual-render or toolbar failures must
      // never roll the accepted document back to the previous one.
      embeddedImages = {};
      nextImageNumber = 1;
      saveImageMap();
      try {
        setEditorMarkdown(text, { collapseImages: true, resetScroll: true });
      } catch (renderError) {
        console.error('Initial document render failed:', renderError);
        editor.value = collapseEmbeddedImages(text);
        safeSetStorage(STORAGE_KEY, editor.value, true);
      }
      setFileName(file.name);
      saveDraft(false);

      // Do not call setSourceMode(false) here. It focuses the contenteditable
      // editor, which allows Android's old IME composition to write back over
      // the newly loaded Markdown. Switch the visible controls directly, then
      // perform a hard WYSIWYG rebuild while synchronisation is locked.
      sourceMode = false;
      editor.classList.add('hidden');
      wysiwygEditor.classList.remove('hidden');
      editModeLabel.textContent = 'Visual editor';
      try { switchView('edit'); } catch (error) { console.error(error); }
      try { forceWysiwygFromMarkdown({ resetScroll: true, focusStart: false }); } catch (error) { console.error(error); }
      try { renderNow(); } catch (error) { console.error(error); }

      // Rebuild once more after the picker and virtual keyboard have fully
      // settled. This also protects devices that dispatch a late composition
      // event after the file input change event.
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      try { forceWysiwygFromMarkdown({ resetScroll: true, focusStart: false }); } catch (error) { console.error(error); }
      try { renderNow(); } catch (error) { console.error(error); }
      try { resetHistory(editor.value || ''); } catch (error) { console.error(error); }
      saveDraft(false);
      fileInput.value = '';
      documentLoadInProgress = false;
      showToast(`Opened ${file.name}`);
    });

    formatToolbar.addEventListener('pointerdown', event => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      if (isVisualModeActive()) saveWysiwygSelection();
      event.preventDefault();
    });

    formatToolbar.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      event.preventDefault();
      handleFormatAction(button.getAttribute('data-action'));
    });

    tableForm.addEventListener('submit', event => {
      event.preventDefault();
      const columns = Math.max(1, Math.min(12, Number(tableColumns.value) || 3));
      const rows = Math.max(1, Math.min(30, Number(tableRows.value) || 2));
      tableDialog.close();
      if (isVisualModeActive()) {
        insertVisualTable(rows, columns);
      } else {
        if (savedTableSourceSelection) {
          editor.focus();
          editor.setSelectionRange(savedTableSourceSelection.start, savedTableSourceSelection.end);
        }
        replaceSelection('\n\n' + markdownTableText(rows, columns) + '\n\n', 2, 0);
        savedTableSourceSelection = null;
      }
    });
    tableDialogClose.addEventListener('click', () => {
      savedTableSourceSelection = null;
      tableDialog.close();
    });
    tableDialogCancel.addEventListener('click', () => {
      savedTableSourceSelection = null;
      tableDialog.close();
    });

    tableTools.addEventListener('pointerdown', event => {
      const button = event.target.closest('button[data-table-action]');
      if (button) event.preventDefault();
    });
    tableTools.addEventListener('click', event => {
      const button = event.target.closest('button[data-table-action]');
      if (!button || button.disabled) return;
      event.preventDefault();
      handleTableToolAction(button.getAttribute('data-table-action'));
    });

    imageInput.addEventListener('change', event => {
      const file = event.target.files && event.target.files[0];
      insertEmbeddedImageFromFile(file);
      imageInput.value = '';
    });

    editor.addEventListener('input', () => saveDraft(true));
    wysiwygEditor.addEventListener('input', () => {
      saveWysiwygSelection();
      syncMarkdownFromWysiwyg();
    });
    wysiwygEditor.addEventListener('keyup', () => {
      saveWysiwygSelection();
      const cell = tableCellFromSelection();
      if (cell) setActiveTableCell(cell);
    });
    wysiwygEditor.addEventListener('mouseup', () => {
      saveWysiwygSelection();
      const cell = tableCellFromSelection();
      if (cell) setActiveTableCell(cell);
    });
    wysiwygEditor.addEventListener('touchend', () => setTimeout(saveWysiwygSelection, 0));
    wysiwygEditor.addEventListener('focus', saveWysiwygSelection);
    wysiwygEditor.addEventListener('click', event => {
      if (event.target.closest && event.target.closest('.math-edit-input, .math-edit-controls')) return;
      const cell = event.target.closest && event.target.closest('th, td');
      if (cell && wysiwygEditor.contains(cell)) setActiveTableCell(cell);
      else hideTableTools();
      const mathNode = event.target.closest && event.target.closest('.wysiwyg-math[data-wysiwygmd-math]');
      if (!mathNode || !wysiwygEditor.contains(mathNode)) return;
      event.preventDefault();
      editWysiwygMathNode(mathNode);
    });
    wysiwygEditor.addEventListener('keydown', event => {
      if (event.target.closest && event.target.closest('.math-edit-input')) return;
      const cell = tableCellFromSelection() || (event.target.closest && event.target.closest('th, td'));
      if (event.key === 'Tab' && cell && wysiwygEditor.contains(cell)) {
        moveThroughTable(event, cell);
        return;
      }
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const mathNode = event.target.closest && event.target.closest('.wysiwyg-math[data-wysiwygmd-math]');
      if (!mathNode || !wysiwygEditor.contains(mathNode)) return;
      event.preventDefault();
      editWysiwygMathNode(mathNode);
    });
    wysiwygEditor.addEventListener('paste', event => {
      event.preventDefault();
      const text = (event.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, text);
      syncMarkdownFromWysiwyg();
    });
    editor.addEventListener('scroll', () => {
      if (currentView !== 'preview') lastScrollProgress = getScrollProgress(editor);
      if (sourceMode) syncPreviewScrollToEditor();
    });
    wysiwygEditor.addEventListener('scroll', () => {
      if (currentView !== 'preview') lastScrollProgress = getScrollProgress(wysiwygEditor);
      if (!sourceMode) syncPreviewScrollToEditor();
    });
    const mainScroller = document.querySelector('main');
    if (mainScroller) {
      mainScroller.addEventListener('scroll', () => {
        if (!sourceMode && currentView !== 'preview') {
          lastScrollProgress = getScrollProgress(mainScroller);
          syncPreviewScrollToEditor();
        }
      });
    }
    preview.addEventListener('scroll', () => {
      if (currentView !== 'edit') lastScrollProgress = getScrollProgress(preview);
      syncEditorScrollToPreview();
    });
    downloadBtn.addEventListener('click', () => downloadMarkdown());
    saveAsBtn.addEventListener('click', saveMarkdownAs);
    printBtn.addEventListener('click', printPreview);
    clearBtn.addEventListener('click', clearDraft);
    undoBtn.addEventListener('pointerdown', event => event.preventDefault());
    redoBtn.addEventListener('pointerdown', event => event.preventDefault());
    undoBtn.addEventListener('click', undoDocument);
    redoBtn.addEventListener('click', redoDocument);
    darkBtn.addEventListener('click', () => {
      setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
    });

    fullscreenBtn.addEventListener('click', toggleFullscreen);
    helpBtn.addEventListener('click', openHelpPanel);
    closeHelpBtn.addEventListener('click', closeHelpPanel);

    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);

    previewStyle.addEventListener('change', () => {
      setPreviewStyle(previewStyle.value);
      renderNow();
    });

    navBtn.addEventListener('click', openNavigation);
    findBtn.addEventListener('click', openFindPanel);
    closeFindBtn.addEventListener('click', closeFindPanel);

    findInput.addEventListener('input', () => updateFindMatches(false));
    caseSensitiveFind.addEventListener('change', () => updateFindMatches(false));
    nextMatchBtn.addEventListener('click', () => goToMatch(1));
    prevMatchBtn.addEventListener('click', () => goToMatch(-1));
    replaceOneBtn.addEventListener('click', replaceCurrentMatch);
    replaceAllBtn.addEventListener('click', replaceAllMatches);

    findInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        goToMatch(event.shiftKey ? -1 : 1);
      }
    });
    mathBtn.addEventListener('pointerdown', () => {
      if (isVisualModeActive()) saveWysiwygSelection();
    });
    mathBtn.addEventListener('click', openMathPalette);
    closeNavBtn.addEventListener('click', closeNavigation);
    closeMathBtn.addEventListener('click', closeMathPalette);

    mathDrawer.addEventListener('pointerdown', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (isVisualModeActive()) event.preventDefault();
    });

    mathDrawer.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      const hasActiveMathInput = !!(activeMathEditInput && document.body.contains(activeMathEditInput));
      if (isVisualModeActive() && !hasActiveMathInput) restoreWysiwygSelection();

      const mathKind = button.getAttribute('data-math');
      if (mathKind) {
        if (hasActiveMathInput) {
          activeMathEditInput.focus();
          showToast('Use ✓ to finish the current formula first.');
          return;
        }
        wrapCurrentSelectionAsMath(mathKind);
        closeMathPalette();
        return;
      }

      const snippet = button.getAttribute('data-snippet');
      if (snippet) {
        const selectStart = button.hasAttribute('data-select-start') ? button.getAttribute('data-select-start') : null;
        const selectLength = button.hasAttribute('data-select-length') ? button.getAttribute('data-select-length') : null;
        insertSnippetAtCursor(snippet, selectStart, selectLength);
        if (!hasActiveMathInput) closeMathPalette();
      }
    });
    drawerBackdrop.addEventListener('click', closeAllDrawers);

    editTab.addEventListener('click', () => switchView('edit'));
    previewTab.addEventListener('click', () => switchView('preview'));
    splitTab.addEventListener('click', () => switchView('split'));

    document.addEventListener('keydown', event => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || !editorHistoryShortcutTarget(event.target)) return;
      const key = event.key.toLowerCase();
      if (key === 'z') {
        event.preventDefault();
        if (event.shiftKey) redoDocument();
        else undoDocument();
      } else if (key === 'y') {
        event.preventDefault();
        redoDocument();
      }
    });

    editor.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        event.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 2;
        saveDraft();
      }
    });

    loadImageMap();

    setTheme(safeGetStorage(THEME_KEY, 'light') || 'light');
    setPreviewStyle(safeGetStorage(PREVIEW_STYLE_KEY, 'default') || 'default');
    setFileName(currentFileName);
    updateFullscreenButton();
    try {
      const restoredDraft = safeGetStorage(STORAGE_KEY, starterText) || starterText;
      if (restoredDraft.length > 2500000) throw new Error('Autosaved draft is too large to restore safely.');
      editor.value = collapseEmbeddedImages(restoredDraft);
    } catch (error) {
      console.error('Could not restore autosaved draft:', error);
      resetBrokenAutosave();
    }
    try { saveImageMap(); } catch (error) { console.warn(error); }
    safeSetStorage(STORAGE_KEY, editor.value || '', true);
    try {
      setSourceMode(false);
      updateNavigation();
      resetHistory(editor.value || '');
    } catch (error) {
      console.error('Startup render failed:', error);
      resetBrokenAutosave();
      try { setSourceMode(false); updateNavigation(); } catch (_error) {}
    }
    window.addEventListener('resize', () => {
      clearTimeout(renderTimer);
      renderTimer = setTimeout(handleResponsiveLayout, 150);
    });

    window.addEventListener('load', () => {
      setTimeout(() => {
        renderNow();
        handleResponsiveLayout();
      }, 250);
    });
