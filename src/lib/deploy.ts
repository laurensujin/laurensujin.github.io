"use client";

import type { Supabase } from "./auth-client";

export interface RebuildResult {
  triggered: boolean;
  message: string;
}

/**
 * Records that public content changed. The GitHub Actions workflow checks
 * this timestamp every 15 minutes and rebuilds the site when it moved.
 */
export async function markContentUpdated(supabase: Supabase): Promise<void> {
  await supabase.from("site_settings").update({ content_updated_at: new Date().toISOString() }).eq("id", 1);
}

/**
 * Asks GitHub to rebuild the site right away. Needs a repository and a
 * fine-grained token saved under Admin → Settings → Site deployment.
 */
export async function triggerRebuild(supabase: Supabase): Promise<RebuildResult> {
  const { data } = await supabase.from("admin_settings").select("github_repo, github_token").eq("id", 1).maybeSingle();
  const repo = data?.github_repo?.trim();
  const token = data?.github_token?.trim();
  if (!repo || !token) {
    return { triggered: false, message: "Saved. The site updates within 15 minutes (add a GitHub token in Settings for instant updates)." };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event_type: "content-published" }),
    });
    if (res.status === 204) return { triggered: true, message: "Saved. The site is rebuilding and updates in a few minutes." };
    const body = await res.text();
    return { triggered: false, message: `Saved, but GitHub refused the rebuild request (${res.status}). ${body.slice(0, 120)}` };
  } catch {
    return { triggered: false, message: "Saved, but GitHub could not be reached. The site updates within 15 minutes." };
  }
}

/** Marks content as changed and requests a rebuild. Call after anything public changes. */
export async function publishToSite(supabase: Supabase): Promise<RebuildResult> {
  await markContentUpdated(supabase);
  return triggerRebuild(supabase);
}

/** Checks that a repository and token work (GET /repos/{repo}). */
export async function testGitHubConnection(repo: string, token: string): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    });
    if (res.ok) return { ok: true, message: "Connected. Publishing will trigger a rebuild." };
    if (res.status === 401) return { ok: false, message: "The token was rejected. Check it is correct and not expired." };
    if (res.status === 404) return { ok: false, message: "Repository not found. Check the name, or the token has no access to it." };
    return { ok: false, message: `GitHub answered ${res.status}.` };
  } catch {
    return { ok: false, message: "Could not reach GitHub." };
  }
}
