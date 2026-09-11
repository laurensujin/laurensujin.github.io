"use client";

import { z } from "zod";
import { runAdmin } from "@/lib/auth-client";
import { toResumeFile } from "@/lib/data/mappers";
import { publishToSite } from "@/lib/deploy";
import { MEDIA_BUCKET } from "@/lib/media/url";

const registerInput = z.object({
  path: z.string().min(1).max(500),
  filename: z.string().min(1).max(300),
  sizeBytes: z.number().int().nonnegative(),
});

/** Records an uploaded PDF and makes it the active resume. */
export async function registerResume(input: z.input<typeof registerInput>) {
  return runAdmin(async (supabase) => {
    const r = registerInput.parse(input);

    const deactivate = await supabase.from("resume_files").update({ is_active: false }).eq("is_active", true);
    if (deactivate.error) throw new Error(deactivate.error.message);

    const { data, error } = await supabase
      .from("resume_files")
      .insert({ path: r.path, filename: r.filename, size_bytes: r.sizeBytes, is_active: true })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await publishToSite(supabase);
    return toResumeFile(data);
  });
}

export async function setActiveResume(id: string) {
  return runAdmin(async (supabase) => {
    const deactivate = await supabase.from("resume_files").update({ is_active: false }).eq("is_active", true);
    if (deactivate.error) throw new Error(deactivate.error.message);
    const { error } = await supabase.from("resume_files").update({ is_active: true }).eq("id", id);
    if (error) throw new Error(error.message);
    return publishToSite(supabase);
  });
}

export async function deleteResume(id: string) {
  return runAdmin(async (supabase) => {
    const { data, error } = await supabase.from("resume_files").select("*").eq("id", id).single();
    if (error) throw new Error(error.message);

    const storage = await supabase.storage.from(MEDIA_BUCKET).remove([data.path]);
    if (storage.error) throw new Error(storage.error.message);

    const removed = await supabase.from("resume_files").delete().eq("id", id);
    if (removed.error) throw new Error(removed.error.message);
    return publishToSite(supabase);
  });
}
