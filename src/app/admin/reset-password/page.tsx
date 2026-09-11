"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthForm } from "@/components/admin/AuthForm";
import { updatePassword } from "@/lib/actions/auth";
import { getSessionUser } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  const router = useRouter();

  // The email link signs the user in first (see /auth/callback), so anyone
  // landing here without a session should request a new link.
  useEffect(() => {
    getSessionUser().then((user) => {
      if (!user) router.replace("/admin/login/?error=link");
    });
  }, [router]);

  return (
    <AuthForm
      mode="reset"
      onSubmit={(v) => updatePassword(v.password ?? "", v.confirm ?? "")}
      onSuccess={() => window.setTimeout(() => router.replace("/admin/"), 800)}
    />
  );
}
