"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { AuthForm } from "@/components/admin/AuthForm";
import { signIn } from "@/lib/actions/auth";
import { getSessionUser, isAdminUser } from "@/lib/auth-client";

/** Only allow redirects back into this site's admin area. */
function safeNext(value: string | null): string {
  return value && value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin/";
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const error = params.get("error");
  const notice =
    error === "link"
      ? "That link is invalid or has expired. Request a new one below."
      : error === "not-admin"
        ? "This account is not an administrator."
        : undefined;

  // Already signed in? Go straight to the admin.
  useEffect(() => {
    getSessionUser().then(async (user) => {
      if (user && (await isAdminUser(user.id))) router.replace(next);
    });
  }, [router, next]);

  return <AuthForm mode="login" notice={notice} onSubmit={(v) => signIn(v.email?.trim() ?? "", v.password ?? "")} onSuccess={() => router.replace(next)} />;
}
