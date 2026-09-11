"use client";

import { AuthForm } from "@/components/admin/AuthForm";
import { requestPasswordReset } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  return <AuthForm mode="forgot" onSubmit={(v) => requestPasswordReset(v.email?.trim() ?? "")} />;
}
