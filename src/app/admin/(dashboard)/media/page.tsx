"use client";

import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { ErrorState, LoadingState } from "@/components/admin/ui";
import { useLoad } from "@/lib/auth-client";
import { listMedia } from "@/lib/data/admin";

export default function MediaPage() {
  const { data, error, loading } = useLoad(listMedia, []);
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error} />;
  return <MediaLibrary items={data} />;
}
