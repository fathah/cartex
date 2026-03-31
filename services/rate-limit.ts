import prisma from "@/db/prisma";
import { headers } from "next/headers";

type ConsumeRateLimitInput = {
  action: string;
  blockMs: number;
  identifier: string;
  limit: number;
  windowMs: number;
};

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfterSeconds: number,
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

function normalizeIpCandidate(value?: string | null) {
  const candidate = value?.trim();
  if (!candidate) {
    return null;
  }

  // Allow IPv4, IPv6, and IPv4-mapped IPv6 values while rejecting arbitrary text.
  if (!/^[a-fA-F0-9:.]+$/.test(candidate)) {
    return null;
  }

  return candidate;
}

export async function getRequestIp() {
  const headerStore = await headers();
  const directIp =
    normalizeIpCandidate(headerStore.get("cf-connecting-ip")) ||
    normalizeIpCandidate(headerStore.get("x-real-ip"));
  if (directIp) {
    return directIp;
  }

  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) {
    const forwardedIp = normalizeIpCandidate(forwardedFor.split(",")[0]);
    if (forwardedIp) {
      return forwardedIp;
    }
  }

  return "unknown";
}

export async function consumeRateLimit(input: ConsumeRateLimitInput) {
  const now = new Date();
  const key = `${input.action}:${input.identifier}`;

  const bucket = await prisma.rateLimitBucket.findUnique({
    where: { key },
  });

  if (!bucket) {
    await prisma.rateLimitBucket.create({
      data: {
        action: input.action,
        identifier: input.identifier,
        key,
        count: 1,
        windowStart: now,
      },
    });
    return;
  }

  if (bucket.blockedUntil && bucket.blockedUntil > now) {
    throw new RateLimitError(
      "Too many requests. Please try again later.",
      Math.ceil((bucket.blockedUntil.getTime() - now.getTime()) / 1000),
    );
  }

  const nextWindow =
    now.getTime() - bucket.windowStart.getTime() > input.windowMs;

  if (nextWindow) {
    await prisma.rateLimitBucket.update({
      where: { key },
      data: {
        blockedUntil: null,
        count: 1,
        windowStart: now,
      },
    });
    return;
  }

  const nextCount = bucket.count + 1;
  const blockedUntil =
    nextCount > input.limit ? new Date(now.getTime() + input.blockMs) : null;

  await prisma.rateLimitBucket.update({
    where: { key },
    data: {
      blockedUntil,
      count: nextCount,
    },
  });

  if (blockedUntil) {
    throw new RateLimitError(
      "Too many requests. Please try again later.",
      Math.ceil(input.blockMs / 1000),
    );
  }
}
