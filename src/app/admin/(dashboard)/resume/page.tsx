"use client";

import { ResumeManager } from "@/components/admin/ResumeManager";
import { ErrorState, LoadingState } from "@/components/admin/ui";
import { useLoad } from "@/lib/auth-client";
import { listResumeFiles } from "@/lib/data/admin";

export default function ResumePage() {
  const { data, error, loading } = useLoad(listResumeFiles, []);
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error} />;
  return <ResumeManager files={data} />;
}
