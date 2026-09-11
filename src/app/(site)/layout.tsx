import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { DrawerProvider } from "@/components/site/DrawerProvider";
import { ProfileDrawer } from "@/components/site/ProfileDrawer";
import { getProfileData, getSiteSettings } from "@/lib/data/public";

// Public pages are prerendered and refreshed when content is published.
// This is only a safety net: publishing from /admin refreshes them immediately.
export const revalidate = 3600;

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, profileData] = await Promise.all([getSiteSettings(), getProfileData()]);

  return (
    <DrawerProvider>
      <Header siteName={settings.siteName} />
      <main id="top" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} links={profileData.links} />
      <ProfileDrawer data={profileData} />
    </DrawerProvider>
  );
}
