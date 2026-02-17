"use client";

import { Fragment, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MessageProps extends HTMLAttributes<HTMLDivElement> {
  from: "user" | "assistant" | "system";
}

export function Message({ from, className, ...props }: MessageProps) {
  return (
    <div
      data-from={from}
      className={cn(
        "group flex w-full",
        from === "user" ? "justify-end is-user" : "justify-start",
        className
      )}
      {...props}
    />
  );
}

export function MessageContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "max-w-[85%] space-y-2 rounded-2xl px-3 py-2.5 text-sm",
        "group-[.is-user]:bg-slate-900 group-[.is-user]:text-white",
        "group-not-[.is-user]:border group-not-[.is-user]:border-slate-200 group-not-[.is-user]:bg-white group-not-[.is-user]:text-slate-700",
        className
      )}
      {...props}
    />
  );
}

interface MessageResponseProps extends HTMLAttributes<HTMLDivElement> {
  children: string;
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const tokens: string[] = text.split(
    /(\[[^\]]+\]\([^\)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g
  );

  return tokens.map((token: string, index) => {
    if (!token) return null;

    if (token.startsWith("[")) {
      const match = token.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
      if (match) {
        return (
          <a
            key={`inline-${index}`}
            href={match[2]}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-sky-600 underline underline-offset-2 hover:text-sky-700 group-[.is-user]:text-sky-100"
          >
            {match[1]}
          </a>
        );
      }
    }

    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      return (
        <code
          key={`inline-${index}`}
          className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.82em] text-slate-800 group-[.is-user]:bg-slate-700 group-[.is-user]:text-slate-100"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      return <strong key={`inline-${index}`}>{token.slice(2, -2)}</strong>;
    }

    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      return <em key={`inline-${index}`}>{token.slice(1, -1)}</em>;
    }

    return <Fragment key={`inline-${index}`}>{token}</Fragment>;
  });
}

function renderMarkdown(content: string): ReactNode[] {
  const parts = content.replace(/\r\n/g, "\n").split("```");
  const nodes: ReactNode[] = [];
  let key = 0;

  const pushTextBlock = (textBlock: string) => {
    const lines = textBlock.split("\n");
    let paragraph: string[] = [];
    let unorderedList: string[] = [];
    let orderedList: string[] = [];

    const flushParagraph = () => {
      if (paragraph.length === 0) return;
      const text = paragraph.join(" ").trim();
      if (text) {
        nodes.push(
          <p key={`node-${key++}`} className="leading-relaxed">
            {renderInlineMarkdown(text)}
          </p>
        );
      }
      paragraph = [];
    };

    const flushUnorderedList = () => {
      if (unorderedList.length === 0) return;
      nodes.push(
        <ul key={`node-${key++}`} className="list-disc space-y-1 pl-5">
          {unorderedList.map((item, index) => (
            <li key={`ul-${key}-${index}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      unorderedList = [];
    };

    const flushOrderedList = () => {
      if (orderedList.length === 0) return;
      nodes.push(
        <ol key={`node-${key++}`} className="list-decimal space-y-1 pl-5">
          {orderedList.map((item, index) => (
            <li key={`ol-${key}-${index}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>
      );
      orderedList = [];
    };

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();

      if (!line.trim()) {
        flushParagraph();
        flushUnorderedList();
        flushOrderedList();
        continue;
      }

      const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        flushParagraph();
        flushUnorderedList();
        flushOrderedList();

        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();
        const className =
          level === 1
            ? "text-base font-semibold"
            : level === 2
            ? "text-sm font-semibold"
            : "text-sm font-medium";

        nodes.push(
          <p key={`node-${key++}`} className={className}>
            {renderInlineMarkdown(text)}
          </p>
        );
        continue;
      }

      const unorderedMatch = line.match(/^[-*]\s+(.+)$/);
      if (unorderedMatch) {
        flushParagraph();
        flushOrderedList();
        unorderedList.push(unorderedMatch[1].trim());
        continue;
      }

      const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
      if (orderedMatch) {
        flushParagraph();
        flushUnorderedList();
        orderedList.push(orderedMatch[1].trim());
        continue;
      }

      const quoteMatch = line.match(/^>\s?(.+)$/);
      if (quoteMatch) {
        flushParagraph();
        flushUnorderedList();
        flushOrderedList();

        nodes.push(
          <blockquote
            key={`node-${key++}`}
            className="border-l-2 border-slate-300 pl-3 italic text-slate-600 group-[.is-user]:border-slate-500 group-[.is-user]:text-slate-100"
          >
            {renderInlineMarkdown(quoteMatch[1].trim())}
          </blockquote>
        );
        continue;
      }

      paragraph.push(line.trim());
    }

    flushParagraph();
    flushUnorderedList();
    flushOrderedList();
  };

  parts.forEach((part, index) => {
    if (index % 2 === 1) {
      const [firstLine, ...rest] = part.split("\n");
      const language = firstLine.trim();
      const code = rest.join("\n").trimEnd();

      nodes.push(
        <div key={`node-${key++}`} className="space-y-1">
          {language ? (
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 group-[.is-user]:text-slate-300">
              {language}
            </p>
          ) : null}
          <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100">
            <code>{code}</code>
          </pre>
        </div>
      );
      return;
    }

    pushTextBlock(part);
  });

  return nodes;
}

export function MessageResponse({ children, className, ...props }: MessageResponseProps) {
  return (
    <div
      className={cn(
        "space-y-2 text-slate-700 group-[.is-user]:text-white",
        className
      )}
      {...props}
    >
      {renderMarkdown(children)}
    </div>
  );
}
