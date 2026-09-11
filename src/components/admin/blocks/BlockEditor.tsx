"use client";

import { useEffect, useRef, useState } from "react";
import { BLOCK_DEFINITIONS, blockLabel, createBlock } from "@/lib/content/blocks";
import { isRenderable } from "@/lib/content/renderable";
import type { Block, BlockType } from "@/lib/content/schema";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "../ConfirmDialog";
import { DragHandle, SortableList } from "../SortableList";
import { IconChevron, IconClose, IconDown, IconPlus, IconTrash, IconUp } from "../icons";
import { Button } from "../ui";
import { BlockFields } from "./BlockFields";

interface Props {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

/** One-line description of a block for its collapsed header. */
function summary(block: Block): string {
  switch (block.type) {
    case "heading":
      return [block.eyebrow, block.text].filter(Boolean).join("  ");
    case "paragraph":
    case "quote":
    case "caption":
      return block.text.replace(/\s+/g, " ").slice(0, 90);
    case "image_large":
    case "image_full":
      return block.caption || (block.media ? "1 image" : "No image yet");
    case "image_two_column":
    case "image_grid":
    case "moodboard": {
      const n = block.images.filter((i) => i.media).length;
      return `${n} image${n === 1 ? "" : "s"}`;
    }
    case "image_sequence":
      return block.steps.map((s) => s.label).filter(Boolean).join(" → ");
    case "before_after":
      return block.before && block.after ? "Before and after set" : "Add both images";
    case "video":
      return block.media ? "Uploaded video" : block.url || "No video yet";
    case "stats":
      return block.items.map((i) => i.label).filter(Boolean).join(", ");
    case "timeline":
      return block.items.map((i) => i.label || i.title).filter(Boolean).join(", ");
    case "process":
      return `${block.steps.length} steps`;
    case "fragrance":
      return block.name;
    case "link":
      return block.label || block.url;
    case "role_tools":
      return `${block.role.length} role items`;
    case "spacer":
      return block.size;
  }
}

/**
 * The case-study builder: an ordered list of content blocks that can be
 * added, edited, collapsed, reordered (drag, keyboard, or arrows) and removed.
 */
export function BlockEditor({ blocks, onChange }: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(blocks.map((b) => b.id)));
  const [menu, setMenu] = useState<{ insertAt: number } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Block | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);

  const toggle = (id: string) =>
    setCollapsed((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const insert = (type: BlockType, at: number) => {
    const block = createBlock(type);
    const next = [...blocks];
    next.splice(at, 0, block);
    onChange(next);
    setMenu(null);
    setHighlight(block.id);
    window.setTimeout(() => setHighlight(null), 1500);
  };

  const remove = (block: Block) => {
    onChange(blocks.filter((b) => b.id !== block.id));
    setPendingDelete(null);
  };

  const move = (index: number, delta: number) => {
    const to = index + delta;
    if (to < 0 || to >= blocks.length) return;
    const next = [...blocks];
    const [item] = next.splice(index, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {blocks.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500">
          No sections yet. Add a heading, some text, or images to start the case study.
        </p>
      ) : null}

      <SortableList
        items={blocks}
        onChange={onChange}
        className="flex flex-col gap-3"
        renderItem={(block, index, handle, isDragging) => {
          const isCollapsed = collapsed.has(block.id);
          return (
            <div
              className={cn(
                "rounded-lg border bg-white transition-shadow",
                isDragging ? "border-neutral-400 shadow-lg" : "border-neutral-200",
                highlight === block.id && "ring-2 ring-neutral-900/30",
              )}
              data-block-type={block.type}
            >
              <div className="flex items-center gap-1 px-2 py-1.5">
                <DragHandle handle={handle} />
                <button
                  type="button"
                  onClick={() => toggle(block.id)}
                  aria-expanded={!isCollapsed}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded px-1 py-1 text-left hover:bg-neutral-50"
                >
                  <IconChevron className={cn("shrink-0 text-neutral-400 transition-transform", isCollapsed ? "-rotate-90" : "")} />
                  <span className="shrink-0 text-[13px] font-medium text-neutral-900">{blockLabel(block.type)}</span>
                  <span className="truncate text-xs text-neutral-500">{summary(block)}</span>
                </button>
                <div className="flex shrink-0 items-center">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move section up" className="cursor-pointer rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800 disabled:cursor-default disabled:opacity-30">
                    <IconUp />
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === blocks.length - 1} aria-label="Move section down" className="cursor-pointer rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800 disabled:cursor-default disabled:opacity-30">
                    <IconDown />
                  </button>
                  <button type="button" onClick={() => setMenu({ insertAt: index + 1 })} aria-label="Insert section below" title="Insert section below" className="cursor-pointer rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800">
                    <IconPlus />
                  </button>
                  <button
                    type="button"
                    onClick={() => (isRenderable(block) && block.type !== "spacer" ? setPendingDelete(block) : remove(block))}
                    aria-label="Delete section"
                    title="Delete section"
                    className="cursor-pointer rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-700"
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
              {!isCollapsed ? (
                <div className="border-t border-neutral-100 px-4 py-4">
                  <BlockFields block={block} onChange={(updated) => onChange(blocks.map((b) => (b.id === updated.id ? updated : b)))} />
                </div>
              ) : null}
            </div>
          );
        }}
      />

      <Button variant="primary" onClick={() => setMenu({ insertAt: blocks.length })} className="self-start">
        <IconPlus /> Add section
      </Button>

      <BlockTypeMenu open={menu !== null} onClose={() => setMenu(null)} onPick={(type) => menu && insert(type, menu.insertAt)} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this section?"
        description={pendingDelete ? `The ${blockLabel(pendingDelete.type).toLowerCase()} and its content will be removed from the draft.` : undefined}
        confirmLabel="Delete"
        onConfirm={() => pendingDelete && remove(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

const GROUPS = ["Images", "Text", "Structure"] as const;

function BlockTypeMenu({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (type: BlockType) => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="m-auto w-[min(48rem,calc(100vw-2rem))] rounded-lg border border-neutral-200 bg-white p-0 shadow-xl backdrop:bg-neutral-900/40"
    >
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
        <h2 className="text-sm font-semibold">Add a section</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer rounded p-1 text-neutral-500 hover:bg-neutral-100">
          <IconClose />
        </button>
      </div>
      <div className="grid gap-6 p-5 md:grid-cols-3">
        {GROUPS.map((group) => (
          <div key={group}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{group}</p>
            <ul className="flex flex-col gap-1">
              {BLOCK_DEFINITIONS.filter((d) => d.group === group).map((def) => (
                <li key={def.type}>
                  <button type="button" onClick={() => onPick(def.type)} className="w-full cursor-pointer rounded-md px-2.5 py-2 text-left hover:bg-neutral-100">
                    <span className="block text-sm font-medium text-neutral-900">{def.label}</span>
                    <span className="block text-xs text-neutral-500">{def.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </dialog>
  );
}
