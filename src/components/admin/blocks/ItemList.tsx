"use client";

import type { ReactNode } from "react";
import { IconDown, IconTrash, IconUp } from "../icons";
import { Button } from "../ui";

interface Props<T extends { id: string }> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  addLabel: string;
  create: () => T;
  max?: number;
  empty?: ReactNode;
}

/** Simple editable list with move up/down, remove and add. */
export function ItemList<T extends { id: string }>({ items, onChange, renderItem, addLabel, create, max, empty }: Props<T>) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {items.length === 0 && empty ? <p className="text-xs text-neutral-500">{empty}</p> : null}
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-2">
          <div className="min-w-0 flex-1">{renderItem(item, (patch) => onChange(items.map((i) => (i.id === item.id ? { ...i, ...patch } : i))), index)}</div>
          <div className="flex shrink-0 flex-col gap-0.5">
            <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label="Move up" className="cursor-pointer rounded p-1 text-neutral-500 hover:bg-neutral-200 disabled:cursor-default disabled:opacity-30">
              <IconUp width={14} height={14} />
            </button>
            <button type="button" onClick={() => move(index, index + 1)} disabled={index === items.length - 1} aria-label="Move down" className="cursor-pointer rounded p-1 text-neutral-500 hover:bg-neutral-200 disabled:cursor-default disabled:opacity-30">
              <IconDown width={14} height={14} />
            </button>
            <button type="button" onClick={() => onChange(items.filter((i) => i.id !== item.id))} aria-label="Remove" className="cursor-pointer rounded p-1 text-neutral-500 hover:bg-red-50 hover:text-red-700">
              <IconTrash width={14} height={14} />
            </button>
          </div>
        </div>
      ))}
      {!max || items.length < max ? (
        <Button size="sm" onClick={() => onChange([...items, create()])} className="self-start">
          {addLabel}
        </Button>
      ) : null}
    </div>
  );
}
