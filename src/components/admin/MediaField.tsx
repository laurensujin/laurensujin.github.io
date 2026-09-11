"use client";

import { useState, type ReactNode } from "react";
import type { MediaRef } from "@/lib/content/schema";
import type { MediaKind } from "@/lib/media/upload";
import { refUrl } from "@/lib/media/url";
import { cn } from "@/lib/utils";
import { IconExternal } from "./icons";
import { MediaPicker } from "./MediaPicker";
import { MediaThumb } from "./MediaThumb";
import { MediaUploader } from "./MediaUploader";
import { Button, Input } from "./ui";

interface Props {
  label?: ReactNode;
  value: MediaRef | null;
  onChange: (value: MediaRef | null) => void;
  kinds?: MediaKind[];
  /** Show an alt text input (images only). */
  withAlt?: boolean;
  caption?: { value: string; onChange: (value: string) => void; placeholder?: string };
  tag?: { value: string; onChange: (value: string) => void };
  hint?: ReactNode;
  className?: string;
  thumbClassName?: string;
}

/**
 * One image/video slot: upload straight into it, pick from the library,
 * replace, remove, and edit its alt text (and caption when provided).
 */
export function MediaField({ label, value, onChange, kinds = ["image"], withAlt = true, caption, tag, hint, className, thumbClassName }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<"upload" | "library">("library");

  const openPicker = (tab: "upload" | "library") => {
    setPickerTab(tab);
    setPickerOpen(true);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? <span className="text-[13px] font-medium text-neutral-700">{label}</span> : null}

      {value ? (
        <div className="flex gap-4 rounded-md border border-neutral-200 bg-white p-3">
          <MediaThumb media={value} className={cn("h-28 w-28 shrink-0 rounded", thumbClassName)} />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {withAlt && value.kind === "image" ? (
              <Input
                value={value.alt}
                onChange={(e) => onChange({ ...value, alt: e.target.value })}
                placeholder="Alt text (describe the image for screen readers and search)"
                aria-label="Alt text"
              />
            ) : null}
            {caption ? <Input value={caption.value} onChange={(e) => caption.onChange(e.target.value)} placeholder={caption.placeholder ?? "Caption (optional)"} aria-label="Caption" /> : null}
            {tag ? <Input value={tag.value} onChange={(e) => tag.onChange(e.target.value)} placeholder="Small label, e.g. Design Concept (optional)" aria-label="Label" /> : null}
            <div className="mt-auto flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={() => openPicker("upload")}>
                Replace
              </Button>
              <Button size="sm" variant="ghost" onClick={() => openPicker("library")}>
                Choose from library
              </Button>
              <a href={refUrl(value) ?? "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900">
                Open <IconExternal width={12} height={12} />
              </a>
              <Button size="sm" variant="ghost" className="ml-auto text-red-700" onClick={() => onChange(null)}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <MediaUploader compact kinds={kinds} multiple={false} onUploaded={(m) => onChange(m.ref)} />
          <button type="button" onClick={() => openPicker("library")} className="cursor-pointer self-start text-xs text-neutral-600 underline underline-offset-2 hover:text-neutral-900">
            or choose from the media library
          </button>
        </div>
      )}
      {hint ? <p className="text-xs text-neutral-500">{hint}</p> : null}

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(refs) => onChange(refs[0] ?? null)} kinds={kinds} initialTab={pickerTab} />
    </div>
  );
}
