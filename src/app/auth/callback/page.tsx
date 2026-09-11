"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/browser";

/**
 * Landing point for links in Supabase emails (password reset). It turns the
 * one-time code from the email into a session, then continues to `next`.
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <Callback />
    </Suspense>
  );
}

function Callback() {
  const router = useRouter();
  const params = useSearchParams();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const code = params.get("code");
    const tokenHash = params.get("token_hash");
    const type = params.get("type") as EmailOtpType | null;
    const nextParam = params.get("next") ?? "/admin/";
    const next = nextParam.startsWith("/admin") ? nextParam : "/admin/";

    const finish = async () => {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return router.replace(next);
      } else if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (!error) return router.replace(next);
      }
      setFailed(true);
      router.replace("/admin/login/?error=link");
    };
    void finish();
  }, [params, router]);

  return (
    <div className="admin-root flex min-h-screen items-center justify-center text-sm text-neutral-500">
      {failed ? "That link did not work. Redirecting…" : "Signing you in…"}
    </div>
  );
}
