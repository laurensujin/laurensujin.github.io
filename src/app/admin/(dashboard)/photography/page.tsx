import { PhotographyList } from "@/components/admin/PhotographyList";
import { listPhotographySetsForAdmin } from "@/lib/data/admin";

export default async function PhotographyPage() {
  const sets = await listPhotographySetsForAdmin();
  return <PhotographyList sets={sets} />;
}
