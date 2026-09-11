"use client";

import { useActionState, useState } from "react";
import { updatePassword } from "@/lib/actions/auth";
import { refreshPublicSite, saveSiteSettings } from "@/lib/actions/settings";
import type { SiteSettings } from "@/lib/data/types";
import { MediaField } from "./MediaField";
import { useToast } from "./Toast";
import { Button, Card, Field, Input, PageHeader, Textarea } from "./ui";

interface Props {
  settings: SiteSettings;
  email: string;
}

export function SettingsForm({ settings: initial, email }: Props) {
  const toast = useToast();
  const [s, setS] = useState(initial);
  const [busy, setBusy] = useState<"save" | "refresh" | null>(null);
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePassword, {});

  const save = async () => {
    setBusy("save");
    const result = await saveSiteSettings({ seoTitle: s.seoTitle, seoDescription: s.seoDescription, ogImage: s.ogImage, favicon: s.favicon });
    setBusy(null);
    if (!result.ok) return toast(result.error, "error");
    toast("Settings saved");
  };

  const refresh = async () => {
    setBusy("refresh");
    const result = await refreshPublicSite();
    setBusy(null);
    if (!result.ok) return toast(result.error, "error");
    toast("Public pages are being refreshed");
  };

  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-6 lg:grid-cols-2">
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

        <div className="flex flex-col gap-6">
          <Card title="Account">
            <p className="text-sm text-neutral-700">
              Signed in as <span className="font-medium">{email}</span>
            </p>
            <form action={passwordAction} className="mt-4 flex flex-col gap-3">
              <Field label="New password" htmlFor="password">
                <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
              </Field>
              <Field label="Repeat new password" htmlFor="confirm">
                <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
              </Field>
              {passwordState.error ? <p className="text-xs text-red-600">{passwordState.error}</p> : null}
              {passwordState.message ? <p className="text-xs text-emerald-700">{passwordState.message}</p> : null}
              <Button type="submit" loading={passwordPending} className="self-start">
                Change password
              </Button>
            </form>
          </Card>

          <Card title="Public site cache" description="Publishing already refreshes the site. Use this if something looks stale.">
            <Button onClick={refresh} loading={busy === "refresh"}>
              Refresh public site
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
