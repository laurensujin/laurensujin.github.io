"use client";

import { z } from "zod";
import { runAdmin } from "@/lib/auth-client";
import { mediaRefSchema, PROJECT_STATUSES, type ContentStatus } from "@/lib/content/schema";
import { publishToSite } from "@/lib/deploy";
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
  return runAdmin(async (supabase) => {
    const set = setInput.parse(input);
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
      const rebuild = await publishToSite(supabase);
      return { id: set.id, rebuild };
    }

    const { data: last } = await supabase.from("photography_sets").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    const { data, error } = await supabase
      .from("photography_sets")
      .insert({ ...row, sort_order: (last?.[0]?.sort_order ?? 0) + 1 })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const rebuild = await publishToSite(supabase);
    return { id: data.id, rebuild };
  });
}

export async function setPhotographySetStatus(id: string, status: ContentStatus) {
  return runAdmin(async (supabase) => {
    const { error } = await supabase.from("photography_sets").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    return publishToSite(supabase);
  });
}

export async function reorderPhotographySets(ids: string[]) {
  return runAdmin(async (supabase) => {
    const { error } = await supabase.rpc("reorder_photography_sets", { ids });
    if (error) throw new Error(error.message);
    return publishToSite(supabase);
  });
}

export async function deletePhotographySet(id: string) {
  return runAdmin(async (supabase) => {
    const { error } = await supabase.from("photography_sets").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return publishToSite(supabase);
  });
}
