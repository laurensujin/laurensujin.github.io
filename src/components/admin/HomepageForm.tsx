"use client";

import { useState } from "react";
import { saveSiteSettings } from "@/lib/actions/settings";
import type { SiteSettings, SocialLink } from "@/lib/data/types";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { useToast } from "./Toast";
import { Button, Card, Field, Input, PageHeader, Textarea } from "./ui";

interface Props {
  settings: SiteSettings;
  links: SocialLink[];
}

/** Homepage copy with a live preview of the hero and footer on the right. */
export function HomepageForm({ settings: initial, links }: Props) {
  const toast = useToast();
  const [s, setS] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<SiteSettings>) => setS((current) => ({ ...current, ...patch }));

  const save = async () => {
    setBusy(true);
    const result = await saveSiteSettings({
      siteName: s.siteName,
      heroHeadline: s.heroHeadline,
      heroDescription: s.heroDescription,
      heroLocation: s.heroLocation,
      heroCtaLabel: s.heroCtaLabel,
      selectedWorkLabel: s.selectedWorkLabel,
      photographyLabel: s.photographyLabel,
      photographySubtitle: s.photographySubtitle,
      photographyDescription: s.photographyDescription,
      footerLocation: s.footerLocation,
      footerCopyright: s.footerCopyright,
      footerCredit: s.footerCredit,
      contactEmail: s.contactEmail,
    });
    setBusy(false);
    if (!result.ok) return toast(result.error, "error");
    toast("Homepage saved and published");
  };

  return (
    <>
      <PageHeader
        title="Homepage"
        description="Changes go live as soon as you save."
        actions={
          <Button variant="primary" onClick={save} loading={busy} data-testid="save-homepage">
            Save
          </Button>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
        <div className="flex flex-col gap-6">
          <Card title="Hero">
            <div className="flex flex-col gap-4">
              <Field label="Name (header, hero and footer)" htmlFor="siteName">
                <Input id="siteName" value={s.siteName} onChange={(e) => set({ siteName: e.target.value })} />
              </Field>
              <Field label="Headline" htmlFor="heroHeadline" hint="Each line break starts a new line in the big serif headline.">
                <Textarea id="heroHeadline" rows={4} value={s.heroHeadline} onChange={(e) => set({ heroHeadline: e.target.value })} />
              </Field>
              <Field label="Location line" htmlFor="heroLocation">
                <Input id="heroLocation" value={s.heroLocation} onChange={(e) => set({ heroLocation: e.target.value })} />
              </Field>
              <Field label="Supporting text" htmlFor="heroDescription">
                <Textarea id="heroDescription" rows={3} value={s.heroDescription} onChange={(e) => set({ heroDescription: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Scroll link label" htmlFor="heroCtaLabel">
                  <Input id="heroCtaLabel" value={s.heroCtaLabel} onChange={(e) => set({ heroCtaLabel: e.target.value })} />
                </Field>
                <Field label="Work section label" htmlFor="selectedWorkLabel">
                  <Input id="selectedWorkLabel" value={s.selectedWorkLabel} onChange={(e) => set({ selectedWorkLabel: e.target.value })} />
                </Field>
              </div>
            </div>
          </Card>

          <Card title="Portrait section" description="Appears once at least one photo set is published.">
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Label" htmlFor="photographyLabel">
                  <Input id="photographyLabel" value={s.photographyLabel} onChange={(e) => set({ photographyLabel: e.target.value })} />
                </Field>
                <Field label="Headline" htmlFor="photographySubtitle">
                  <Input id="photographySubtitle" value={s.photographySubtitle} onChange={(e) => set({ photographySubtitle: e.target.value })} />
                </Field>
              </div>
              <Field label="Description" htmlFor="photographyDescription">
                <Textarea id="photographyDescription" rows={3} value={s.photographyDescription} onChange={(e) => set({ photographyDescription: e.target.value })} />
              </Field>
            </div>
          </Card>

          <Card title="Footer & contact" description="Footer links are managed under Profile → Links (toggle “Show in footer”).">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Location" htmlFor="footerLocation">
                <Input id="footerLocation" value={s.footerLocation} onChange={(e) => set({ footerLocation: e.target.value })} />
              </Field>
              <Field label="Copyright" htmlFor="footerCopyright">
                <Input id="footerCopyright" value={s.footerCopyright} onChange={(e) => set({ footerCopyright: e.target.value })} />
              </Field>
              <Field label="Credit line" htmlFor="footerCredit">
                <Input id="footerCredit" value={s.footerCredit} onChange={(e) => set({ footerCredit: e.target.value })} />
              </Field>
              <Field label="Contact email" htmlFor="contactEmail" hint="For your reference; add an Email link under Profile → Links to show it.">
                <Input id="contactEmail" type="email" value={s.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="xl:sticky xl:top-20">
          <p className="mb-2 text-[13px] font-medium text-neutral-700">Live preview</p>
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-bg text-fg" style={{ colorScheme: "light" }}>
            <div className="origin-top-left" style={{ zoom: 0.6 }}>
              <Hero settings={s} preview />
              <Footer settings={s} links={links} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
