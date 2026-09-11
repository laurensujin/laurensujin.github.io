import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/auth";

export default async function DashboardLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdminPage();
  return <AdminShell email={user.email ?? ""}>{children}</AdminShell>;
}
