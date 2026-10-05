"use client";

import type { Supabase } from "./auth-client";

export interface RebuildResult {
  /** True when GitHub accepted the rebuild request. */
  triggered: boolean;
  /** One sentence about the live site, shown after a change. */
  message: string;
}

const SETTINGS = "Settings → Site deployment";

/**
 * Asks GitHub to rebuild the public site. The site is static files, so this is
 * the only way a change reaches visitors: call it after anything public changes.
 * Needs a repository and a fine-grained token saved under Admin → Settings → Site deployment.
 */
export async function publishToSite(supabase: Supabase): Promise<RebuildResult> {
  const { data } = await supabase.from("admin_settings").select("github_repo, github_token").eq("id", 1).maybeSingle();
  const repo = data?.github_repo?.trim();
  const token = data?.github_token?.trim();
  if (!repo || !token) return notUpdated(`add a GitHub token under ${SETTINGS}`);

  let res: Response;
  try {
    res = await dispatch(repo, token, "content-published");
  } catch {
    return notUpdated("GitHub could not be reached. Try again with Settings → Rebuild site now");
  }
  if (res.status === 204) return { triggered: true, message: "The live site updates in a few minutes." };
  return notUpdated(await refusal(res));
}

/**
 * Checks that a repository and token are allowed to start a rebuild, without
 * starting one: GitHub accepts the "connection-test" event, but the deploy
 * workflow only listens for "content-published".
 */
export async function testGitHubConnection(repo: string, token: string): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await dispatch(repo, token, "connection-test");
    if (res.status === 204) return { ok: true, message: "Connected. Publishing will rebuild the site." };
    const reason = await refusal(res);
    return { ok: false, message: `${reason.charAt(0).toUpperCase()}${reason.slice(1)}.` };
  } catch {
    return { ok: false, message: "Could not reach GitHub." };
  }
}

function notUpdated(reason: string): RebuildResult {
  return { triggered: false, message: `The live site was not updated: ${reason}.` };
}

function dispatch(repo: string, token: string, eventType: string): Promise<Response> {
  return fetch(`https://api.github.com/repos/${repo}/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ event_type: eventType }),
  });
}

/** Says what to fix when GitHub turns a rebuild request down. */
async function refusal(res: Response): Promise<string> {
  if (res.status === 401) return `GitHub rejected the token, it may have expired. Paste a new one under ${SETTINGS}`;
  if (res.status === 403) return "the GitHub token needs the Contents: Read and write permission on this repository";
  if (res.status === 404) return "GitHub could not find the repository, or the token has no access to it";
  const body = (await res.json().catch(() => null)) as { message?: string } | null;
  return `GitHub refused the rebuild (${res.status}${body?.message ? `: ${body.message}` : ""})`;
}
