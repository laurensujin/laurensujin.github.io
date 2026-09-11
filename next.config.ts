import type { NextConfig } from "next";

/**
 * The site is exported as static files (the `out/` folder) and served by
 * GitHub Pages. Everything dynamic (the admin, publishing) runs in the
 * browser against Supabase; the public pages are rebuilt by GitHub Actions
 * when content changes.
 */
const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages serves folders as `/path/index.html`, so links end with `/`.
  trailingSlash: true,
  images: {
    // Images are resized at upload time (see src/lib/media/upload.ts); this
    // loader picks the right copy for the requested width.
    loader: "custom",
    loaderFile: "./src/lib/media/image-loader.ts",
    qualities: [60, 75, 85, 90],
  },
};

export default nextConfig;
