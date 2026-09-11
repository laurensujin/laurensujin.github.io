/**
 * Creates (or resets the password of) the administrator account.
 *
 * Local development:
 *   node scripts/create-admin.mjs you@example.com your-password
 *   (reads the local Supabase URL and service-role key from `supabase status`)
 *
 * Hosted Supabase: create the user in the dashboard instead
 *   (Authentication → Users → Add user). The first user automatically becomes
 *   the administrator. This script also works remotely if you export
 *   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first, but never commit that key.
 */
import { execSync } from "node:child_process";

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Use a password with at least 8 characters.");
  process.exit(1);
}

let url = process.env.SUPABASE_URL;
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  try {
    const status = execSync("supabase status -o env", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const read = (name) => status.match(new RegExp(`^${name}="?([^"\\n]+)"?$`, "m"))?.[1];
    url = url || read("API_URL");
    serviceKey = serviceKey || read("SERVICE_ROLE_KEY") || read("SECRET_KEY");
  } catch {
    // supabase CLI not available or not running
  }
}

if (!url || !serviceKey) {
  console.error("Could not find the Supabase URL and service-role key. Is `supabase start` running?");
  process.exit(1);
}

const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" };

// Does the user already exist?
const list = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, { headers });
if (!list.ok) {
  console.error(`Could not list users: ${list.status} ${await list.text()}`);
  process.exit(1);
}
const { users = [] } = await list.json();
const existing = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

let userId;
if (existing) {
  const res = await fetch(`${url}/auth/v1/admin/users/${existing.id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ password, email_confirm: true }),
  });
  if (!res.ok) {
    console.error(`Could not update user: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  userId = existing.id;
  console.log(`Updated password for ${email}.`);
} else {
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!res.ok) {
    console.error(`Could not create user: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  userId = (await res.json()).id;
  console.log(`Created user ${email}.`);
}

// Make sure the account is listed as an administrator (the database trigger
// does this for the very first user; this covers additional accounts).
const admin = await fetch(`${url}/rest/v1/admins`, {
  method: "POST",
  headers: { ...headers, Prefer: "resolution=ignore-duplicates" },
  body: JSON.stringify({ user_id: userId, email }),
});
if (!admin.ok && admin.status !== 409) {
  console.error(`Could not add to admins: ${admin.status} ${await admin.text()}`);
  process.exit(1);
}
console.log(`${email} can now sign in at /admin.`);
