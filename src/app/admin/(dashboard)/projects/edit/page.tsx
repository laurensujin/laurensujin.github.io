"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { ErrorState, LoadingState } from "@/components/admin/ui";
import { useLoad } from "@/lib/auth-client";
import { getProjectForAdmin } from "@/lib/data/admin";

export default function ProjectEditPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProjectEditLoader />
    </Suspense>
  );
}

function ProjectEditLoader() {
  const id = useSearchParams().get("id");
  const { data, error, loading } = useLoad(() => (id ? getProjectForAdmin(id) : Promise.resolve(null)), [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <ErrorState message="This project does not exist (it may have been deleted)." />;

  return (
    <>
      <div className="mb-5 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/admin/projects/" className="hover:text-neutral-900">
          Projects
        </Link>
        <span aria-hidden>/</span>
        <span className="truncate text-neutral-900">{data.draft.title || "Untitled project"}</span>
      </div>
      <ProjectEditor key={data.id} project={data} />
    </>
  );
}
