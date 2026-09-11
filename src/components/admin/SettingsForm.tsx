"use client";

import { useState, type FormEvent } from "react";
import { updatePassword, type AuthFormState } from "@/lib/actions/auth";
import { rebuildPublicSite, saveAdminSettings, saveSiteSettings } from "@/lib/actions/settings";
import type { AdminSettings } from "@/lib/data/admin";
import type { SiteSettings } from "@/lib/data/types";
import { testGitHubConnection } from "@/lib/deploy";
import { MediaField } from "./MediaField";
import { useToast } from "./Toast";
import { Button, Card, Field, Input, PageHeader, Textarea } from "./ui";

interface Props {
  settings: SiteSettings;
  admin: AdminSettings;
  email: string;
}

export function SettingsForm({ settings: initial, admin: initialAdmin, email }: Props) {
  const toast = useToast();
  const [s, setS] = useState(initial);
  const [admin, setAdmin] = useState(initialAdmin);
  const [busy, setBusy] = useState<"save" | "deploy" | "test" | "rebuild" | "password" | null>(null);
  const [passwordState, setPasswordState] = useState<AuthFormState>({});
  const [connection, setConnection] = useState<string | null>(null);

  const save = async () => {
    setBusy("save");
    const result = await saveSiteSettings({ seoTitle: s.seoTitle, seoDescription: s.seoDescription, ogImage: s.ogImage, favicon: s.favicon });
    setBusy(null);
    if (!result.ok) return toast(result.error, "error");
    toast(result.data.message);
  };

  const saveDeploy = async () => {
    setBusy("deploy");
    const result = await saveAdminSettings(admin);
    setBusy(null);
    if (!result.ok) return toast(result.error, "error");
    toast("Deployment settings saved");
  };

  const test = async () => {
    setBusy("test");
    const result = await testGitHubConnection(admin.githubRepo.trim(), admin.githubToken.trim());
    setBusy(null);
    setConnection(result.message);
  };

  const rebuild = async () => {
    setBusy("rebuild");
    const result = await rebuildPublicSite();
    setBusy(null);
    if (!result.ok) return toast(result.error, "error");
    toast(result.data.triggered ? "Rebuild started. The site updates in a few minutes." : result.data.message, result.data.triggered ? "success" : "info");
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy("password");
    const result = await updatePassword(String(form.get("password") ?? ""), String(form.get("confirm") ?? ""));
    setBusy(null);
    setPasswordState(result);
    if (!result.error) event.currentTarget.reset();
  };

  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card
            title="Search & social preview"
            description="How the site appears in Google and when a link is shared."
            actions={
              <Button variant="primary" size="sm" onClick={save} loading={busy === "save"}>
                Save
              </Button>
            }
          >
            <div className="flex flex-col gap-4">
              <Field label="Site title" htmlFor="seoTitle" hint="Shown in the browser tab and search results.">
                <Input id="seoTitle" value={s.seoTitle} onChange={(e) => setS({ ...s, seoTitle: e.target.value })} />
              </Field>
              <Field label="Site description" htmlFor="seoDescription" hint="One or two sentences, about 150 characters.">
                <Textarea id="seoDescription" rows={3} value={s.seoDescription} onChange={(e) => setS({ ...s, seoDescription: e.target.value })} />
              </Field>
              <MediaField label="Social preview image (Open Graph)" value={s.ogImage} onChange={(ogImage) => setS({ ...s, ogImage })} withAlt={false} hint="1200×630 px works best." />
              <MediaField label="Favicon" value={s.favicon} onChange={(favicon) => setS({ ...s, favicon })} withAlt={false} hint="Square PNG or SVG, at least 64×64 px." />
            </div>
          </Card>

          <Card title="Account">
            <p className="text-sm text-neutral-700">
              Signed in as <span className="font-medium">{email}</span>
            </p>
            <form onSubmit={changePassword} className="mt-4 flex flex-col gap-3">
              <Field label="New password" htmlFor="password">
                <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
              </Field>
              <Field label="Repeat new password" htmlFor="confirm">
                <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
              </Field>
              {passwordState.error ? <p className="text-xs text-red-600">{passwordState.error}</p> : null}
              {passwordState.message ? <p className="text-xs text-emerald-700">{passwordState.message}</p> : null}
              <Button type="submit" loading={busy === "password"} className="self-start">
                Change password
              </Button>
            </form>
          </Card>
        </div>

        <Card
          title="Site deployment"
          description="The public site is rebuilt by GitHub Actions. Without a token it checks for changes every 15 minutes; with one, publishing rebuilds immediately."
          actions={
            <Button variant="primary" size="sm" onClick={saveDeploy} loading={busy === "deploy"}>
              Save
            </Button>
          }
        >
          <div className="flex flex-col gap-4">
            <Field label="GitHub repository" htmlFor="githubRepo" hint="owner/name, e.g. laurensujin/laurensujin.github.io">
              <Input id="githubRepo" value={admin.githubRepo} onChange={(e) => setAdmin({ ...admin, githubRepo: e.target.value })} placeholder="laurensujin/laurensujin.github.io" />
            </Field>
            <Field
              label="GitHub token"
              htmlFor="githubToken"
              hint="A fine-grained personal access token with “Contents: Read and write” on this repository only. Stored privately; only administrators can read it."
            >
              <Input id="githubToken" type="password" autoComplete="off" value={admin.githubToken} onChange={(e) => setAdmin({ ...admin, githubToken: e.target.value })} placeholder="github_pat_…" />
            </Field>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={test} loading={busy === "test"} disabled={!admin.githubRepo || !admin.githubToken}>
                Test connection
              </Button>
              <Button size="sm" onClick={rebuild} loading={busy === "rebuild"}>
                Rebuild site now
              </Button>
            </div>
            {connection ? <p className="text-xs text-neutral-600">{connection}</p> : null}
            <ol className="list-decimal space-y-1 pl-5 text-xs text-neutral-500">
              <li>On GitHub open Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.</li>
              <li>Repository access: only this repository. Permissions: Contents → Read and write.</li>
              <li>Copy the token here, save, then press Test connection.</li>
            </ol>
          </div>
        </Card>
      </div>
    </>
  );
}
