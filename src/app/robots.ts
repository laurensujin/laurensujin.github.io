import type { MetadataRoute } from "next";

// Generated once at build time (required for the static export).
export const dynamic = "force-static";
import { siteUrl } from "@/lib/supabase/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/auth"] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
