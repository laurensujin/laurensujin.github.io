import Link from "next/link";
import { notFound } from "next/navigation";
import { PhotographySetForm } from "@/components/admin/PhotographySetForm";
import { getPhotographySetForAdmin } from "@/lib/data/admin";

export default async function EditPhotographySetPage({ params }: PageProps<"/admin/photography/[id]">) {
  const { id } = await params;
  const set = await getPhotographySetForAdmin(id);
  if (!set) notFound();
  return (
    <>
      <div className="mb-5 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/admin/photography" className="hover:text-neutral-900">
          Photography
        </Link>
        <span aria-hidden>/</span>
        <span className="text-neutral-900">{set.title || "Untitled photo set"}</span>
      </div>
      <PhotographySetForm key={set.id} set={set} />
    </>
  );
}
