"use client";

import { pickRendition } from "./url";

/**
 * Custom next/image loader. `src` is the original file URL, optionally with a
 * `?w=480,960,...` query listing the resized copies that exist for it. The
 * loader returns the smallest copy that is at least `width` pixels wide, or
 * the original when no copy is large enough (or none exist).
 */
export default function supabaseImageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  return pickRendition(src, width);
}
