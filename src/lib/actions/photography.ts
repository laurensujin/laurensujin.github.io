"use server";

import { z } from "zod";
import { adminAction } from "@/lib/auth";
import { mediaRefSchema, PROJECT_STATUSES, type ContentStatus } from "@/lib/content/schema";
import { revalidatePublicSite } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

const text = z.string().max(2000).catch("");

const setInput = z.object({
  id: z.uuid().optional(),
  title: text,
  caption: text,
  before: mediaRefSchema.nullable().catch(null),
  after: mediaRefSchema.nullable().catch(null),
  photographerCredit: text,
  retouchingCredit: text,
  status: z.enum(PROJECT_STATUSES).catch("draft"),
});

export type PhotographySetInput = z.input<typeof setInput>;

export async function savePhotographySet(input: PhotographySetInput) {
  return adminAction(async () => {
    const set = setInput.parse(input);
    const supabase = await createClient();

    const row = {
      title: set.title,
      caption: set.caption,
      before_image: set.before as unknown as Json,
      after_image: set.after as unknown as Json,
      photographer_credit: set.photographerCredit,
      retouching_credit: set.retouchingCredit,
      status: set.status,
    };

    if (set.id) {
      const { error } = await supabase.from("photography_sets").update(row).eq("id", set.id);
      if (error) throw new Error(error.message);
      revalidatePublicSite();
      return { id: set.id };
    }

    const { data: last } = await supabase
      .from("photography_sets")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const { data, error } = await supabase
      .from("photography_sets")
      .insert({ ...row, sort_order: (last?.[0]?.sort_order ?? 0) + 1 })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    revalidatePublicSite();
    return { id: data.id };
  });
}

export async function setPhotographySetStatus(id: string, status: ContentStatus) {
  return adminAction(async () => {
    const supabase = await createClient();
    const { error } = await supabase.from("photography_sets").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePublicSite();
  });
}

export async function reorderPhotographySets(ids: string[]) {
  return adminAction(async () => {
    const supabase = await createClient();
    const { error } = await supabase.rpc("reorder_photography_sets", { ids });
    if (error) throw new Error(error.message);
    revalidatePublicSite();
  });
}

export async function deletePhotographySet(id: string) {
  return adminAction(async () => {
    const supabase = await createClient();
    const { error } = await supabase.from("photography_sets").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePublicSite();
  });
}
