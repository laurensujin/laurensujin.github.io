"use client";

import { useState } from "react";
import { deleteResume, setActiveResume } from "@/lib/actions/resume";
import type { ResumeFile } from "@/lib/data/types";
import { uploadResumeFile } from "@/lib/media/upload";
import { mediaUrl } from "@/lib/media/url";
import { cn, formatBytes, formatDate } from "@/lib/utils";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import { IconExternal, IconUpload } from "./icons";
import { Badge, Button, Card, PageHeader } from "./ui";

/** Upload, replace, preview and delete resume PDFs. The active one is linked from the profile drawer. */
export function ResumeManager({ files: initial }: { files: ResumeFile[] }) {
  const toast = useToast();
  const [files, setFiles] = useState(initial);
  const [progress, setProgress] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ResumeFile | null>(null);
  const active = files.find((f) => f.isActive) ?? null;

  const upload = async (file: File) => {
    setProgress(0);
    try {
      const created = await uploadResumeFile(file, setProgress);
      setFiles((list) => [created, ...list.map((f) => ({ ...f, isActive: false }))]);
      toast("Resume uploaded and set as current");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Upload failed", "error");
    } finally {
      setProgress(null);
    }
  };

  const makeActive = async (file: ResumeFile) => {
    setBusy(true);
    const result = await setActiveResume(file.id);
    setBusy(false);
    if (!result.ok) return toast(result.error, "error");
    setFiles((list) => list.map((f) => ({ ...f, isActive: f.id === file.id })));
    toast("Current resume updated");
  };

  const remove = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    const result = await deleteResume(pendingDelete.id);
    setBusy(false);
    if (!result.ok) return toast(result.error, "error");
    setFiles((list) => list.filter((f) => f.id !== pendingDelete.id));
    setPendingDelete(null);
    toast("PDF deleted");
  };

  return (
    <>
      <PageHeader title="Resume" description="The current PDF is what the Resume link in the profile drawer opens." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Card title={active ? "Replace resume" : "Upload resume"}>
            <label
              className={cn("flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center hover:border-neutral-500", progress !== null && "pointer-events-none opacity-60")}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) void upload(file);
              }}
            >
              <IconUpload className="text-neutral-500" width={22} height={22} />
              <span className="text-sm text-neutral-700">
                <span className="font-medium text-neutral-900 underline underline-offset-2">Choose a PDF</span> or drag it here
              </span>
              <span className="text-xs text-neutral-500">It becomes the current resume right away.</span>
              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                data-testid="resume-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file);
                  e.target.value = "";
                }}
              />
            </label>
            {progress !== null ? (
              <div className="mt-3">
                <div className="h-1 overflow-hidden rounded bg-neutral-200">
                  <div className="h-full bg-neutral-900 transition-[width]" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-neutral-500">Uploading… {progress}%</p>
              </div>
            ) : null}
          </Card>

          <Card title="All uploaded PDFs">
            {files.length === 0 ? (
              <p className="text-sm text-neutral-500">No resume uploaded yet. The Resume link stays hidden until you add one.</p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {files.map((file) => (
                  <li key={file.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-sm text-neutral-900">
                        {file.filename}
                        {file.isActive ? <Badge tone="green">Current</Badge> : null}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatBytes(file.sizeBytes)} · {formatDate(file.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <a href={mediaUrl(file.path)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[13px] text-neutral-600 hover:bg-neutral-100">
                        Open <IconExternal width={12} height={12} />
                      </a>
                      {!file.isActive ? (
                        <Button size="sm" onClick={() => makeActive(file)} disabled={busy}>
                          Make current
                        </Button>
                      ) : null}
                      <Button size="sm" variant="ghost" className="text-red-700" onClick={() => setPendingDelete(file)} disabled={busy}>
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card title="Preview">
          {active ? (
            <iframe src={mediaUrl(active.path)} title={active.filename} className="h-[70vh] w-full rounded border border-neutral-200 bg-white" />
          ) : (
            <p className="text-sm text-neutral-500">Upload a PDF to preview it here.</p>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this PDF?"
        description={pendingDelete?.isActive ? "This is the current resume. The Resume link disappears from the site until you upload or choose another one." : "The file is removed from storage."}
        confirmLabel="Delete"
        loading={busy}
        onConfirm={remove}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
