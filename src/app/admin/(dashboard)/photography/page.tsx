"use client";

import { PhotographyList } from "@/components/admin/PhotographyList";
import { ErrorState, LoadingState } from "@/components/admin/ui";
import { useLoad } from "@/lib/auth-client";
import { listPhotographySetsForAdmin } from "@/lib/data/admin";

export default function PhotographyPage() {
  const { data, error, loading } = useLoad(listPhotographySetsForAdmin, []);
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error} />;
  return <PhotographyList sets={data} />;
}
