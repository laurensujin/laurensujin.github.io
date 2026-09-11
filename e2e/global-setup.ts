import { execSync } from "node:child_process";

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@example.com";
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "password123";

/** Fresh database with seed content, plus the admin account, before every run. */
export default async function globalSetup() {
  if (process.env.E2E_SKIP_RESET !== "1") {
    execSync("supabase db reset", { stdio: "inherit" });
  }
  execSync(`node scripts/create-admin.mjs ${ADMIN_EMAIL} ${ADMIN_PASSWORD}`, { stdio: "inherit" });
}
