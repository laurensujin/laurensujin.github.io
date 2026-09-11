"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { deleteProject, discardProjectDraft, duplicateProject, publishProject, saveProjectDraft, setProjectFeatured, setProjectStatus } from "@/lib/actions/projects";
import type { ProjectContent } from "@/lib/content/schema";
import type { AdminProject } from "@/lib/data/types";
import { formatDate, slugify } from "@/lib/utils";
import { ConfirmDialog } from "./ConfirmDialog";
import { MediaField } from "./MediaField";
import { TagInput } from "./TagInput";
import { useToast } from "./Toast";
import { BlockEditor } from "./blocks/BlockEditor";
import { IconExternal } from "./icons";
import { Button, Card, Field, Input, StatusBadge, Textarea, Toggle } from "./ui";

/**
 * The project editor. Everything you change here is a DRAFT until you press
 * Publish. "Save draft" keeps your work; "Preview" opens the draft as visitors
 * would see it; "Publish" copies the draft to the live site.
 */
export function ProjectEditor({ project }: { project: AdminProject }) {
  const router = useRouter();
  const toast = useToast();
  const [content, setContent] = useState<ProjectContent>(project.draft);
  const [status, setStatus] = useState(project.status);
  const [featured, setFeatured] = useState(project.isFeatured);
  const [publishedAt, setPublishedAt] = useState(project.publishedAt);
  const [savedAt, setSavedAt] = useState(project.draftUpdatedAt);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(project.draft.slug !== slugify(project.draft.title));
  const [busy, setBusy] = useState<"save" | "publish" | "preview" | "other" | null>(null);
  const [confirm, setConfirm] = useState<"delete" | "discard" | null>(null);
  const lastSaved = useRef(JSON.stringify(project.draft));
  const [publishedSlug, setPublishedSlug] = useState(project.slug);

  const update = useCallback((patch: Partial<ProjectContent>) => {
    setContent((current) => {
      const next = { ...current, ...patch };
      // Keep the URL slug in step with the title until it is edited by hand.
      if (patch.title !== undefined && !slugTouched) next.slug = slugify(patch.title);
      setDirty(JSON.stringify(next) !== lastSaved.current);
      return next;
    });
  }, [slugTouched]);

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const save = async (): Promise<boolean> => {
    setBusy("save");
    const result = await saveProjectDraft(project.id, content);
    setBusy(null);
    if (!result.ok) {
      toast(result.error, "error");
      return false;
    }
    lastSaved.current = JSON.stringify(result.data.content);
    setContent(result.data.content);
    setSavedAt(result.data.updatedAt);
    setDirty(false);
    toast("Draft saved");
    return true;
  };

  // Cmd/Ctrl + S saves the draft.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const publish = async () => {
    setBusy("publish");
    const result = await publishProject(project.id, content);
    setBusy(null);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    lastSaved.current = JSON.stringify(result.data.content);
    setContent(result.data.content);
    setStatus("published");
    setPublishedAt(result.data.publishedAt);
    setSavedAt(result.data.publishedAt);
    setPublishedSlug(result.data.slug);
    setDirty(false);
    toast(result.data.rebuild.message.replace(/^Saved\./, "Published."));
  };

  const preview = async () => {
    setBusy("preview");
    const ok = dirty ? await save() : true;
    setBusy(null);
    if (ok) window.open(`/admin/preview/?id=${project.id}`, "_blank", "noopener");
  };

  const changeStatus = async (next: "draft" | "hidden" | "published") => {
    setBusy("other");
    const result = await setProjectStatus(project.id, next);
    setBusy(null);
    if (!result.ok) return toast(result.error, "error");
    setStatus(next);
    toast(next === "published" ? "Project is live again" : next === "hidden" ? "Project hidden from the site" : "Project unpublished");
  };

  const toggleFeatured = async (value: boolean) => {
    setFeatured(value);
    const result = await setProjectFeatured(project.id, value);
    if (!result.ok) {
      setFeatured(!value);
      toast(result.error, "error");
    }
  };

  const duplicate = async () => {
    setBusy("other");
    const result = await duplicateProject(project.id);
    setBusy(null);
    if (!result.ok) return toast(result.error, "error");
    toast("Project duplicated");
    router.push(`/admin/projects/edit/?id=${result.data.id}`);
  };

  const discard = async () => {
    setBusy("other");
    const result = await discardProjectDraft(project.id);
    setBusy(null);
    setConfirm(null);
    if (!result.ok) return toast(result.error, "error");
    lastSaved.current = JSON.stringify(result.data.content);
    setContent(result.data.content);
    setDirty(false);
    toast("Draft reset to the published version");
  };

  const remove = async () => {
    setBusy("other");
    const result = await deleteProject(project.id);
    setBusy(null);
    setConfirm(null);
    if (!result.ok) return toast(result.error, "error");
    toast("Project deleted");
    router.push("/admin/projects/");
  };

  const hasUnpublished = status !== "published" || !publishedAt || dirty || (savedAt !== null && publishedAt !== null && new Date(savedAt).getTime() > new Date(publishedAt).getTime() + 1000);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start">
      <div className="flex min-w-0 flex-col gap-6">
        <Card title="Basics">
          <div className="flex flex-col gap-4">
            <Field label="Title" htmlFor="title">
              <Input id="title" value={content.title} onChange={(e) => update({ title: e.target.value })} placeholder="Project title" className="text-base font-medium" />
            </Field>
            <Field label="Subtitle" htmlFor="subtitle">
              <Input id="subtitle" value={content.subtitle} onChange={(e) => update({ subtitle: e.target.value })} placeholder="One line under the title" />
            </Field>
            <Field label="Short description" hint="Used on the homepage card, social previews and search results." htmlFor="shortDescription">
              <Textarea id="shortDescription" rows={3} value={content.shortDescription} onChange={(e) => update({ shortDescription: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card title="Cover" description="The cover appears on the homepage card and at the top of the case study.">
          <div className="grid gap-4 md:grid-cols-2">
            <MediaField label="Cover image" value={content.cover} onChange={(cover) => update({ cover })} />
            <MediaField label="Cover video (optional)" value={content.coverVideo} onChange={(coverVideo) => update({ coverVideo })} kinds={["video"]} withAlt={false} hint="Plays silently on a loop. MP4 works best." />
          </div>
        </Card>

        <Card title="Details">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Categories" hint="Press Enter after each one." className="md:col-span-2">
              <TagInput value={content.categories} onChange={(categories) => update({ categories })} placeholder="Brand Development" />
            </Field>
            <Field label="Year" htmlFor="year">
              <Input id="year" value={content.year} onChange={(e) => update({ year: e.target.value })} placeholder="2026" />
            </Field>
            <Field label="Date or date range" htmlFor="dateRange">
              <Input id="dateRange" value={content.dateRange} onChange={(e) => update({ dateRange: e.target.value })} placeholder="2026–Present" />
            </Field>
            <Field label="Project status" htmlFor="projectStatus" hint="Shown on the site, e.g. In Development.">
              <Input id="projectStatus" value={content.projectStatus} onChange={(e) => update({ projectStatus: e.target.value })} placeholder="In Development" />
            </Field>
            <Field label="Tags">
              <TagInput value={content.tags} onChange={(tags) => update({ tags })} placeholder="Fragrance" />
            </Field>
            <Field label="Your role" hint="Short list for the page header.">
              <TagInput value={content.role} onChange={(role) => update({ role })} placeholder="Creative Direction" />
            </Field>
            <Field label="Tools">
              <TagInput value={content.tools} onChange={(tools) => update({ tools })} placeholder="Photoshop" />
            </Field>
          </div>
        </Card>

        <Card title="Links">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Project URL" htmlFor="projectUrl">
              <Input id="projectUrl" value={content.projectUrl} onChange={(e) => update({ projectUrl: e.target.value })} placeholder="https://" />
            </Field>
            <Field label="Project link label" htmlFor="projectUrlLabel">
              <Input id="projectUrlLabel" value={content.projectUrlLabel} onChange={(e) => update({ projectUrlLabel: e.target.value })} placeholder="Visit website" />
            </Field>
            <Field label="Social link URL" htmlFor="socialUrl">
              <Input id="socialUrl" value={content.socialUrl} onChange={(e) => update({ socialUrl: e.target.value })} placeholder="[Add Instagram URL]" />
            </Field>
            <Field label="Social link label" htmlFor="socialLabel">
              <Input id="socialLabel" value={content.socialLabel} onChange={(e) => update({ socialLabel: e.target.value })} placeholder="Instagram" />
            </Field>
          </div>
        </Card>

        <Card title="Case study" description="Build the page from sections. Drag the handle, or use the arrows, to reorder.">
          <BlockEditor blocks={content.blocks} onChange={(blocks) => update({ blocks })} />
        </Card>

        <Card title="Search & sharing (optional)">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="SEO title" htmlFor="seoTitle" hint="Defaults to the project title.">
              <Input id="seoTitle" value={content.seoTitle} onChange={(e) => update({ seoTitle: e.target.value })} />
            </Field>
            <Field label="SEO description" htmlFor="seoDescription" hint="Defaults to the short description.">
              <Input id="seoDescription" value={content.seoDescription} onChange={(e) => update({ seoDescription: e.target.value })} />
            </Field>
          </div>
        </Card>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-20">
        <Card>
          <div className="flex items-center justify-between">
            <StatusBadge status={status} />
            {hasUnpublished ? <span className="text-[11px] font-medium text-amber-700">{dirty ? "Unsaved changes" : "Unpublished changes"}</span> : null}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="primary" onClick={publish} loading={busy === "publish"} disabled={busy !== null && busy !== "publish"} data-testid="publish">
              {status === "published" ? "Publish changes" : "Publish"}
            </Button>
            <Button onClick={() => void save()} loading={busy === "save"} disabled={busy !== null && busy !== "save"} data-testid="save-draft">
              Save draft
            </Button>
            <Button onClick={preview} loading={busy === "preview"} disabled={busy !== null && busy !== "preview"}>
              Preview draft <IconExternal width={14} height={14} />
            </Button>
          </div>
          <dl className="mt-4 space-y-1 text-xs text-neutral-500">
            <div className="flex justify-between gap-2">
              <dt>Draft saved</dt>
              <dd>{savedAt ? formatDate(savedAt) : "never"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Published</dt>
              <dd>{publishedAt ? formatDate(publishedAt) : "never"}</dd>
            </div>
          </dl>
          {status === "published" ? (
            <Link href={`/work/${publishedSlug}/`} target="_blank" className="mt-3 inline-flex items-center gap-1 text-xs text-neutral-600 underline underline-offset-2 hover:text-neutral-900">
              View live page <IconExternal width={12} height={12} />
            </Link>
          ) : null}
        </Card>

        <Card title="Settings">
          <div className="flex flex-col gap-4">
            <Field label="URL slug" hint={`Changes take effect when you publish. /work/${content.slug || "…"}/`} htmlFor="slug">
              <Input
                id="slug"
                value={content.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update({ slug: slugify(e.target.value) || e.target.value.toLowerCase() });
                }}
                onBlur={(e) => update({ slug: slugify(e.target.value) })}
              />
            </Field>
            <Toggle checked={featured} onChange={toggleFeatured} label="Featured" description="Featured projects span the full width of the homepage. Applies with the next site rebuild." />
          </div>
        </Card>

        <Card title="Visibility">
          <div className="flex flex-col gap-2">
            {status === "published" ? (
              <>
                <Button size="sm" onClick={() => changeStatus("hidden")} disabled={busy !== null}>
                  Hide from site
                </Button>
                <Button size="sm" onClick={() => changeStatus("draft")} disabled={busy !== null}>
                  Unpublish
                </Button>
              </>
            ) : publishedAt ? (
              <Button size="sm" onClick={() => changeStatus("published")} disabled={busy !== null}>
                Show last published version
              </Button>
            ) : (
              <p className="text-xs text-neutral-500">This project has never been published. Visitors cannot see it.</p>
            )}
          </div>
        </Card>

        <Card title="More">
          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={duplicate} disabled={busy !== null}>
              Duplicate project
            </Button>
            {publishedAt ? (
              <Button size="sm" onClick={() => setConfirm("discard")} disabled={busy !== null}>
                Discard unpublished changes
              </Button>
            ) : null}
            <Button size="sm" variant="danger" onClick={() => setConfirm("delete")} disabled={busy !== null}>
              Delete project
            </Button>
          </div>
        </Card>
      </aside>

      <ConfirmDialog
        open={confirm === "delete"}
        title="Delete this project?"
        description="The project, its draft and its live page are removed. Uploaded images stay in the media library."
        confirmLabel="Delete project"
        loading={busy === "other"}
        onConfirm={remove}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === "discard"}
        title="Discard unpublished changes?"
        description="The draft will be replaced with the version that is currently live."
        confirmLabel="Discard changes"
        loading={busy === "other"}
        onConfirm={discard}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
