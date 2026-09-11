import type { MediaRef } from "@/lib/content/schema";

export const MEDIA_BUCKET = "media";

/** Public URL of a file in the `media` storage bucket. */
export function mediaUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${encoded}`;
}

export function refUrl(ref: MediaRef | null | undefined): string | null {
  return ref?.path ? mediaUrl(ref.path) : null;
}

/** Aspect ratio (width / height) of an image reference, or a sensible default. */
export function refAspect(ref: MediaRef | null | undefined, fallback = 4 / 5): number {
  if (ref?.width && ref?.height) return ref.width / ref.height;
  return fallback;
}
