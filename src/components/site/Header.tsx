"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent } from "react";
import { useDrawer } from "./DrawerProvider";

export function Header({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const { openDrawer, open } = useDrawer();
  const isHome = pathname === "/";
  const onWork = pathname.startsWith("/work");

  // Current section stays in ink with a standing underline; the rest sit back.
  const navClass = (active: boolean) =>
    `eyebrow cursor-pointer decoration-1 underline-offset-[6px] transition-colors duration-200 ${
      active ? "text-fg underline" : "text-fg-muted hover:text-fg"
    }`;

  // On the homepage the name scrolls to the top and Work scrolls to the grid.
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
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-[80rem] items-center justify-between px-6 md:px-10" aria-label="Main">
        <Link
          href="/"
          onClick={(e) => scrollTo(e, null)}
          className="link-line t-title text-fg"
          aria-label={`${siteName}, back to top`}
        >
          {siteName}
        </Link>
        <div className="flex items-center gap-7 md:gap-9">
          <Link
            href="/#work"
            onClick={(e) => scrollTo(e, "work")}
            aria-current={onWork ? "page" : undefined}
            className={navClass(onWork)}
          >
            Work
          </Link>
          <button
            type="button"
            onClick={(e) => openDrawer(e.currentTarget)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="profile-drawer"
            className={navClass(open)}
          >
            Profile
          </button>
        </div>
      </nav>
    </header>
  );
}
