"use server";

import prisma from "@/db/prisma";
import { AppKeys } from "@/constants/keys";
import { hashToken, generateSecureToken } from "@/services/security";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";

const ADMIN_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type AdminSessionContext = {
  email: string;
  fullname: string | null;
  role: UserRole;
  sessionId: string;
  userId: string;
};

export function getAdminSessionCookieOptions(expiresAt: Date) {
  return {
    expires: expiresAt,
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function createAdminSession(userId: string) {
  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_MS);

  const session = await prisma.adminSession.create({
    data: {
      expiresAt,
      tokenHash,
      userId,
    },
  });

  return {
    expiresAt,
    sessionId: session.id,
    token,
  };
}

export async function getAdminSessionByToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);
  const session = await prisma.adminSession.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  const now = new Date();
  if (
    session.revokedAt ||
    session.expiresAt <= now ||
    session.user.deletedAt ||
    !session.user.email
  ) {
    return null;
  }

  return {
    email: session.user.email,
    fullname: session.user.fullname,
    role: session.user.role,
    sessionId: session.id,
    userId: session.user.id,
  } satisfies AdminSessionContext;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return getAdminSessionByToken(
    cookieStore.get(AppKeys.ADMIN_SESSION_TOKEN)?.value,
  );
}

export async function revokeAdminSession(token?: string | null) {
  if (!token) {
    return;
  }

  await prisma.adminSession.updateMany({
    where: {
      tokenHash: hashToken(token),
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function destroyCurrentAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AppKeys.ADMIN_SESSION_TOKEN)?.value;

  if (sessionToken) {
    await revokeAdminSession(sessionToken);
  }

  cookieStore.delete(AppKeys.ADMIN_SESSION_TOKEN);
  cookieStore.delete(AppKeys.ADMIN_AUTH_TOKEN);
}
