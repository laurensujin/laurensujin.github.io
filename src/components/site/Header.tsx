"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { useDrawer } from "./DrawerProvider";

export function Header({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const { openDrawer, open } = useDrawer();
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(false);
  const isHome = pathname === "/";

  // Solid background once scrolled; light text while floating over the hero image.
  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("hero");
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
      setOverHero(Boolean(hero) && heroBottom > 72);
      setScrolled(window.scrollY > 8 && !(hero && heroBottom > 72));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

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
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,color] duration-500",
        scrolled ? "border-b border-line bg-bg/85 backdrop-blur-md" : "border-b border-transparent bg-transparent",
        overHero ? "[&_.link-line]:text-[#f5f2ec]" : "[&_.link-line]:text-fg",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[88rem] items-center justify-between px-6 md:px-10" aria-label="Main">
        <Link href="/" onClick={(e) => scrollTo(e, null)} className="eyebrow link-line text-fg" aria-label={`${siteName}, back to top`}>
          {siteName}
        </Link>
        <div className="flex items-center gap-8 md:gap-12">
          <Link href="/#work" onClick={(e) => scrollTo(e, "work")} className="eyebrow link-line text-fg">
            Work
          </Link>
          <button
            type="button"
            onClick={(e) => openDrawer(e.currentTarget)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="profile-drawer"
            className="eyebrow link-line cursor-pointer text-fg"
          >
            Profile
          </button>
        </div>
      </nav>
    </header>
  );
}
