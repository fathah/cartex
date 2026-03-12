"use server";

import { AppConstants } from "@/constants/constants";
import { PUBLIC_ENV } from "@/constants/env_public";
import { ENV } from "@/constants/envs";
import { AppKeys } from "@/constants/keys";
import { ZAuthTokenService } from "@ziqx/auth";
import { cookies } from "next/headers";

export async function validateAdminAuthToken(code?: string) {
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
    authAppKey: PUBLIC_ENV.ZAUTH_KEY!,
    authSecret: ENV.ZAUTH_SECRET!,
    code: authcode,
    redirectUri,
    codeVerifier,
  });
  console.log("resp", resp);

  return resp?.access_token;
}
