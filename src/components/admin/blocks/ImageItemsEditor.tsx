"use client";

import { useState } from "react";
import type { ImageItem } from "@/lib/content/schema";
import { newImageItem } from "@/lib/content/blocks";
import { MediaPicker } from "../MediaPicker";
import { MediaThumb } from "../MediaThumb";
import { DragHandle, SortableList } from "../SortableList";
import { IconTrash } from "../icons";
import { Button, Input } from "../ui";

interface Props {
  items: ImageItem[];
  onChange: (items: ImageItem[]) => void;
  max?: number;
  withTag?: boolean;
}

/**
 * Gallery editor used by grids, two-column blocks, moodboards and fragrance
 * references: add many images at once, drag to reorder, caption each one.
 */
export function ImageItemsEditor({ items, onChange, max, withTag = true }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [replacing, setReplacing] = useState<string | null>(null);
  const canAdd = !max || items.length < max;

  const update = (id: string, patch: Partial<ImageItem>) => onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  return (
    <div className="flex flex-col gap-3">
      {items.length ? (
        <SortableList
          items={items}
          onChange={onChange}
          layout="grid"
          className="grid grid-cols-2 gap-3 md:grid-cols-3"
          renderItem={(item, _index, handle) => (
            <div className="flex flex-col gap-2 rounded-md border border-neutral-200 bg-white p-2">
              <div className="flex items-center justify-between">
                <DragHandle handle={handle} />
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReplacing(item.id);
                      setPickerOpen(true);
                    }}
                  >
                    {item.media ? "Replace" : "Add image"}
                  </Button>
                  <button type="button" onClick={() => onChange(items.filter((i) => i.id !== item.id))} aria-label="Remove image" className="cursor-pointer rounded p-1 text-neutral-500 hover:bg-red-50 hover:text-red-700">
                    <IconTrash width={14} height={14} />
                  </button>
                </div>
              </div>
              <MediaThumb media={item.media} className="aspect-[4/5] w-full rounded" />
              {item.media?.kind === "image" ? (
                <Input value={item.media.alt} onChange={(e) => update(item.id, { media: item.media ? { ...item.media, alt: e.target.value } : null })} placeholder="Alt text" aria-label="Alt text" className="text-xs" />
              ) : null}
              <Input value={item.caption} onChange={(e) => update(item.id, { caption: e.target.value })} placeholder="Caption (optional)" aria-label="Caption" className="text-xs" />
              {withTag ? <Input value={item.tag} onChange={(e) => update(item.id, { tag: e.target.value })} placeholder="Label, e.g. Design Concept" aria-label="Label" className="text-xs" /> : null}
            </div>
          )}
        />
      ) : null}

      {canAdd ? (
        <Button
          size="sm"
          onClick={() => {
            setReplacing(null);
            setPickerOpen(true);
          }}
          className="self-start"
        >
          Add images
        </Button>
      ) : null}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        multiple={!replacing && (!max || max - items.length > 1)}
        onSelect={(refs) => {
          if (replacing) {
            update(replacing, { media: refs[0] ?? null });
            return;
          }
          const room = max ? Math.max(0, max - items.length) : refs.length;
          const additions = refs.slice(0, room).map((media) => newImageItem({ media }));
          onChange([...items, ...additions]);
        }}
      />
    </div>
  );
}
