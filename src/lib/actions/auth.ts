"use client";

import { isAdminUser } from "@/lib/auth-client";
import { createClient } from "@/lib/supabase/browser";
import { siteUrl } from "@/lib/supabase/env";

export interface AuthFormState {
  error?: string;
  message?: string;
}

/** Signs in and checks the account is an administrator. */
export async function signIn(email: string, password: string): Promise<AuthFormState> {
  if (!email || !password) return { error: "Enter your email and password." };
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Incorrect email or password." };

  if (!(await isAdminUser(data.user.id))) {
    await supabase.auth.signOut();
    return { error: "This account is not an administrator." };
  }
  return {};
}

export async function signOut(): Promise<void> {
  await createClient().auth.signOut();
}

export async function requestPasswordReset(email: string): Promise<AuthFormState> {
  if (!email) return { error: "Enter your email address." };
  const base = typeof window !== "undefined" ? window.location.origin : siteUrl();
  await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${base}/auth/callback/?next=/admin/reset-password/` });
  // Always answer the same way so the form does not reveal which emails exist.
  return { message: "If that email belongs to an administrator, a reset link is on its way." };
}

export async function updatePassword(password: string, confirm: string): Promise<AuthFormState> {
  if (password.length < 8) return { error: "Use at least 8 characters." };
  if (password !== confirm) return { error: "The two passwords do not match." };
  const { error } = await createClient().auth.updateUser({ password });
  if (error) return { error: error.message };
  return { message: "Password updated." };
}
