import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { getSiteSettings } from "@/lib/data/public";
import { refUrl } from "@/lib/media/url";
import { siteUrl } from "@/lib/supabase/env";
import { ThemeScript } from "@/components/site/ThemeScript";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings.seoTitle || settings.siteName;
  const ogImage = refUrl(settings.ogImage);
  const favicon = refUrl(settings.favicon);

  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s | ${settings.siteName}` },
    description: settings.seoDescription || settings.heroDescription || undefined,
    openGraph: {
      title,
      description: settings.seoDescription || settings.heroDescription || undefined,
      siteName: settings.siteName,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: { card: ogImage ? "summary_large_image" : "summary" },
    ...(favicon ? { icons: { icon: favicon } } : {}),
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} h-full`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
