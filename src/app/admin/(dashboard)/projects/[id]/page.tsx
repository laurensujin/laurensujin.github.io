import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { getProjectForAdmin } from "@/lib/data/admin";

export default async function ProjectEditPage({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const project = await getProjectForAdmin(id);
  if (!project) notFound();

  return (
    <>
      <div className="mb-5 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/admin/projects" className="hover:text-neutral-900">
          Projects
        </Link>
        <span aria-hidden>/</span>
        <span className="truncate text-neutral-900">{project.draft.title || "Untitled project"}</span>
      </div>
      <ProjectEditor key={project.id} project={project} />
    </>
  );
}
