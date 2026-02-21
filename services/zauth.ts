"use server";

import { AppConstants } from "@/constants/constants";
import { AppKeys } from "@/constants/keys";
import { ZAuthTokenService } from "@ziqx/auth";
import { cookies } from "next/headers";

export async function validateAdminAuthToken(code?: string) {
  console.log("Validate Admin Auth Token", code);

  let token = code;
  if (!code) {
    const store = await cookies();
    token = store.get(AppKeys.ADMIN_AUTH_TOKEN)?.value;
  }

  if (!token) {
    return false;
  }

  const tokenService = new ZAuthTokenService();

  const isValid = await tokenService.validate(token);

  console.log("isValid", isValid);

  if (isValid) {
    return true;
  } else {
    return false;
  }
}

export async function requireAdminAuth() {
  const isValid = await validateAdminAuthToken();
  if (!isValid) {
    throw new Error("Unauthorized");
  }
}

export async function getZiqxAccessToken(authcode?: string) {
  if (!authcode) {
    return null;
  }
  const redirectUri =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/auth"
      : `${AppConstants.PUBLIC_URL}/auth`;
  const codeVerifier = "cartex";
  const auth = new ZAuthTokenService();
  const resp = await auth.getAuthToken({
    authAppKey: process.env.NEXT_PUBLIC_ZAUTH_KEY!,
    authSecret: process.env.ZAUTH_SECRET!,
    code: authcode,
    redirectUri,
    codeVerifier,
  });
  console.log("resp", resp);

  return resp?.access_token;
}
