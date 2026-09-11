import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/site/CaseStudy";
import { requireAdminPage } from "@/lib/auth";
import { getProjectForAdmin } from "@/lib/data/admin";

// Always rendered fresh for the signed-in admin: never cached, never public.
export const dynamic = "force-dynamic";

/** Shows the DRAFT of a project exactly as the public case study page would. */
export default async function PreviewPage({ params }: PageProps<"/admin/preview/[id]">) {
  await requireAdminPage();
  const { id } = await params;
  const project = await getProjectForAdmin(id);
  if (!project) notFound();

  const banner = (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-4 border-t border-line bg-bg/90 px-4 py-3 text-xs backdrop-blur">
      <span className="eyebrow text-fg">Draft preview</span>
      <span className="text-fg-muted">Only you can see this page.</span>
      <Link href={`/admin/projects/${project.id}`} className="link-line text-fg">
        Back to editor
      </Link>
    </div>
  );

  return <CaseStudy content={project.draft} previewBanner={banner} />;
}
