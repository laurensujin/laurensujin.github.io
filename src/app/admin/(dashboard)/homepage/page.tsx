import { HomepageForm } from "@/components/admin/HomepageForm";
import { getProfileForAdmin, getSiteSettingsForAdmin } from "@/lib/data/admin";

export default async function HomepageAdminPage() {
  const [settings, profile] = await Promise.all([getSiteSettingsForAdmin(), getProfileForAdmin()]);
  return <HomepageForm settings={settings} links={profile.links} />;
}
