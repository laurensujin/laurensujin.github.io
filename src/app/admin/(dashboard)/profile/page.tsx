import { ProfileForm } from "@/components/admin/ProfileForm";
import { getProfileForAdmin } from "@/lib/data/admin";

export default async function ProfilePage() {
  const data = await getProfileForAdmin();
  return <ProfileForm profile={data.profile} education={data.education} links={data.links} />;
}
