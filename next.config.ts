import type { NextConfig } from "next";

/**
 * Images are served from Supabase Storage. next/image only optimizes hosts it
 * has been told to trust, so we allow the Supabase storage path on:
 *   - any *.supabase.co project (production)
 *   - localhost / 127.0.0.1 (the local Supabase stack used in development)
 *   - whatever NEXT_PUBLIC_SUPABASE_URL points at (custom domains)
 */
const STORAGE_PATH = "/storage/v1/object/public/**";

function envHostPattern() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return [];
  try {
    const url = new URL(raw);
    return [
      {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port,
        pathname: STORAGE_PATH,
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: STORAGE_PATH },
      { protocol: "http", hostname: "127.0.0.1", pathname: STORAGE_PATH },
      { protocol: "http", hostname: "localhost", pathname: STORAGE_PATH },
      ...envHostPattern(),
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85, 90],
    // The local Supabase stack lives on 127.0.0.1, which the optimizer refuses
    // by default (SSRF protection). Allow it during `next dev` only.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    // Uploaded files get unique names and never change, so the optimized
    // versions can be cached for a long time.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
