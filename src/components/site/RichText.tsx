import { Fragment, type ReactNode } from "react";

/**
 * Renders plain text from the admin as paragraphs. Blank lines start a new
 * paragraph, single line breaks are kept, and *italic* / **bold** are the
 * only inline styles (both optional).
 */
export function RichText({ text, className, paragraphClassName }: { text: string; className?: string; paragraphClassName?: string }) {
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!paragraphs.length) return null;

  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={paragraphClassName}>
          {renderLines(paragraph)}
        </p>
      ))}
    </div>
  );
}

function renderLines(paragraph: string): ReactNode {
  const lines = paragraph.split("\n");
  return lines.map((line, index) => (
    <Fragment key={index}>
      {renderInline(line)}
      {index < lines.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

export function renderInline(text: string): ReactNode {
  const parts = text.split(INLINE).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}
