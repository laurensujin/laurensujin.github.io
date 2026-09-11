import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "./env";

const AUTH_PAGES = new Set(["/admin/login", "/admin/forgot-password", "/admin/reset-password"]);

/**
 * Runs before every /admin request: refreshes the Supabase session cookie and
 * sends visitors who are not signed in to the login page.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = supabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Do not add code between createServerClient and getUser(): it can cause
  // hard-to-debug logout issues (see Supabase SSR docs).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminArea = path === "/admin" || path.startsWith("/admin/");
  const isAuthPage = AUTH_PAGES.has(path);

  if (isAdminArea && !isAuthPage && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = path !== "/admin" ? `?next=${encodeURIComponent(path)}` : "";
    return NextResponse.redirect(loginUrl);
  }

  if (path === "/admin/login" && user) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    adminUrl.search = "";
    return NextResponse.redirect(adminUrl);
  }

  return response;
}
