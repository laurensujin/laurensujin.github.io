"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { IconClose, IconExternal, IconMenu } from "./icons";

const NAV = [
  { href: "/admin/", label: "Dashboard" },
  { href: "/admin/projects/", label: "Projects" },
  { href: "/admin/photography/", label: "Photography" },
  { href: "/admin/profile/", label: "Profile" },
  { href: "/admin/homepage/", label: "Homepage" },
  { href: "/admin/resume/", label: "Resume" },
  { href: "/admin/media/", label: "Media Library" },
  { href: "/admin/settings/", label: "Settings" },
];

/** Sidebar + top bar around every admin page. */
export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    const target = href.replace(/\/$/, "");
    return target === "/admin" ? pathname === "/admin" : pathname.startsWith(target);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/admin/login/");
  };

  const nav = (
    <nav className="flex flex-col gap-0.5" aria-label="Admin">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-2 text-sm",
            isActive(item.href) ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-200/70",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="admin-root flex min-h-screen font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-neutral-200 bg-neutral-100 px-3 py-4 md:flex">
        <Link href="/admin/" className="mb-6 px-3 text-sm font-semibold tracking-tight text-neutral-900">
          Portfolio Admin
        </Link>
        {nav}
        <div className="mt-auto flex flex-col gap-2 px-3 pt-6 text-xs text-neutral-500">
          <a href="/" target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-neutral-900">
            View site <IconExternal width={12} height={12} />
          </a>
          <span className="truncate" title={email}>
            {email}
          </span>
          <button type="button" onClick={handleSignOut} className="cursor-pointer text-left underline underline-offset-2 hover:text-neutral-900">
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
          <Link href="/admin/" className="text-sm font-semibold">
            Portfolio Admin
          </Link>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Menu" className="cursor-pointer rounded p-1.5 hover:bg-neutral-100">
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </header>
        {open ? (
          <div className="border-b border-neutral-200 bg-neutral-50 px-3 py-3 md:hidden">
            {nav}
            <div className="mt-3 flex items-center justify-between px-3 text-xs text-neutral-500">
              <a href="/" target="_blank" rel="noopener" className="inline-flex items-center gap-1">
                View site <IconExternal width={12} height={12} />
              </a>
              <button type="button" onClick={handleSignOut} className="cursor-pointer underline underline-offset-2">
                Sign out
              </button>
            </div>
          </div>
        ) : null}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
