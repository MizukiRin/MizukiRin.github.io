export interface RenderMarkdownOptions {
  autoLinkUrls?: boolean;
}

/** Escape HTML special characters to prevent XSS. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Allow only safe http(s), relative, or hash URLs. */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^(https?:\/\/|\/|#)/i.test(trimmed)) return trimmed;
  return "#";
}

function formatInlineMarkdown(raw: string, autoLinkUrls: boolean): string {
  const codeTokens: string[] = [];
  let text = raw.replace(/`([^`]+)`/g, (_m, code) => {
    const idx = codeTokens.length;
    codeTokens.push(`<code>${escapeHtml(code)}</code>`);
    return `@@CODE_${idx}@@`;
  });

  const imgTokens: string[] = [];
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) => {
    const idx = imgTokens.length;
    const safeSrc = escapeHtml(sanitizeUrl(url));
    const safeAlt = escapeHtml(alt.trim() || "image");
    imgTokens.push(
      `<a href="${safeSrc}" target="_blank" rel="noopener noreferrer" class="block my-2"><img src="${safeSrc}" alt="${safeAlt}" loading="lazy" class="rounded-sm border border-neutral-200 max-h-96 object-contain" /></a>`
    );
    return `@@IMG_${idx}@@`;
  });

  const linkOpenTokens: string[] = [];
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
    const idx = linkOpenTokens.length;
    const safeHref = escapeHtml(sanitizeUrl(url));
    linkOpenTokens.push(`<a href="${safeHref}" target="_blank" rel="noopener noreferrer">`);
    return `@@LINKOPEN_${idx}@@${label}@@LINKCLOSE@@`;
  });

  text = escapeHtml(text);

  const bareTokens: string[] = [];
  if (autoLinkUrls) {
    text = text.replace(/(https?:\/\/[^\s<]+)/g, (match) => {
      let cleanUrl = match;
      let trailing = "";
      const punctMatch = cleanUrl.match(/([.,;:!?)\]]+)$/);
      if (punctMatch) {
        trailing = punctMatch[1];
        cleanUrl = cleanUrl.slice(0, -trailing.length);
      }
      const idx = bareTokens.length;
      bareTokens.push(
        `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="break-all">${cleanUrl}</a>`
      );
      return `@@BARELINK_${idx}@@${trailing}`;
    });
  }

  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  text = text.replace(/~~([^~]+)~~/g, "<del>$1</del>");

  text = text.replace(/@@LINKOPEN_(\d+)@@/g, (_m, idx) => linkOpenTokens[Number(idx)] || "");
  text = text.replace(/@@LINKCLOSE@@/g, "</a>");
  text = text.replace(/@@BARELINK_(\d+)@@/g, (_m, idx) => bareTokens[Number(idx)] || "");
  text = text.replace(/@@IMG_(\d+)@@/g, (_m, idx) => imgTokens[Number(idx)] || "");
  text = text.replace(/@@CODE_(\d+)@@/g, (_m, idx) => codeTokens[Number(idx)] || "");
  return text;
}

/** Render a sanitized Markdown subset (headings, lists, quotes, code blocks, images, GFM tables) to HTML. */
export function renderMarkdown(md: string, options: RenderMarkdownOptions = {}): string {
  const autoLinkUrls = options.autoLinkUrls ?? false;
  const lines = (md || "").replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fenceMatch = line.match(/^```(.*)$/);
    if (fenceMatch) {
      const lang = fenceMatch[1].trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      const langAttr = lang ? ` data-lang="${escapeHtml(lang)}"` : "";
      html.push(`<pre${langAttr}><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
      html.push("<hr />");
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      html.push(`<h${level}>${formatInlineMarkdown(headingMatch[2], autoLinkUrls)}</h${level}>`);
      i++;
      continue;
    }

    // GFM Table
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(lines[i + 1])
    ) {
      const parseRow = (row: string) =>
        row
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((cell) => formatInlineMarkdown(cell.trim(), autoLinkUrls));

      const headers = parseRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(parseRow(lines[i]));
        i++;
      }
      const thead = `<thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>`;
      const tbody = rows.length
        ? `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>`
        : "";
      html.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith(">")) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      html.push(
        `<blockquote><p>${quoteLines.map((l) => formatInlineMarkdown(l, autoLinkUrls)).join("<br />")}</p></blockquote>`
      );
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(`<li>${formatInlineMarkdown(lines[i].replace(/^\s*[-*+]\s+/, ""), autoLinkUrls)}</li>`);
        i++;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${formatInlineMarkdown(lines[i].replace(/^\s*\d+\.\s+/, ""), autoLinkUrls)}</li>`);
        i++;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // Paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("```") &&
      !/^(#{1,4})\s+/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !lines[i].trimStart().startsWith(">") &&
      !/^(\*{3,}|-{3,}|_{3,})\s*$/.test(lines[i].trim())
    ) {
      paraLines.push(formatInlineMarkdown(lines[i], autoLinkUrls));
      i++;
    }
    html.push(`<p>${paraLines.join("<br />")}</p>`);
  }

  return html.join("\n");
}
