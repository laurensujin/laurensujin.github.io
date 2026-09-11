"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAdminUser } from "@/lib/auth-client";
import { createClient } from "@/lib/supabase/browser";

/**
 * Wraps every admin page: sends visitors who are not signed in to the login
 * page, and signs out accounts that are not administrators.
 */
export function AdminGuard({ children }: { children: (email: string) => ReactNode }) {
  const { loading, user, isAdmin } = useAdminUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/admin/login/?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!isAdmin) {
      createClient()
        .auth.signOut()
        .then(() => router.replace("/admin/login/?error=not-admin"));
    }
  }, [loading, user, isAdmin, router, pathname]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="admin-root flex min-h-screen items-center justify-center text-sm text-neutral-500">
        {loading ? "Checking your session…" : "Redirecting to sign in…"}
      </div>
    );
  }

  return <>{children(user.email ?? "")}</>;
}
