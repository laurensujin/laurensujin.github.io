import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  /** Uppercase label on the left, e.g. "Selected work". */
  label: string;
  /** Quiet counterpart on the right, e.g. a count. */
  meta?: ReactNode;
  /** Optional larger line and supporting copy under the rule. */
  title?: string;
  description?: string;
  id?: string;
  className?: string;
}

/**
 * The one section opener used across the site: a hairline rule, a label and
 * an optional count. Repeating it is what gives the pages their structure.
 */
export function SectionHeader({ label, meta, title, description, id, className }: Props) {
  return (
    <div className={cn("border-t border-line pt-4", className)}>
      <div className="flex items-baseline justify-between gap-6">
        <h2 id={id} className="eyebrow text-fg">
          {label}
        </h2>
        {meta ? <span className="eyebrow tabular-nums">{meta}</span> : null}
      </div>
      {title ? <p className="t-display-sm mt-6 max-w-[24ch] text-fg">{title}</p> : null}
      {description ? <p className="t-body measure mt-3 text-fg-muted">{description}</p> : null}
    </div>
  );
}
