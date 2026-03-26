"use server";

import { AppConstants } from "@/constants/constants";
import { PUBLIC_ENV } from "@/constants/env_public";
import { ENV } from "@/constants/envs";
import {
  createAdminSession,
  getAdminSession,
  type AdminSessionContext,
} from "@/services/admin-session";
import { normalizeEmail } from "@/services/security";
import { ZAuthTokenService } from "@ziqx/auth";
import { decodeJwt } from "jose";
import prisma from "@/db/prisma";
import { UserRole } from "@prisma/client";

function getAdminAuthRedirectUri() {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000/auth/callback";
  }

  return `${AppConstants.PUBLIC_URL}/auth/callback`;
}

type DecodedAdminToken = {
  email: string;
  fullname: string | null;
  ziqxId: string;
};

function decodeAdminAccessToken(accessToken: string): DecodedAdminToken | null {
  const decoded = decodeJwt(accessToken);
  const email = decoded.email ? normalizeEmail(String(decoded.email)) : "";
  const ziqxId = decoded.sub ? String(decoded.sub) : "";

  if (!email || !ziqxId) {
    return null;
  }

  return {
    email,
    fullname:
      (typeof decoded.fullName === "string" && decoded.fullName) ||
      (typeof decoded.name === "string" && decoded.name) ||
      null,
    ziqxId,
  };
}

async function resolveAdminUser(accessToken: string) {
  const tokenService = new ZAuthTokenService();
  const isValid = await tokenService.validate(accessToken);
  if (!isValid) {
    return null;
  }

  const decoded = decodeAdminAccessToken(accessToken);
  if (!decoded) {
    return null;
  }

  const activeAdminCount = await prisma.user.count({
    where: {
      deletedAt: null,
    },
  });

  if (activeAdminCount === 0) {
    return prisma.user.create({
      data: {
        email: decoded.email,
        fullname: decoded.fullname || "System Admin",
        role: UserRole.SUPER_ADMIN,
        ziqxId: decoded.ziqxId,
      },
    });
  }

  const user = await prisma.user.findFirst({
    where: {
      deletedAt: null,
      OR: [{ email: decoded.email }, { ziqxId: decoded.ziqxId }],
    },
  });

  if (!user) {
    return null;
  }

  if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    return null;
  }

  return prisma.user.update({
    where: { id: user.id },
    data: {
      email: decoded.email,
      fullname: decoded.fullname || user.fullname,
      ziqxId: decoded.ziqxId,
    },
  });
}

export async function authenticateAdminWithCode(code: string) {
  const auth = new ZAuthTokenService();
  const response = await auth.getAuthToken({
    authAppKey: PUBLIC_ENV.ZAUTH_KEY!,
    authSecret: ENV.ZAUTH_SECRET!,
    code,
    codeVerifier: "cartex",
    redirectUri: getAdminAuthRedirectUri(),
  });

  const accessToken = response?.access_token;
  if (!accessToken) {
    return null;
  }

  const user = await resolveAdminUser(accessToken);
  if (!user) {
    return null;
  }

  return createAdminSession(user.id);
}

export async function validateAdminAuthToken() {
  return !!(await getAdminSession());
}

export async function requireAdminAuth() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireAdminRole(role: UserRole) {
  const session = await requireAdminAuth();
  if (role === UserRole.SUPER_ADMIN && session.role !== UserRole.SUPER_ADMIN) {
    throw new Error("Forbidden");
  }

  return session;
}

export function canManageAdminRole(
  session: AdminSessionContext,
  targetRole: UserRole,
) {
  if (targetRole === UserRole.SUPER_ADMIN) {
    return session.role === UserRole.SUPER_ADMIN;
  }

  return (
    session.role === UserRole.ADMIN || session.role === UserRole.SUPER_ADMIN
  );
}
