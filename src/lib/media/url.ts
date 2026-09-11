import type { MediaRef } from "@/lib/content/schema";

export const MEDIA_BUCKET = "media";

/** Widths of the resized copies generated for every uploaded photo. */
export const RENDITION_WIDTHS = [480, 960, 1600, 2400];

/** Public URL of a file in the `media` storage bucket. */
export function mediaUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${encoded}`;
}

export function refUrl(ref: MediaRef | null | undefined): string | null {
  return ref?.path ? mediaUrl(ref.path) : null;
}

/**
 * URL to hand to next/image: the original file plus a `?w=` list of the
 * resized copies, which the image loader uses to pick the best size.
 */
export function imageSrc(ref: MediaRef): string | null {
  const url = refUrl(ref);
  if (!url) return null;
  return ref.sizes?.length ? `${url}?w=${ref.sizes.join(",")}` : url;
}

/** Storage path of the resized copy: images/2026/09/abc.jpg → images/2026/09/abc-w960.jpg */
export function renditionPath(path: string, width: number): string {
  const dot = path.lastIndexOf(".");
  const ext = path.slice(dot + 1).toLowerCase();
  return `${path.slice(0, dot)}-w${width}.${ext === "png" ? "png" : "jpg"}`;
}

/** Given an image src with `?w=…`, returns the smallest copy at least `width` wide. */
export function pickRendition(src: string, width: number): string {
  const q = src.indexOf("?");
  if (q === -1) return src;
  const base = src.slice(0, q);
  const w = new URLSearchParams(src.slice(q + 1)).get("w");
  if (!w) return src;
  const sizes = w
    .split(",")
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
  const pick = sizes.find((s) => s >= width);
  if (!pick) return base; // nothing large enough: serve the original
  return renditionPath(base, pick);
}

/** Aspect ratio (width / height) of an image reference, or a sensible default. */
export function refAspect(ref: MediaRef | null | undefined, fallback = 4 / 5): number {
  if (ref?.width && ref?.height) return ref.width / ref.height;
  return fallback;
}
