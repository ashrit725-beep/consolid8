"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const KEYWORDS =
  /\b(import|from|export|const|let|var|async|await|function|return|new|if|else|type|interface|as|default)\b/g;

/**
 * Small, dependency-free highlighter. Enough for the handful of snippets on
 * the Developer page; not a general-purpose syntax engine.
 */
function highlight(code: string): ReactNode[] {
  return code.split("\n").map((line, lineIndex) => {
    const parts: ReactNode[] = [];
    let cursor = 0;
    const pattern =
      /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\/\/.*$)|(\b\d+(?:\.\d+)?\b)/g;

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(line)) !== null) {
      if (match.index > cursor) {
        parts.push(plain(line.slice(cursor, match.index), `p${cursor}`));
      }
      const [token] = match;
      const className = match[1]
        ? "text-signal"
        : match[2]
          ? "text-fg-faint italic"
          : "text-compressed";
      parts.push(
        <span key={`t${match.index}`} className={className}>
          {token}
        </span>,
      );
      cursor = match.index + token.length;
    }
    if (cursor < line.length) {
      parts.push(plain(line.slice(cursor), `p${cursor}-end`));
    }

    return (
      <div key={lineIndex} className="whitespace-pre">
        {parts.length ? parts : " "}
      </div>
    );
  });
}

function plain(text: string, key: string): ReactNode {
  const segments = text.split(KEYWORDS);
  return (
    <span key={key}>
      {segments.map((segment, index) =>
        index % 2 === 1 ? (
          <span key={index} className="text-retrieved">
            {segment}
          </span>
        ) : (
          <span key={index}>{segment}</span>
        ),
      )}
    </span>
  );
}

export function CodeBlock({
  code,
  filename,
  language = "ts",
  className,
  maxHeight,
}: {
  code: string;
  filename?: string;
  language?: string;
  className?: string;
  maxHeight?: number;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-line bg-surface-inset",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
        <span className="num text-[10px] tracking-wide text-fg-dim">
          {filename ?? language}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 rounded-xs px-1.5 py-0.5 text-[10px] tracking-[0.06em] text-fg-dim uppercase transition-colors hover:bg-white/5 hover:text-fg"
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        className="num overflow-auto px-3 py-3 text-[11.5px] leading-[1.65] text-fg-muted"
        style={maxHeight ? { maxHeight } : undefined}
      >
        <code>{highlight(code)}</code>
      </pre>
    </div>
  );
}
