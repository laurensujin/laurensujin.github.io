"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { AuthFormState } from "@/lib/actions/auth";
import { Button, Field, Input } from "./ui";

interface Props {
  mode: "login" | "forgot" | "reset";
  onSubmit: (values: Record<string, string>) => Promise<AuthFormState>;
  onSuccess?: () => void;
  notice?: string;
}

/** Shared layout for the sign-in, forgot-password and reset-password forms. */
export function AuthForm({ mode, onSubmit, onSuccess, notice }: Props) {
  const [state, setState] = useState<AuthFormState>({});
  const [pending, setPending] = useState(false);

  const title = mode === "login" ? "Sign in" : mode === "forgot" ? "Reset your password" : "Choose a new password";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values: Record<string, string> = {};
    form.forEach((value, key) => (values[key] = String(value)));
    setPending(true);
    const result = await onSubmit(values);
    setPending(false);
    setState(result);
    if (!result.error && onSuccess) onSuccess();
  };

  return (
    <div className="admin-root flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Portfolio Admin</p>
        <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
          {notice ? <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">{notice}</p> : null}
          {state.error ? (
            <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}
          {state.message ? (
            <p role="status" className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {state.message}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col gap-4">
            {mode !== "reset" ? (
              <Field label="Email" htmlFor="email">
                <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
              </Field>
            ) : null}
            {mode === "login" ? (
              <Field label="Password" htmlFor="password">
                <Input id="password" name="password" type="password" autoComplete="current-password" required />
              </Field>
            ) : null}
            {mode === "reset" ? (
              <>
                <Field label="New password" htmlFor="password" hint="At least 8 characters.">
                  <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} autoFocus />
                </Field>
                <Field label="Repeat new password" htmlFor="confirm">
                  <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
                </Field>
              </>
            ) : null}
            <Button type="submit" variant="primary" loading={pending} className="w-full">
              {mode === "login" ? "Sign in" : mode === "forgot" ? "Send reset link" : "Update password"}
            </Button>
          </div>

          <div className="mt-5 flex justify-between text-xs text-neutral-500">
            {mode === "login" ? (
              <Link href="/admin/forgot-password/" className="hover:text-neutral-900">
                Forgot password?
              </Link>
            ) : (
              <Link href="/admin/login/" className="hover:text-neutral-900">
                Back to sign in
              </Link>
            )}
            <Link href="/" className="hover:text-neutral-900">
              View site
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
