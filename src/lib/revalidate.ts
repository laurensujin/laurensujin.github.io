import { revalidatePath } from "next/cache";

/**
 * Tells Next.js to rebuild the cached public pages after content changes, so
 * edits appear on the live site right after publishing without a redeploy.
 */
export function revalidatePublicSite() {
  revalidatePath("/", "layout"); // homepage + shared layout (metadata, footer)
  revalidatePath("/work/[slug]", "page"); // every case study page
  revalidatePath("/sitemap.xml");
}
