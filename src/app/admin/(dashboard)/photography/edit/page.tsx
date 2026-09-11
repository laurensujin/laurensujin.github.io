"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PhotographySetForm } from "@/components/admin/PhotographySetForm";
import { ErrorState, LoadingState } from "@/components/admin/ui";
import { useLoad } from "@/lib/auth-client";
import { getPhotographySetForAdmin } from "@/lib/data/admin";

export default function EditPhotographySetPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PhotographySetLoader />
    </Suspense>
  );
}

function PhotographySetLoader() {
  const id = useSearchParams().get("id");
  const { data, error, loading } = useLoad(() => (id ? getPhotographySetForAdmin(id) : Promise.resolve(null)), [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <ErrorState message="This photo set does not exist (it may have been deleted)." />;

  return (
    <>
      <div className="mb-5 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/admin/photography/" className="hover:text-neutral-900">
          Photography
        </Link>
        <span aria-hidden>/</span>
        <span className="text-neutral-900">{data.title || "Untitled photo set"}</span>
      </div>
      <PhotographySetForm key={data.id} set={data} />
    </>
  );
}
