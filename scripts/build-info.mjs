/**
 * Writes out/build-info.json after `next build`. The GitHub Actions workflow
 * reads this file from the live site to know which content version is
 * deployed, so scheduled runs can skip rebuilding when nothing changed.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";

// Plain Node scripts do not load .env.local the way `next build` does, so read
// it here for local builds. On GitHub Actions the values come from secrets.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL && existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let contentUpdatedAt = null;

if (url && key) {
  try {
    const res = await fetch(`${url}/rest/v1/site_settings?select=content_updated_at&id=eq.1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const rows = await res.json();
    contentUpdatedAt = rows?.[0]?.content_updated_at ?? null;
  } catch (error) {
    console.warn("build-info: could not read content_updated_at:", error?.message ?? error);
  }
}

const info = { builtAt: new Date().toISOString(), contentUpdatedAt };
writeFileSync("out/build-info.json", JSON.stringify(info, null, 2));
console.log("build-info.json:", info);
