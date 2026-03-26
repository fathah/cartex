import { NextRequest, NextResponse } from "next/server";
import { AppKeys } from "@/constants/keys";
import {
  authenticateAdminWithCode,
} from "@/services/zauth";
import { getAdminSessionCookieOptions } from "@/services/admin-session";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/auth?error=missing_code", request.url));
  }

  const session = await authenticateAdminWithCode(code);
  if (!session) {
    return NextResponse.redirect(new URL("/auth?error=invalid_auth", request.url));
  }

  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set(
    AppKeys.ADMIN_SESSION_TOKEN,
    session.token,
    getAdminSessionCookieOptions(session.expiresAt),
  );
  response.cookies.delete(AppKeys.ADMIN_AUTH_TOKEN);

  return response;
}
