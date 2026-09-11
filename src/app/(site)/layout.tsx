import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { DrawerProvider } from "@/components/site/DrawerProvider";
import { ProfileDrawer } from "@/components/site/ProfileDrawer";
import { getProfileData, getSiteSettings } from "@/lib/data/public";

// Public pages are generated at build time by GitHub Actions and served as
// static files. Publishing from /admin triggers a rebuild (see deploy.yml).

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
