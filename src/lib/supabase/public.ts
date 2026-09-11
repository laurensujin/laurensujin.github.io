import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

let client: ReturnType<typeof createSupabaseClient<Database>> | undefined;

/**
 * Anonymous client for the PUBLIC website. It never sends cookies, so pages
 * that use it can be cached/prerendered by Next.js, and Row Level Security
 * guarantees it can only read published content.
 */
export function publicClient() {
  if (!client) {
    const { url, key } = supabaseEnv();
    client = createSupabaseClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}
