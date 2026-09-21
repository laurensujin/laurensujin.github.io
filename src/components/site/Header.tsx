"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent } from "react";
import { useDrawer } from "./DrawerProvider";

export function Header({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const { openDrawer, open } = useDrawer();
  const isHome = pathname === "/";

  // On the homepage the name scrolls to the top and WORK scrolls to the grid.
  // Elsewhere they are normal links back to the homepage.
  const scrollTo = (event: MouseEvent<HTMLAnchorElement>, id: string | null) => {
    if (!isHome) return;
    event.preventDefault();
    if (id) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-[88rem] items-center justify-between px-6 md:px-10" aria-label="Main">
        <Link href="/" onClick={(e) => scrollTo(e, null)} className="link-line text-sm font-medium text-fg" aria-label={`${siteName}, back to top`}>
          {siteName}
        </Link>
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/#work" onClick={(e) => scrollTo(e, "work")} className="link-line text-sm font-medium text-fg">
            Work
          </Link>
          <button
            type="button"
            onClick={(e) => openDrawer(e.currentTarget)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="profile-drawer"
            className="link-line cursor-pointer text-sm font-medium text-fg"
          >
            Profile
          </button>
        </div>
      </nav>
    </header>
  );
}
