"use client";

import { z } from "zod";
import { runAdmin } from "@/lib/auth-client";
import { mediaRefSchema } from "@/lib/content/schema";
import { publishToSite, triggerRebuild } from "@/lib/deploy";
import type { Database } from "@/lib/supabase/database.types";

type SiteSettingsUpdate = Database["public"]["Tables"]["site_settings"]["Update"];

const text = z.string().max(5000).catch("");

const siteSettingsInput = z.object({
  siteName: z.string().min(1).max(200),
  heroHeadline: text,
  heroDescription: text,
  heroLocation: text,
  heroCtaLabel: text,
  heroTicker: text,
  selectedWorkLabel: text,
  photographyLabel: text,
  photographySubtitle: text,
  photographyDescription: text,
  footerLocation: text,
  footerCopyright: text,
  footerCredit: text,
  contactEmail: text,
  seoTitle: text,
  seoDescription: text,
  ogImage: mediaRefSchema.nullable().catch(null),
  favicon: mediaRefSchema.nullable().catch(null),
  heroImage: mediaRefSchema.nullable().catch(null),
});

export type SiteSettingsInput = z.input<typeof siteSettingsInput>;

/** Maps camelCase form fields to database columns. */
const COLUMNS: Record<keyof SiteSettingsInput, string> = {
  siteName: "site_name",
  heroHeadline: "hero_headline",
  heroDescription: "hero_description",
  heroLocation: "hero_location",
  heroCtaLabel: "hero_cta_label",
  heroTicker: "hero_ticker",
  selectedWorkLabel: "selected_work_label",
  photographyLabel: "photography_label",
  photographySubtitle: "photography_subtitle",
  photographyDescription: "photography_description",
  footerLocation: "footer_location",
  footerCopyright: "footer_copyright",
  footerCredit: "footer_credit",
  contactEmail: "contact_email",
  seoTitle: "seo_title",
  seoDescription: "seo_description",
  ogImage: "og_image",
  favicon: "favicon",
  heroImage: "hero_image",
};

/** Saves any subset of the site settings (the Homepage and Settings pages each edit part of the row). */
export async function saveSiteSettings(input: Partial<SiteSettingsInput>) {
  return runAdmin(async (supabase) => {
    const s = siteSettingsInput.partial().parse(input);
    const update: SiteSettingsUpdate = {};
    for (const [key, value] of Object.entries(s)) {
      if (value === undefined) continue;
      (update as Record<string, unknown>)[COLUMNS[key as keyof SiteSettingsInput]] = value;
    }
    if (!Object.keys(update).length) return { triggered: false, message: "Nothing to save." };

    const { error } = await supabase.from("site_settings").update(update).eq("id", 1);
    if (error) throw new Error(error.message);
    return publishToSite(supabase);
  });
}

const adminSettingsInput = z.object({
  githubRepo: z.string().max(200).catch(""),
  githubToken: z.string().max(500).catch(""),
});

/** Private deployment settings: which GitHub repository to rebuild, and the token to do it. */
export async function saveAdminSettings(input: z.input<typeof adminSettingsInput>) {
  return runAdmin(async (supabase) => {
    const s = adminSettingsInput.parse(input);
    const { error } = await supabase
      .from("admin_settings")
      .upsert({ id: 1, github_repo: s.githubRepo.trim(), github_token: s.githubToken.trim() }, { onConflict: "id" });
    if (error) throw new Error(error.message);
  });
}

/** Manual "rebuild the public site" button in Settings. */
export async function rebuildPublicSite() {
  return runAdmin(async (supabase) => triggerRebuild(supabase));
}
