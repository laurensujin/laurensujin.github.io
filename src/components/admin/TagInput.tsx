"use client";

import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { IconClose } from "./icons";

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  id?: string;
}

/** Chips input: type a value and press Enter or comma. Backspace removes the last chip. */
export function TagInput({ value, onChange, placeholder = "Type and press Enter", id }: Props) {
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const items = raw
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s && !value.includes(s));
    if (items.length) onChange([...value, ...items]);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit(draft);
    } else if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className={cn("flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2 py-1.5 focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10")}>
      {value.map((item, index) => (
        <span key={`${item}-${index}`} className="inline-flex items-center gap-1 rounded bg-neutral-100 py-0.5 pl-2 pr-1 text-[13px] text-neutral-800">
          {item}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            aria-label={`Remove ${item}`}
            className="cursor-pointer rounded p-0.5 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"
          >
            <IconClose width={12} height={12} />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => draft.trim() && commit(draft)}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text");
          if (text.includes(",") || text.includes("\n")) {
            e.preventDefault();
            commit(text);
          }
        }}
        placeholder={value.length ? "" : placeholder}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-neutral-400"
      />
    </div>
  );
}
