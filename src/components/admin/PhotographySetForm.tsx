"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePhotographySet, savePhotographySet } from "@/lib/actions/photography";
import type { ContentStatus, MediaRef } from "@/lib/content/schema";
import type { PhotographySet } from "@/lib/data/types";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { ConfirmDialog } from "./ConfirmDialog";
import { MediaField } from "./MediaField";
import { useToast } from "./Toast";
import { Button, Card, Field, Input, Select, Textarea } from "./ui";

interface Props {
  set?: PhotographySet;
}

/** Create or edit one before/after photo set. Saving publishes immediately if status is Published. */
export function PhotographySetForm({ set }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [before, setBefore] = useState<MediaRef | null>(set?.before ?? null);
  const [after, setAfter] = useState<MediaRef | null>(set?.after ?? null);
  const [title, setTitle] = useState(set?.title ?? "");
  const [caption, setCaption] = useState(set?.caption ?? "");
  const [photographerCredit, setPhotographerCredit] = useState(set?.photographerCredit ?? "");
  const [retouchingCredit, setRetouchingCredit] = useState(set?.retouchingCredit ?? "");
  const [status, setStatus] = useState<ContentStatus>(set?.status ?? "draft");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = async () => {
    if (!before && !after) return toast("Add at least one image before saving.", "error");
    setBusy(true);
    const result = await savePhotographySet({ id: set?.id, title, caption, before, after, photographerCredit, retouchingCredit, status });
    setBusy(false);
    if (!result.ok) return toast(result.error, "error");
    toast(status === "published" ? "Saved and published" : "Saved");
    if (!set) router.push("/admin/photography");
    else router.refresh();
  };

  const remove = async () => {
    if (!set) return;
    setBusy(true);
    const result = await deletePhotographySet(set.id);
    setBusy(false);
    if (!result.ok) return toast(result.error, "error");
    toast("Photo set deleted");
    router.push("/admin/photography");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
      <div className="flex flex-col gap-6">
        <Card title="Images" description="Upload the original (before) and the retouched version (after).">
          <div className="grid gap-4 md:grid-cols-2">
            <MediaField label="Before" value={before} onChange={setBefore} />
            <MediaField label="After" value={after} onChange={setAfter} />
          </div>
          {before || after ? (
            <div className="mt-5">
              <p className="mb-2 text-[13px] font-medium text-neutral-700">Preview</p>
              <div className="max-w-md">
                <BeforeAfterSlider before={before} after={after} sizes="28rem" />
              </div>
            </div>
          ) : null}
        </Card>

        <Card title="Details">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title" htmlFor="title" className="md:col-span-2">
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Studio portrait, natural light" />
            </Field>
            <Field label="Caption" htmlFor="caption" className="md:col-span-2">
              <Textarea id="caption" rows={2} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Optional note shown in the viewer" />
            </Field>
            <Field label="Photographer credit" htmlFor="photographer">
              <Input id="photographer" value={photographerCredit} onChange={(e) => setPhotographerCredit(e.target.value)} placeholder="Sujin Lee" />
            </Field>
            <Field label="Retouching credit" htmlFor="retouching">
              <Input id="retouching" value={retouchingCredit} onChange={(e) => setRetouchingCredit(e.target.value)} placeholder="Sujin Lee" />
            </Field>
          </div>
        </Card>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-20">
        <Card>
          <Field label="Visibility" htmlFor="status">
            <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as ContentStatus)}>
              <option value="draft">Draft (not on the site)</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </Select>
          </Field>
          <Button variant="primary" onClick={save} loading={busy} className="mt-4 w-full" data-testid="save-set">
            {set ? "Save" : "Create photo set"}
          </Button>
          {set ? (
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} disabled={busy} className="mt-2 w-full">
              Delete photo set
            </Button>
          ) : null}
        </Card>
      </aside>

      <ConfirmDialog open={confirmDelete} title="Delete this photo set?" description="The images stay in the media library." confirmLabel="Delete" loading={busy} onConfirm={remove} onCancel={() => setConfirmDelete(false)} />
    </div>
  );
}
