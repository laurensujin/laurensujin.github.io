"use client";

import Link from "next/link";
import { useState } from "react";
import { deletePhotographySet, reorderPhotographySets, setPhotographySetStatus } from "@/lib/actions/photography";
import type { PhotographySet } from "@/lib/data/types";
import { ConfirmDialog } from "./ConfirmDialog";
import { MediaThumb } from "./MediaThumb";
import { DragHandle, SortableList } from "./SortableList";
import { useToast } from "./Toast";
import { IconPlus } from "./icons";
import { Button, ButtonLink, EmptyState, PageHeader, StatusBadge, Toggle } from "./ui";

export function PhotographyList({ sets: initial }: { sets: PhotographySet[] }) {
  const toast = useToast();
  const [sets, setSets] = useState(initial);
  const [pendingDelete, setPendingDelete] = useState<PhotographySet | null>(null);
  const [busy, setBusy] = useState(false);

  const reorder = async (next: PhotographySet[]) => {
    const previous = sets;
    setSets(next);
    const result = await reorderPhotographySets(next.map((s) => s.id));
    if (!result.ok) {
      setSets(previous);
      toast(result.error, "error");
    } else toast("Order saved");
  };

  const togglePublished = async (set: PhotographySet, value: boolean) => {
    const status = value ? "published" : "draft";
    setSets((list) => list.map((s) => (s.id === set.id ? { ...s, status } : s)));
    const result = await setPhotographySetStatus(set.id, status);
    if (!result.ok) {
      setSets((list) => list.map((s) => (s.id === set.id ? { ...s, status: set.status } : s)));
      toast(result.error, "error");
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    const result = await deletePhotographySet(pendingDelete.id);
    setBusy(false);
    if (!result.ok) return toast(result.error, "error");
    setSets((list) => list.filter((s) => s.id !== pendingDelete.id));
    setPendingDelete(null);
    toast("Photo set deleted");
  };

  return (
    <>
      <PageHeader
        title="Photography"
        description="Before / after sets for the Portrait section. Drag to reorder."
        actions={
          <ButtonLink href="/admin/photography/new/" variant="primary">
            <IconPlus /> Add Photo Set
          </ButtonLink>
        }
      />
      {sets.length === 0 ? (
        <EmptyState title="No photo sets yet" description="Add a before and after pair to show the Portrait section on the homepage." action={<ButtonLink href="/admin/photography/new/" variant="primary">Add Photo Set</ButtonLink>} />
      ) : (
        <SortableList
          items={sets}
          onChange={reorder}
          className="flex flex-col gap-2"
          renderItem={(set, _index, handle) => (
            <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3" data-testid="photo-row">
              <DragHandle handle={handle} />
              <div className="flex shrink-0 gap-1">
                <MediaThumb media={set.before} className="h-14 w-11 rounded" />
                <MediaThumb media={set.after} className="h-14 w-11 rounded" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/photography/edit/?id=${set.id}`} className="truncate text-sm font-medium text-neutral-900 hover:underline">
                    {set.title || "Untitled photo set"}
                  </Link>
                  <StatusBadge status={set.status} />
                </div>
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  {[set.photographerCredit && `Photo: ${set.photographerCredit}`, set.retouchingCredit && `Retouch: ${set.retouchingCredit}`].filter(Boolean).join(" · ") || "No credits"}
                  {!set.before || !set.after ? " · missing an image" : ""}
                </p>
              </div>
              <div className="hidden md:block">
                <Toggle checked={set.status === "published"} onChange={(value) => togglePublished(set, value)} label="Published" />
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link href={`/admin/photography/edit/?id=${set.id}`} className="rounded-md border border-neutral-300 px-3 py-1.5 text-[13px] font-medium hover:border-neutral-500">
                  Edit
                </Link>
                <Button size="sm" variant="ghost" className="text-red-700" onClick={() => setPendingDelete(set)}>
                  Delete
                </Button>
              </div>
            </div>
          )}
        />
      )}
      <ConfirmDialog open={pendingDelete !== null} title="Delete this photo set?" description="The images stay in the media library." confirmLabel="Delete" loading={busy} onConfirm={remove} onCancel={() => setPendingDelete(null)} />
    </>
  );
}
