"use server";

import { z } from "zod";
import { adminAction } from "@/lib/auth";
import { mediaRefSchema } from "@/lib/content/schema";
import { revalidatePublicSite } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

const text = z.string().max(5000).catch("");

const educationInput = z.object({
  id: z.uuid(),
  school: text,
  college: text,
  degree: text,
  major: text,
  graduation: text,
});

const linkInput = z.object({
  id: z.uuid(),
  label: z.string().min(1).max(100),
  url: z.string().max(2000).catch(""),
  kind: z.enum(["linkedin", "instagram", "email", "github", "website", "other"]).catch("other"),
  showInProfile: z.boolean().catch(true),
  showInFooter: z.boolean().catch(true),
});

const profileInput = z.object({
  profile: z.object({
    name: z.string().min(1).max(200),
    title: text,
    location: text,
    about: text,
    image: mediaRefSchema.nullable().catch(null),
  }),
  education: z.array(educationInput).max(20),
  links: z.array(linkInput).max(30),
});

export type ProfileInput = z.input<typeof profileInput>;

/** Saves the profile, the education list and the links list in one go. */
export async function saveProfile(input: ProfileInput) {
  return adminAction(async () => {
    const data = profileInput.parse(input);
    const supabase = await createClient();

    const profileUpdate = await supabase
      .from("profile")
      .update({
        name: data.profile.name,
        title: data.profile.title,
        location: data.profile.location,
        about: data.profile.about,
        image: data.profile.image as unknown as Json,
      })
      .eq("id", 1);
    if (profileUpdate.error) throw new Error(profileUpdate.error.message);

    // Education: upsert the rows we were given, delete the ones that were removed.
    const educationRows = data.education.map((e, index) => ({
      id: e.id,
      school: e.school,
      college: e.college,
      degree: e.degree,
      major: e.major,
      graduation: e.graduation,
      sort_order: index + 1,
    }));
    if (educationRows.length) {
      const { error } = await supabase.from("education").upsert(educationRows, { onConflict: "id" });
      if (error) throw new Error(error.message);
    }
    const keepEducation = educationRows.map((r) => r.id);
    const eduDelete = keepEducation.length
      ? await supabase.from("education").delete().not("id", "in", `(${keepEducation.join(",")})`)
      : await supabase.from("education").delete().gte("sort_order", 0);
    if (eduDelete.error) throw new Error(eduDelete.error.message);

    // Links: same approach.
    const linkRows = data.links.map((l, index) => ({
      id: l.id,
      label: l.label,
      url: l.url.trim(),
      kind: l.kind,
      show_in_profile: l.showInProfile,
      show_in_footer: l.showInFooter,
      sort_order: index + 1,
    }));
    if (linkRows.length) {
      const { error } = await supabase.from("social_links").upsert(linkRows, { onConflict: "id" });
      if (error) throw new Error(error.message);
    }
    const keepLinks = linkRows.map((r) => r.id);
    const linkDelete = keepLinks.length
      ? await supabase.from("social_links").delete().not("id", "in", `(${keepLinks.join(",")})`)
      : await supabase.from("social_links").delete().gte("sort_order", 0);
    if (linkDelete.error) throw new Error(linkDelete.error.message);

    revalidatePublicSite();
  });
}
