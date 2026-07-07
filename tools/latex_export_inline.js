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

