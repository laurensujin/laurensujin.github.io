"use client";

import type { ReactNode } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";

/** Every admin page sits behind the sign-in guard and inside the sidebar shell. */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AdminGuard>{(email) => <AdminShell email={email}>{children}</AdminShell>}</AdminGuard>;
}
