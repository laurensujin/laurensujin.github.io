"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/browser";

export type Supabase = SupabaseClient<Database>;

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

/** The signed-in user, or null. */
export async function getSessionUser(): Promise<User | null> {
  const {
    data: { session },
  } = await createClient().auth.getSession();
  return session?.user ?? null;
}

/** True when the user is listed in the `admins` table. */
export async function isAdminUser(userId: string): Promise<boolean> {
  const { data } = await createClient().from("admins").select("user_id").eq("user_id", userId).maybeSingle();
  return Boolean(data);
}

/**
 * Runs an admin operation with the browser Supabase client and turns errors
 * into a friendly result. Row Level Security is what actually enforces that
 * only administrators can write; this just gives clear messages.
 */
export async function runAdmin<T>(fn: (supabase: Supabase) => Promise<T>): Promise<ActionResult<T>> {
  try {
    const user = await getSessionUser();
    if (!user) throw new Error("Your session has expired. Please sign in again.");
    const data = await fn(createClient());
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return { ok: false, error: message };
  }
}

export interface AdminUserState {
  loading: boolean;
  user: User | null;
  isAdmin: boolean;
}

/** Tracks the signed-in admin in client components (updates on sign in/out). */
export function useAdminUser(): AdminUserState {
  const [state, setState] = useState<AdminUserState>({ loading: true, user: null, isAdmin: false });

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const resolve = async (user: User | null) => {
      const isAdmin = user ? await isAdminUser(user.id) : false;
      if (!cancelled) setState({ loading: false, user, isAdmin });
    };

    supabase.auth.getSession().then(({ data }) => resolve(data.session?.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void resolve(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

/** Small helper for pages: load data once (and again when `deps` change). */
export function useLoad<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data: T | null; error: string | null; loading: boolean; version: number }>({
    data: null,
    error: null,
    loading: true,
    version: 0,
  });

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((data) => {
        if (!cancelled) setState((s) => ({ ...s, data, error: null, loading: false }));
      })
      .catch((error: unknown) => {
        if (!cancelled) setState((s) => ({ ...s, error: error instanceof Error ? error.message : "Could not load.", loading: false }));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, state.version]);

  const reload = () => setState((s) => ({ ...s, loading: true, version: s.version + 1 }));
  return { data: state.data, error: state.error, loading: state.loading, reload };
}
