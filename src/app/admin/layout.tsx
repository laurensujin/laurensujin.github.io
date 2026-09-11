import type { Metadata } from "next";
import { ToastProvider } from "@/components/admin/Toast";

export const metadata: Metadata = {
  title: { absolute: "Admin" },
  robots: { index: false, follow: false },
};

// The admin is personal and must never be cached or prerendered.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="admin-root min-h-screen font-sans">
      <ToastProvider>{children}</ToastProvider>
    </div>
  );
}
