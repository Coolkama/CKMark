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

