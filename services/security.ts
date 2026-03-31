import { ENV } from "@/constants/envs";
import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "crypto";

const DEFAULT_UPLOAD_PREFIX = "media";
export const MAX_MEDIA_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_MEDIA_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
  "image/x-icon": "ico",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

function getSecuritySecret() {
  const secret = ENV.JWT_SECRET || ENV.APP_CONFIG_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      "JWT_SECRET or APP_CONFIG_ENCRYPTION_KEY must be configured",
    );
  }

  return secret;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateSecureToken(size = 32) {
  return randomBytes(size).toString("base64url");
}

export function generateOtpCode() {
  return `${randomInt(100000, 1000000)}`;
}

export function hashOtp(email: string, otp: string) {
  return createHmac("sha256", getSecuritySecret())
    .update(`${normalizeEmail(email)}:${otp}`)
    .digest("hex");
}

export function verifyOtpHash(email: string, otp: string, otpHash?: string | null) {
  if (!otpHash) {
    return false;
  }

  const expected = Buffer.from(hashOtp(email, otp));
  const current = Buffer.from(otpHash);

  if (expected.length !== current.length) {
    return false;
  }

  return timingSafeEqual(expected, current);
}

export function maskSecret(value?: string | null) {
  if (!value) {
    return "";
  }

  if (value.length <= 8) {
    return "••••••••";
  }

  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

function getFileExtension(fileName: string, mimeType: string) {
  const explicitExtension = fileName.split(".").pop()?.trim().toLowerCase();
  if (explicitExtension) {
    return explicitExtension.replace(/[^a-z0-9]/g, "");
  }

  return MIME_TO_EXTENSION[mimeType] || "bin";
}

export function buildStorageFileName(fileName: string, mimeType: string) {
  const now = new Date();
  const extension = getFileExtension(fileName, mimeType);
  const year = now.getUTCFullYear();
  const month = `${now.getUTCMonth() + 1}`.padStart(2, "0");

  return `${DEFAULT_UPLOAD_PREFIX}/${year}/${month}/${randomUUID()}.${extension}`;
}

export function validateMediaUpload(input: {
  fileName: string;
  mimeType: string;
  size: number;
}) {
  if (!input.fileName.trim()) {
    throw new Error("File name is required");
  }

  if (!ALLOWED_MEDIA_MIME_TYPES.has(input.mimeType)) {
    throw new Error("Unsupported file type");
  }

  if (input.size <= 0 || input.size > MAX_MEDIA_UPLOAD_BYTES) {
    throw new Error("File is too large");
  }
}
