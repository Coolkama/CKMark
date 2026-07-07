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

