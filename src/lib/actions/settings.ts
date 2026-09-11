"use server";

import { z } from "zod";
import { adminAction } from "@/lib/auth";
import { mediaRefSchema } from "@/lib/content/schema";
import { revalidatePublicSite } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type SiteSettingsUpdate = Database["public"]["Tables"]["site_settings"]["Update"];

const text = z.string().max(5000).catch("");

const siteSettingsInput = z.object({
  siteName: z.string().min(1).max(200),
  heroHeadline: text,
  heroDescription: text,
  heroLocation: text,
  heroCtaLabel: text,
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
});

export type SiteSettingsInput = z.input<typeof siteSettingsInput>;

/** Maps camelCase form fields to database columns. */
const COLUMNS: Record<keyof SiteSettingsInput, string> = {
  siteName: "site_name",
  heroHeadline: "hero_headline",
  heroDescription: "hero_description",
  heroLocation: "hero_location",
  heroCtaLabel: "hero_cta_label",
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
};

/** Saves any subset of the site settings (the Homepage and Settings pages each edit part of the row). */
export async function saveSiteSettings(input: Partial<SiteSettingsInput>) {
  return adminAction(async () => {
    const s = siteSettingsInput.partial().parse(input);
    const update: SiteSettingsUpdate = {};
    for (const [key, value] of Object.entries(s)) {
      if (value === undefined) continue;
      (update as Record<string, unknown>)[COLUMNS[key as keyof SiteSettingsInput]] = value;
    }
    if (!Object.keys(update).length) return;

    const supabase = await createClient();
    const { error } = await supabase.from("site_settings").update(update).eq("id", 1);
    if (error) throw new Error(error.message);
    revalidatePublicSite();
  });
}

/** Manual "refresh the public site" button in Settings. */
export async function refreshPublicSite() {
  return adminAction(async () => {
    revalidatePublicSite();
  });
}
