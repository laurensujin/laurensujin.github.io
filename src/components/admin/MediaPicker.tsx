"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { listMediaAction } from "@/lib/actions/media";
import type { MediaRef } from "@/lib/content/schema";
import { mediaItemToRef } from "@/lib/data/mappers";
import type { MediaItem } from "@/lib/data/types";
import type { MediaKind, UploadedMedia } from "@/lib/media/upload";
import { cn, formatBytes } from "@/lib/utils";
import { IconCheck, IconClose } from "./icons";
import { MediaThumb } from "./MediaThumb";
import { MediaUploader } from "./MediaUploader";
import { Button, Input } from "./ui";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called with each chosen item (may be called several times when `multiple`). */
  onSelect: (refs: MediaRef[]) => void;
  multiple?: boolean;
  kinds?: MediaKind[];
  initialTab?: "upload" | "library";
}

/** Modal with two tabs: upload new files, or pick from everything uploaded before. */
export function MediaPicker({ open, onClose, ...rest }: Props) {
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
      className="m-auto h-[min(44rem,calc(100vh-2rem))] w-[min(60rem,calc(100vw-2rem))] rounded-lg border border-neutral-200 bg-white p-0 shadow-xl backdrop:bg-neutral-900/40"
    >
      {/* Mounted only while open, so every opening starts with fresh state. */}
      {open ? <PickerBody onClose={onClose} {...rest} /> : null}
    </dialog>
  );
}

function PickerBody({ onClose, onSelect, multiple = false, kinds = ["image"], initialTab = "upload" }: Omit<Props, "open">) {
  const [tab, setTab] = useState<"upload" | "library">(initialTab);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const loading = tab === "library" && items === null;

  // Load the library the first time that tab is shown.
  useEffect(() => {
    if (tab !== "library" || items !== null) return;
    let cancelled = false;
    listMediaAction().then((result) => {
      if (!cancelled) setItems(result.ok ? result.data : []);
    });
    return () => {
      cancelled = true;
    };
  }, [tab, items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter((m) => kinds.includes(m.kind) && (!q || m.title.toLowerCase().includes(q) || (m.originalFilename ?? "").toLowerCase().includes(q)));
  }, [items, kinds, query]);

  const handleUploaded = (uploaded: UploadedMedia) => {
    setItems((list) => (list ? [uploaded.item, ...list] : list));
    onSelect([uploaded.ref]);
    if (multiple) setUploadedCount((n) => n + 1);
    else onClose();
  };

  const toggle = (item: MediaItem) => {
    if (!multiple) {
      onSelect([mediaItemToRef(item)]);
      onClose();
      return;
    }
    setSelected((list) => (list.includes(item.id) ? list.filter((id) => id !== item.id) : [...list, item.id]));
  };

  const useSelected = () => {
    const refs = (items ?? []).filter((m) => selected.includes(m.id)).map(mediaItemToRef);
    if (refs.length) onSelect(refs);
    onClose();
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
        <div className="flex gap-1" role="tablist">
          {(["upload", "library"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn("cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium", tab === t ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100")}
            >
              {t === "upload" ? "Upload new" : "Media library"}
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900">
          <IconClose />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        {tab === "upload" ? (
          <div className="mx-auto max-w-xl">
            <MediaUploader kinds={kinds} multiple={multiple} onUploaded={handleUploaded} />
            {multiple && uploadedCount ? (
              <p className="mt-4 text-center text-sm text-neutral-600">
                {uploadedCount} file{uploadedCount === 1 ? "" : "s"} added. Upload more or close this window.
              </p>
            ) : null}
          </div>
        ) : (
          <>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title or filename" className="mb-4 max-w-sm" />
            {loading ? (
              <p className="text-sm text-neutral-500">Loading…</p>
            ) : visible.length === 0 ? (
              <p className="text-sm text-neutral-500">Nothing here yet. Upload something from the first tab.</p>
            ) : (
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {visible.map((item) => {
                  const isSelected = selected.includes(item.id);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => toggle(item)}
                        className={cn("group relative block w-full cursor-pointer overflow-hidden rounded-md border text-left", isSelected ? "border-neutral-900 ring-2 ring-neutral-900/20" : "border-neutral-200 hover:border-neutral-400")}
                        aria-pressed={multiple ? isSelected : undefined}
                        data-testid="picker-item"
                      >
                        <MediaThumb media={mediaItemToRef(item)} className="aspect-square w-full" />
                        {isSelected ? (
                          <span className="absolute right-1.5 top-1.5 rounded-full bg-neutral-900 p-0.5 text-white">
                            <IconCheck width={12} height={12} />
                          </span>
                        ) : null}
                        <span className="block truncate px-2 py-1.5 text-xs text-neutral-700">{item.title || item.originalFilename || "Untitled"}</span>
                        <span className="block truncate px-2 pb-1.5 text-[11px] text-neutral-400">
                          {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                          {formatBytes(item.sizeBytes)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>

      <footer className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-3">
        <Button onClick={onClose}>{multiple && uploadedCount ? "Done" : "Cancel"}</Button>
        {tab === "library" && multiple ? (
          <Button variant="primary" onClick={useSelected} disabled={!selected.length}>
            Use {selected.length ? `${selected.length} selected` : "selected"}
          </Button>
        ) : null}
      </footer>
    </div>
  );
}
