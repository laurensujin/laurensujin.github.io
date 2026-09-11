import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { listMedia } from "@/lib/data/admin";

export default async function MediaPage() {
  const items = await listMedia();
  return <MediaLibrary items={items} />;
}
