import prisma from "@/db/prisma";
import { ENV } from "@/constants/envs";
import { maskSecret } from "@/services/security";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

type GatewayLike = {
  code: string;
  config: unknown;
  id: string;
  secretConfig?: string | null;
};

export const GATEWAY_SECRET_KEYS: Record<string, string[]> = {
  network_international: ["apiKey"],
  phonepe: ["saltKey"],
  razorpay: ["keySecret", "webhookSecret"],
  stripe: ["secretKey", "webhookSecret"],
};

function getEncryptionKey() {
  const rawKey = ENV.APP_CONFIG_ENCRYPTION_KEY;
  if (!rawKey) {
    throw new Error("APP_CONFIG_ENCRYPTION_KEY must be configured");
  }

  return createHash("sha256").update(rawKey).digest();
}

function normalizeConfig(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Record<string, string>;
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) => {
      if (entry === null || entry === undefined) {
        return [];
      }

      return [[key, String(entry)]];
    }),
  );
}

export function encryptGatewaySecrets(secretConfig: Record<string, string>) {
  if (!Object.keys(secretConfig).length) {
    return null;
  }

  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(secretConfig), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return JSON.stringify({
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  });
}

export function decryptGatewaySecrets(secretConfig?: string | null) {
  if (!secretConfig) {
    return {} as Record<string, string>;
  }

  const payload = JSON.parse(secretConfig) as {
    ciphertext: string;
    iv: string;
    tag: string;
  };
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(payload.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");

  return normalizeConfig(JSON.parse(plaintext));
}

export function splitGatewayConfig(code: string, config: unknown) {
  const normalized = normalizeConfig(config);
  const secretKeys = new Set(GATEWAY_SECRET_KEYS[code] || []);
  const publicConfig: Record<string, string> = {};
  const secretConfig: Record<string, string> = {};

  for (const [key, value] of Object.entries(normalized)) {
    if (secretKeys.has(key)) {
      secretConfig[key] = value;
    } else {
      publicConfig[key] = value;
    }
  }

  return {
    publicConfig,
    secretConfig,
  };
}

export async function resolveGatewayConfig(gateway: GatewayLike) {
  let publicConfig = normalizeConfig(gateway.config);
  let secretConfig = decryptGatewaySecrets(gateway.secretConfig);

  if (!gateway.secretConfig) {
    const split = splitGatewayConfig(gateway.code, publicConfig);
    if (Object.keys(split.secretConfig).length > 0) {
      const updated = await prisma.paymentGateway.update({
        where: { id: gateway.id },
        data: {
          config: split.publicConfig,
          secretConfig: encryptGatewaySecrets(split.secretConfig),
        },
      });
      publicConfig = normalizeConfig(updated.config);
      secretConfig = split.secretConfig;
    }
  }

  return {
    publicConfig,
    secretConfig,
    mergedConfig: {
      ...publicConfig,
      ...secretConfig,
    },
  };
}

export async function buildGatewayAdminDto(gateway: GatewayLike & {
  environment: string;
  isActive: boolean;
  name: string;
}) {
  const resolved = await resolveGatewayConfig(gateway);

  return {
    code: gateway.code,
    config: resolved.publicConfig,
    environment: gateway.environment,
    id: gateway.id,
    isActive: gateway.isActive,
    maskedSecrets: Object.fromEntries(
      Object.entries(resolved.secretConfig).map(([key, value]) => [
        key,
        maskSecret(value),
      ]),
    ),
    name: gateway.name,
  };
}

export async function mergeGatewayConfigForSave(input: {
  code: string;
  config: unknown;
  existingGateway?: GatewayLike;
}) {
  const existingResolved = input.existingGateway
    ? await resolveGatewayConfig(input.existingGateway)
    : {
        publicConfig: {},
        secretConfig: {},
      };

  const normalized = normalizeConfig(input.config);
  const publicConfig = {
    ...existingResolved.publicConfig,
  };
  const secretConfig = {
    ...existingResolved.secretConfig,
  };

  for (const [key, value] of Object.entries(
    splitGatewayConfig(input.code, normalized).publicConfig,
  )) {
    publicConfig[key] = value;
  }

  for (const secretKey of GATEWAY_SECRET_KEYS[input.code] || []) {
    const nextValue = normalized[secretKey];
    if (nextValue && nextValue.trim()) {
      secretConfig[secretKey] = nextValue.trim();
    }
  }

  return {
    config: publicConfig,
    secretConfig: encryptGatewaySecrets(secretConfig),
    secrets: secretConfig,
  };
}
