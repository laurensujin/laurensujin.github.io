"use client";

import { ProjectsList } from "@/components/admin/ProjectsList";
import { ErrorState, LoadingState } from "@/components/admin/ui";
import { useLoad } from "@/lib/auth-client";
import { listProjectsForAdmin } from "@/lib/data/admin";

export default function ProjectsPage() {
  const { data, error, loading } = useLoad(listProjectsForAdmin, []);
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error} />;
  return <ProjectsList projects={data} />;
}
