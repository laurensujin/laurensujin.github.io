import { redirect } from "next/navigation";
import { AuthForm } from "@/components/admin/AuthForm";
import { updatePassword } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage() {
  // The email link signs the user in first (see /auth/callback), so anyone
  // landing here without a session should request a new link.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login?error=link");

  return <AuthForm mode="reset" action={updatePassword} />;
}
