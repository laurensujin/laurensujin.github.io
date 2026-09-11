import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Returns the signed-in user if they are listed in the `admins` table. */
export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return data ? user : null;
}

/** For server actions: throws if the caller is not an administrator. */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("You must be signed in as an administrator.");
  return user;
}

/** For admin pages: sends non-admins to the login page. */
export async function requireAdminPage() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

/** Wraps an admin-only operation so the client gets a friendly error instead of a crash. */
export async function adminAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    await requireAdmin();
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return { ok: false, error: message };
  }
}
