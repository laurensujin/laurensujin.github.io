import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdminPage } from "@/lib/auth";
import { getSiteSettingsForAdmin } from "@/lib/data/admin";

export default async function SettingsPage() {
  const [settings, user] = await Promise.all([getSiteSettingsForAdmin(), requireAdminPage()]);
  return <SettingsForm settings={settings} email={user.email ?? ""} />;
}
