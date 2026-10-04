'use client';

import React from 'react';

interface FormattedMessageProps {
  content: string;
  className?: string;
}

/**
 * Parses inline formatting like **bold**, *italic*, and prices.
 */
function renderInlineText(text: string): React.ReactNode[] {
  // Regex splitting by bold (**text**), italic (*text*), and price ($XX.XX)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\$\d+(?:\.\d{2})?)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold text-amber-300">
          {boldText}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      const italicText = part.slice(1, -1);
      return (
        <span key={index} className="italic text-zinc-400 text-[11px] sm:text-xs">
          {italicText}
        </span>
      );
    }
    if (/^\$\d+(?:\.\d{2})?$/.test(part)) {
      return (
        <span key={index} className="font-bold text-amber-400 font-mono">
          {part}
        </span>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

/**
 * Renders Markdown tables gracefully on mobile/desktop screens.
 */
function renderTable(tableLines: string[], keyPrefix: number): React.ReactNode {
  const rows = tableLines
    .map((line) =>
      line
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1)
    )
    .filter((cols) => cols.length > 0);

  if (rows.length === 0) return null;

  const header = rows[0];
  if (!header) return null;
  const bodyRows = rows.slice(1).filter((r) => !r.every((c) => /^-+$/.test(c.replace(/\s/g, ''))));

  return (
    <div key={keyPrefix} className="my-3 w-full overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950/70 shadow-sm">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-900/80">
            {header.map((col, idx) => (
              <th key={idx} className="px-3 py-2 text-amber-400 font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/60">
          {bodyRows.map((cols, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-neutral-900/40 transition">
              {cols.map((cell, colIdx) => (
                <td key={colIdx} className="px-3 py-2 text-neutral-200 text-xs leading-snug align-top">
                  {renderInlineText(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FormattedMessage({ content, className = '' }: FormattedMessageProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];
  let blockKey = 0;

  const flushTable = () => {
    if (tableBuffer.length > 0) {
      elements.push(renderTable(tableBuffer, blockKey++));
      tableBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i] ?? '';
    const trimmed = rawLine.trim();

    // Markdown table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      tableBuffer.push(trimmed);
      continue;
    } else {
      flushTable();
    }

    if (!trimmed) {
      elements.push(<div key={blockKey++} className="h-2" />);
      continue;
    }

    // Bullet list item
    if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletContent = trimmed.replace(/^(•|-|\*)\s*/, '');
      elements.push(
        <div key={blockKey++} className="flex items-start gap-2 my-1 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
          <div className="flex-1 text-xs sm:text-sm leading-relaxed text-neutral-200 font-['Inter']">
            {renderInlineText(bulletContent)}
          </div>
        </div>
      );
      continue;
    }

    // Heading or bold highlight
    if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
      const headingText = trimmed.replace(/^#{2,3}\s*/, '');
      elements.push(
        <h4 key={blockKey++} className="text-xs sm:text-sm font-bold text-amber-300 mt-2 mb-1">
          {renderInlineText(headingText)}
        </h4>
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={blockKey++} className="text-xs sm:text-sm leading-relaxed text-neutral-200 font-['Inter'] my-0.5">
        {renderInlineText(rawLine)}
      </p>
    );
  }

  flushTable();

  return <div className={`flex flex-col ${className}`}>{elements}</div>;
}
