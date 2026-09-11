"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { deleteMedia, getMediaUsage, updateMediaDetails, type MediaUsage } from "@/lib/actions/media";
import { mediaItemToRef } from "@/lib/data/mappers";
import type { MediaItem } from "@/lib/data/types";
import { mediaUrl } from "@/lib/media/url";
import { cn, formatBytes, formatDate } from "@/lib/utils";
import { ConfirmDialog } from "./ConfirmDialog";
import { MediaThumb } from "./MediaThumb";
import { MediaUploader } from "./MediaUploader";
import { useToast } from "./Toast";
import { IconClose, IconCopy, IconExternal } from "./icons";
import { Button, Field, Input, PageHeader } from "./ui";

type Filter = "all" | "image" | "video" | "pdf";

/** Browse, rename, copy links to, and delete uploaded files. */
export function MediaLibrary({ items: initial }: { items: MediaItem[] }) {
  const toast = useToast();
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [usage, setUsage] = useState<MediaUsage[] | null>(null);
  const [draft, setDraft] = useState({ title: "", altText: "" });
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  /** Opens the details panel for a file and looks up where it is used. */
  const select = (item: MediaItem) => {
    setSelectedId(item.id);
    setDraft({ title: item.title, altText: item.altText });
    setUsage(null);
    getMediaUsage(item.id).then((result) => setUsage(result.ok ? result.data : []));
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => (filter === "all" || i.kind === filter) && (!q || i.title.toLowerCase().includes(q) || (i.originalFilename ?? "").toLowerCase().includes(q)));
  }, [items, filter, query]);

  const saveDetails = async () => {
    if (!selected) return;
    setBusy(true);
    const result = await updateMediaDetails(selected.id, draft);
    setBusy(false);
    if (!result.ok) return toast(result.error, "error");
    setItems((list) => list.map((i) => (i.id === selected.id ? { ...i, title: draft.title, altText: draft.altText } : i)));
    toast("Details saved");
  };

  const copyUrl = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(mediaUrl(selected.path));
      toast("Link copied");
    } catch {
      toast("Could not copy. Use the Open link instead.", "error");
    }
  };

  const remove = async () => {
    if (!selected) return;
    setBusy(true);
    const result = await deleteMedia(selected.id);
    setBusy(false);
    setConfirmDelete(false);
    if (!result.ok) return toast(result.error, "error");
    setItems((list) => list.filter((i) => i.id !== selected.id));
    setSelectedId(null);
    toast("File deleted");
  };

  const counts = {
    all: items.length,
    image: items.filter((i) => i.kind === "image").length,
    video: items.filter((i) => i.kind === "video").length,
    pdf: items.filter((i) => i.kind === "pdf").length,
  };

  return (
    <>
      <PageHeader
        title="Media Library"
        description="Every image, video and PDF uploaded to the site."
        actions={
          <Button variant="primary" onClick={() => setShowUpload((v) => !v)}>
            {showUpload ? "Close uploader" : "Upload files"}
          </Button>
        }
      />
      {showUpload ? (
        <div className="mb-6">
          <MediaUploader kinds={["image", "video", "pdf"]} onUploaded={(m) => setItems((list) => [m.item, ...list])} />
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-md border border-neutral-200 bg-white p-1">
          {(["all", "image", "video", "pdf"] as Filter[]).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={cn("cursor-pointer rounded px-2.5 py-1 text-[13px] capitalize", filter === f ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100")}>
              {f === "all" ? "All" : f === "pdf" ? "PDFs" : `${f}s`} <span className="opacity-60">{counts[f]}</span>
            </button>
          ))}
        </div>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="max-w-xs" />
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 bg-white px-6 py-14 text-center text-sm text-neutral-500">Nothing here yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {visible.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => select(item)}
                className={cn("block w-full cursor-pointer overflow-hidden rounded-md border bg-white text-left", selectedId === item.id ? "border-neutral-900 ring-2 ring-neutral-900/20" : "border-neutral-200 hover:border-neutral-400")}
                data-testid="media-card"
              >
                <MediaThumb media={mediaItemToRef(item)} className="aspect-square w-full" />
                <span className="block truncate px-2 pt-1.5 text-xs text-neutral-800">{item.title || item.originalFilename || "Untitled"}</span>
                <span className="block truncate px-2 pb-1.5 text-[11px] text-neutral-400">{formatBytes(item.sizeBytes)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected ? (
        <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-xl" aria-label="File details">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
            <h2 className="text-sm font-semibold">File details</h2>
            <button type="button" onClick={() => setSelectedId(null)} aria-label="Close" className="cursor-pointer rounded p-1 text-neutral-500 hover:bg-neutral-100">
              <IconClose />
            </button>
          </div>
          <div className="flex flex-col gap-4 p-5">
            {selected.kind === "pdf" ? (
              <a href={mediaUrl(selected.path)} target="_blank" rel="noopener noreferrer" className="flex h-40 items-center justify-center rounded border border-neutral-200 bg-neutral-50 text-sm text-neutral-600 underline">
                Open PDF
              </a>
            ) : (
              <MediaThumb media={mediaItemToRef(selected)} className="aspect-[4/3] w-full rounded" sizes="400px" />
            )}
            <dl className="grid grid-cols-[6rem_1fr] gap-y-1 text-xs text-neutral-600">
              <dt>File</dt>
              <dd className="truncate">{selected.originalFilename ?? selected.path}</dd>
              <dt>Type</dt>
              <dd>{selected.mimeType}</dd>
              <dt>Size</dt>
              <dd>{formatBytes(selected.sizeBytes)}</dd>
              {selected.width && selected.height ? (
                <>
                  <dt>Dimensions</dt>
                  <dd>
                    {selected.width} × {selected.height}
                  </dd>
                </>
              ) : null}
              <dt>Uploaded</dt>
              <dd>{formatDate(selected.createdAt)}</dd>
            </dl>
            <Field label="Display title" htmlFor="media-title">
              <Input id="media-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </Field>
            {selected.kind === "image" ? (
              <Field label="Default alt text" htmlFor="media-alt" hint="Used when an image is added somewhere new.">
                <Input id="media-alt" value={draft.altText} onChange={(e) => setDraft({ ...draft, altText: e.target.value })} />
              </Field>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={saveDetails} loading={busy}>
                Save details
              </Button>
              <Button size="sm" onClick={copyUrl}>
                <IconCopy width={14} height={14} /> Copy URL
              </Button>
              <a href={mediaUrl(selected.path)} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1 rounded-md border border-neutral-300 px-3 text-[13px] font-medium hover:border-neutral-500">
                Open <IconExternal width={12} height={12} />
              </a>
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <p className="text-[13px] font-medium text-neutral-700">Used in</p>
              {usage === null ? (
                <p className="mt-1 text-xs text-neutral-500">Checking…</p>
              ) : usage.length === 0 ? (
                <p className="mt-1 text-xs text-neutral-500">Not used anywhere. Safe to delete.</p>
              ) : (
                <ul className="mt-1 flex flex-col gap-1 text-xs">
                  {usage.map((u, i) => (
                    <li key={i}>
                      <Link href={u.href} className="text-neutral-800 underline underline-offset-2">
                        {u.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} className="self-start" data-testid="delete-media">
              Delete file
            </Button>
          </div>
        </aside>
      ) : null}

      <ConfirmDialog
        open={confirmDelete}
        title={usage && usage.length ? "This file is in use. Delete anyway?" : "Delete this file?"}
        description={
          usage && usage.length ? (
            <>
              <p>It will be removed from:</p>
              <ul className="mt-1 list-disc pl-5">
                {usage.map((u, i) => (
                  <li key={i}>{u.label}</li>
                ))}
              </ul>
              <p className="mt-2">Those places will show an empty image slot until you add a replacement.</p>
            </>
          ) : (
            "The file is permanently removed from storage."
          )
        }
        confirmLabel="Delete file"
        loading={busy}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
