"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createProject, deleteProject, duplicateProject, reorderProjects, setProjectFeatured } from "@/lib/actions/projects";
import type { AdminProject } from "@/lib/data/types";
import { ConfirmDialog } from "./ConfirmDialog";
import { MediaThumb } from "./MediaThumb";
import { DragHandle, SortableList } from "./SortableList";
import { useToast } from "./Toast";
import { IconExternal, IconPlus } from "./icons";
import { Badge, Button, EmptyState, PageHeader, StatusBadge, Toggle } from "./ui";

/** Projects overview: drag to reorder, toggle featured, jump into the editor. */
export function ProjectsList({ projects: initial }: { projects: AdminProject[] }) {
  const router = useRouter();
  const toast = useToast();
  const [projects, setProjects] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminProject | null>(null);

  const add = async () => {
    setBusy(true);
    const result = await createProject();
    setBusy(false);
    if (!result.ok) return toast(result.error, "error");
    router.push(`/admin/projects/${result.data.id}`);
  };

  const reorder = async (next: AdminProject[]) => {
    const previous = projects;
    setProjects(next);
    const result = await reorderProjects(next.map((p) => p.id));
    if (!result.ok) {
      setProjects(previous);
      toast(result.error, "error");
    } else {
      toast("Order saved");
    }
  };

  const toggleFeatured = async (project: AdminProject, value: boolean) => {
    setProjects((list) => list.map((p) => (p.id === project.id ? { ...p, isFeatured: value } : p)));
    const result = await setProjectFeatured(project.id, value);
    if (!result.ok) {
      setProjects((list) => list.map((p) => (p.id === project.id ? { ...p, isFeatured: !value } : p)));
      toast(result.error, "error");
    }
  };

  const duplicate = async (project: AdminProject) => {
    setBusy(true);
    const result = await duplicateProject(project.id);
    setBusy(false);
    if (!result.ok) return toast(result.error, "error");
    router.push(`/admin/projects/${result.data.id}`);
  };

  const remove = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    const result = await deleteProject(pendingDelete.id);
    setBusy(false);
    if (!result.ok) return toast(result.error, "error");
    setProjects((list) => list.filter((p) => p.id !== pendingDelete.id));
    setPendingDelete(null);
    toast("Project deleted");
  };

  return (
    <>
      <PageHeader
        title="Projects"
        description="Drag the handle to change the order on the homepage."
        actions={
          <Button variant="primary" onClick={add} loading={busy} data-testid="add-project">
            <IconPlus /> Add Project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState title="No projects yet" description="Create your first project to start building the portfolio." action={<Button variant="primary" onClick={add}>Add Project</Button>} />
      ) : (
        <SortableList
          items={projects}
          onChange={reorder}
          className="flex flex-col gap-2"
          renderItem={(project, _index, handle) => (
            <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3" data-testid="project-row">
              <DragHandle handle={handle} />
              <MediaThumb media={project.draft.cover ?? project.live.cover} className="h-14 w-14 shrink-0 rounded" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/projects/${project.id}`} className="truncate text-sm font-medium text-neutral-900 hover:underline">
                    {project.draft.title || "Untitled project"}
                  </Link>
                  <StatusBadge status={project.status} />
                  {project.hasUnpublishedChanges && project.status === "published" ? <Badge tone="amber">Unpublished changes</Badge> : null}
                </div>
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  /work/{project.slug}
                  {project.draft.categories.length ? ` · ${project.draft.categories.join(", ")}` : ""}
                </p>
              </div>
              <div className="hidden md:block">
                <Toggle checked={project.isFeatured} onChange={(value) => toggleFeatured(project, value)} label="Featured" />
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link href={`/admin/projects/${project.id}`} className="rounded-md border border-neutral-300 px-3 py-1.5 text-[13px] font-medium hover:border-neutral-500">
                  Edit
                </Link>
                <Link href={`/admin/preview/${project.id}`} target="_blank" className="hidden items-center gap-1 rounded-md px-2 py-1.5 text-[13px] text-neutral-600 hover:bg-neutral-100 sm:inline-flex">
                  Preview <IconExternal width={12} height={12} />
                </Link>
                <Button size="sm" variant="ghost" onClick={() => duplicate(project)} disabled={busy} className="hidden sm:inline-flex">
                  Duplicate
                </Button>
                <Button size="sm" variant="ghost" className="text-red-700" onClick={() => setPendingDelete(project)} disabled={busy}>
                  Delete
                </Button>
              </div>
            </div>
          )}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete "${pendingDelete?.draft.title || "this project"}"?`}
        description="The project and its live page are removed. Uploaded images stay in the media library."
        confirmLabel="Delete project"
        loading={busy}
        onConfirm={remove}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
