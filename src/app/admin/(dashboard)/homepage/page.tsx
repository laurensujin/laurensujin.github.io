"use client";

import { HomepageForm } from "@/components/admin/HomepageForm";
import { ErrorState, LoadingState } from "@/components/admin/ui";
import { useLoad } from "@/lib/auth-client";
import { getProfileForAdmin, getSiteSettingsForAdmin } from "@/lib/data/admin";

export default function HomepageAdminPage() {
  const { data, error, loading } = useLoad(async () => {
    const [settings, profile] = await Promise.all([getSiteSettingsForAdmin(), getProfileForAdmin()]);
    return { settings, links: profile.links };
  }, []);
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error} />;
  return <HomepageForm settings={data.settings} links={data.links} />;
}
