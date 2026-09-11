"use client";

import { SettingsForm } from "@/components/admin/SettingsForm";
import { ErrorState, LoadingState } from "@/components/admin/ui";
import { getSessionUser, useLoad } from "@/lib/auth-client";
import { getAdminSettings, getSiteSettingsForAdmin } from "@/lib/data/admin";

export default function SettingsPage() {
  const { data, error, loading } = useLoad(async () => {
    const [settings, admin, user] = await Promise.all([getSiteSettingsForAdmin(), getAdminSettings(), getSessionUser()]);
    return { settings, admin, email: user?.email ?? "" };
  }, []);
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error} />;
  return <SettingsForm settings={data.settings} admin={data.admin} email={data.email} />;
}
