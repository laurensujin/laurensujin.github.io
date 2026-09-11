import Link from "next/link";
import { ButtonLink, Card, StatusBadge } from "@/components/admin/ui";
import { getDashboardStats } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const tiles = [
    { label: "Published projects", value: stats.publishedProjects, href: "/admin/projects" },
    { label: "Drafts & hidden", value: stats.draftProjects, href: "/admin/projects" },
    { label: "Photography sets", value: `${stats.publishedSets} / ${stats.photographySets}`, href: "/admin/photography" },
    { label: "Media files", value: stats.mediaCount, href: "/admin/media" },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">Everything you publish here appears on the public site right away.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link key={tile.label} href={tile.href} className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400">
            <p className="text-2xl font-semibold text-neutral-900">{tile.value}</p>
            <p className="mt-1 text-xs text-neutral-500">{tile.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Projects" actions={<ButtonLink href="/admin/projects" size="sm">Manage</ButtonLink>}>
          {stats.projects.length === 0 ? (
            <p className="text-sm text-neutral-500">No projects yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {stats.projects.map((project) => (
                <li key={project.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link href={`/admin/projects/${project.id}`} className="block truncate text-sm font-medium text-neutral-900 hover:underline">
                      {project.draft.title || "Untitled project"}
                    </Link>
                    <p className="text-xs text-neutral-500">
                      {project.publishedAt ? `Published ${formatDate(project.publishedAt)}` : "Never published"}
                      {project.hasUnpublishedChanges && project.status === "published" ? " · has unpublished changes" : ""}
                    </p>
                  </div>
                  <StatusBadge status={project.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Quick actions">
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/admin/projects" className="text-neutral-900 underline underline-offset-2">
                Add or edit a project
              </Link>
            </li>
            <li>
              <Link href="/admin/photography" className="text-neutral-900 underline underline-offset-2">
                Add a before / after photo set
              </Link>
            </li>
            <li>
              <Link href="/admin/homepage" className="text-neutral-900 underline underline-offset-2">
                Change the homepage copy
              </Link>
            </li>
            <li>
              <Link href="/admin/profile" className="text-neutral-900 underline underline-offset-2">
                Update the profile, education and links
              </Link>
            </li>
            <li>
              <Link href="/admin/resume" className="text-neutral-900 underline underline-offset-2">
                {stats.activeResume ? `Replace the resume (${stats.activeResume.filename})` : "Upload a resume PDF"}
              </Link>
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}
