"use client";

import { ProfileForm } from "@/components/admin/ProfileForm";
import { ErrorState, LoadingState } from "@/components/admin/ui";
import { useLoad } from "@/lib/auth-client";
import { getProfileForAdmin } from "@/lib/data/admin";

export default function ProfilePage() {
  const { data, error, loading } = useLoad(getProfileForAdmin, []);
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error} />;
  return <ProfileForm profile={data.profile} education={data.education} links={data.links} />;
}
