"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { acceptFor, uploadMediaFile, type MediaKind, type UploadedMedia } from "@/lib/media/upload";
import { cn } from "@/lib/utils";
import { IconUpload } from "./icons";

interface Upload {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
}

interface Props {
  kinds?: MediaKind[];
  multiple?: boolean;
  compact?: boolean;
  onUploaded: (media: UploadedMedia) => void;
  className?: string;
}

/**
 * Drag-and-drop / click-to-upload area with a progress bar per file.
 * Each finished file is reported through `onUploaded` as soon as it is done.
 */
export function MediaUploader({ kinds = ["image"], multiple = true, compact, onUploaded, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputId = useId();

  const update = (id: string, patch: Partial<Upload>) =>
    setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    const chosen = multiple ? list : list.slice(0, 1);

    // Upload sequentially: simpler progress reporting and gentler on slow connections.
    for (const file of chosen) {
      const id = `${Date.now()}-${Math.random()}`;
      setUploads((all) => [...all, { id, name: file.name, progress: 0, status: "uploading" }]);
      try {
        const uploaded = await uploadMediaFile(file, (progress) => update(id, { progress }));
        update(id, { progress: 100, status: "done" });
        onUploaded(uploaded);
        window.setTimeout(() => setUploads((all) => all.filter((u) => u.id !== id)), 1500);
      } catch (error) {
        update(id, { status: "error", error: error instanceof Error ? error.message : "Upload failed." });
      }
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    void handleFiles(event.dataTransfer.files);
  };

  const label = kinds.includes("pdf") && kinds.length === 1 ? "PDF" : kinds.includes("video") ? "images or videos" : "images";

  return (
    <div className={className}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed text-center transition-colors",
          compact ? "gap-1 px-3 py-4" : "gap-2 px-6 py-10",
          dragging ? "border-neutral-900 bg-neutral-100" : "border-neutral-300 bg-neutral-50",
        )}
      >
        <IconUpload className="text-neutral-500" width={compact ? 16 : 22} height={compact ? 16 : 22} />
        <label htmlFor={inputId} className="cursor-pointer text-sm text-neutral-700">
          <span className="font-medium text-neutral-900 underline underline-offset-2">Choose {label}</span> or drag them here
        </label>
        {!compact ? <p className="text-xs text-neutral-500">Large images are resized to {3000} px. Up to 50 MB per file.</p> : null}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={acceptFor(kinds)}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {uploads.length ? (
        <ul className="mt-3 flex flex-col gap-2" aria-live="polite">
          {uploads.map((u) => (
            <li key={u.id} className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-neutral-800">{u.name}</span>
                <span className={cn("shrink-0", u.status === "error" ? "text-red-600" : "text-neutral-500")}>
                  {u.status === "error" ? "Failed" : u.status === "done" ? "Done" : `${u.progress}%`}
                </span>
              </div>
              {u.status === "error" ? (
                <p className="mt-1 text-red-600">{u.error}</p>
              ) : (
                <div className="mt-2 h-1 overflow-hidden rounded bg-neutral-200">
                  <div className="h-full bg-neutral-900 transition-[width] duration-200" style={{ width: `${u.progress}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
