import { AuthForm } from "@/components/admin/AuthForm";
import { signIn } from "@/lib/actions/auth";

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const notice = params.error === "link" ? "That link is invalid or has expired. Request a new one below." : undefined;
  return <AuthForm mode="login" action={signIn} next={next} notice={notice} />;
}
