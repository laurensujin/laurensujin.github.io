"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { CaseStudy } from "@/components/site/CaseStudy";
import { useAdminUser, useLoad } from "@/lib/auth-client";
import { getProjectForAdmin } from "@/lib/data/admin";

/** Shows the DRAFT of a project exactly as the public case study page would. Admins only. */
export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <Preview />
    </Suspense>
  );
}

function Preview() {
  const id = useSearchParams().get("id");
  const router = useRouter();
  const { loading: authLoading, user, isAdmin } = useAdminUser();
  const ready = !authLoading && Boolean(user) && isAdmin;

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace(`/admin/login/?next=${encodeURIComponent(`/admin/preview/?id=${id ?? ""}`)}`);
    }
  }, [authLoading, user, isAdmin, router, id]);

  const { data, loading, error } = useLoad(() => (ready && id ? getProjectForAdmin(id) : Promise.resolve(null)), [ready, id]);

  if (!ready || loading) {
    return <p className="eyebrow px-6 pt-32 md:px-10">Loading preview…</p>;
  }
  if (error || !data) {
    return <p className="eyebrow px-6 pt-32 md:px-10">{error ?? "This project does not exist."}</p>;
  }

  const banner = (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-4 border-t border-line bg-bg/90 px-4 py-3 text-xs backdrop-blur">
      <span className="eyebrow text-fg">Draft preview</span>
      <span className="text-fg-muted">Only you can see this page.</span>
      <Link href={`/admin/projects/edit/?id=${data.id}`} className="link-line text-fg">
        Back to editor
      </Link>
    </div>
  );

  return <CaseStudy content={data.draft} previewBanner={banner} />;
}
