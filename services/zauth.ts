"use server";

import { AppConstants } from "@/constants/constants";
import { PUBLIC_ENV } from "@/constants/env_public";
import { ENV } from "@/constants/envs";
import { AppKeys } from "@/constants/keys";
import { ZAuthTokenService } from "@ziqx/auth";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import prisma from "@/db/prisma";
import { UserRole } from "@prisma/client";

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
    try {
      const decoded = decodeJwt(token);
      const email = decoded.email as string;
      const ziqxId = decoded.sub as string;

      if (!email && !ziqxId) return false;

      const userCount = await prisma.user.count();

      // Bootstrap Mode: If 0 users exist, anyone with a valid ZAuth token becomes SUPER_ADMIN
      if (userCount === 0) {
        await prisma.user.create({
          data: {
            email,
            ziqxId,
            fullname: (decoded.name as string) || "System Admin",
            role: UserRole.SUPER_ADMIN,
          },
        });
        return true;
      }

      // Authorization Mode: Verify user exists and has a management role
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ ziqxId }, { email }],
        },
      });

      if (
        user &&
        (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN)
      ) {
        // Sync ziqxId if it's missing (e.g. legacy local user migrated to ZAuth)
        if (!user.ziqxId && ziqxId) {
          await prisma.user.update({
            where: { id: user.id },
            data: { ziqxId },
          });
        }
        return true;
      }

      return false;
    } catch (e) {
      console.error("Auth authorization check failed:", e);
      return false;
    }
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
