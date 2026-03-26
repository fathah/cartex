"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { cookies } from "next/headers";
import prisma from "@/db/prisma";
import CustomerDB from "@/db/customer";
import { sendMail } from "@/services/mail";
import CartexUserTokenService from "@/services/token_service";
import { AppKeys } from "@/constants/keys";
import { otpMailTemplate } from "./email";
import {
  generateOtpCode,
  hashOtp,
  normalizeEmail,
  verifyOtpHash,
} from "@/services/security";
import { consumeRateLimit, RateLimitError } from "@/services/rate-limit";
import { setAuthToken } from "@/utils/auth";

const emailSchema = z.object({
  email: z.string().email(),
});

const loginSchema = emailSchema.extend({
  password: z.string().min(1),
});

const otpSchema = emailSchema.extend({
  otp: z.string().length(6),
});

const registerSchema = otpSchema.extend({
  password: z.string().min(8),
});

function getRateLimitMessage(error: unknown) {
  if (error instanceof RateLimitError) {
    return `Too many attempts. Try again in ${error.retryAfterSeconds} seconds.`;
  }

  return null;
}

export async function checkEmail(email: string) {
  const parsed = emailSchema.safeParse({ email });
  if (!parsed.success) {
    return { exists: false };
  }

  const customer = await CustomerDB.findByEmail(parsed.data.email);
  return { exists: !!(customer && customer.passwordHash) };
}

export async function login(email: string, password: string) {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { success: false, error: "Invalid credentials" };
  }

  const normalizedEmail = normalizeEmail(parsed.data.email);

  try {
    await consumeRateLimit({
      action: "customer_login",
      blockMs: 15 * 60 * 1000,
      identifier: normalizedEmail,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
  } catch (error) {
    return {
      success: false,
      error: getRateLimitMessage(error) || "Login temporarily unavailable",
    };
  }

  const customer = await CustomerDB.findByEmail(normalizedEmail);
  if (!customer || !customer.passwordHash) {
    return { success: false, error: "Invalid credentials" };
  }

  const isValid = await bcrypt.compare(parsed.data.password, customer.passwordHash);
  if (!isValid) {
    return { success: false, error: "Invalid credentials" };
  }

  const token = await CartexUserTokenService.generateJWT(customer.id);
  await setAuthToken(token);

  return { success: true, customerId: customer.id };
}

export async function sendOtp(email: string) {
  const parsed = emailSchema.safeParse({ email });
  if (!parsed.success) {
    return { success: false, error: "Please enter a valid email" };
  }

  const normalizedEmail = normalizeEmail(parsed.data.email);

  try {
    await consumeRateLimit({
      action: "customer_send_otp",
      blockMs: 15 * 60 * 1000,
      identifier: normalizedEmail,
      limit: 3,
      windowMs: 15 * 60 * 1000,
    });
  } catch (error) {
    return {
      success: false,
      error: getRateLimitMessage(error) || "OTP temporarily unavailable",
    };
  }

  try {
    const existing = await CustomerDB.findByEmail(normalizedEmail);

    if (existing?.passwordHash) {
      return { success: false, error: "Account already exists" };
    }

    if (
      existing?.otpLastSentAt &&
      Date.now() - existing.otpLastSentAt.getTime() < 60 * 1000
    ) {
      return {
        success: false,
        error: "Please wait before requesting another code",
      };
    }

    const otp = generateOtpCode();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (existing) {
      await prisma.customer.update({
        where: { id: existing.id },
        data: {
          email: normalizedEmail,
          normalizedEmail,
          otp: null,
          otpExpiresAt,
          otpHash: hashOtp(normalizedEmail, otp),
          otpLastSentAt: new Date(),
          otpVerifyAttempts: 0,
        },
      });
    } else {
      await prisma.customer.create({
        data: {
          email: normalizedEmail,
          normalizedEmail,
          otpExpiresAt,
          otpHash: hashOtp(normalizedEmail, otp),
          otpLastSentAt: new Date(),
        },
      });
    }

    const mailTemplate = await otpMailTemplate(otp);
    await sendMail(
      normalizedEmail,
      "Your Verification Code",
      `Your OTP is: ${otp}`,
      mailTemplate,
    );

    return { success: true };
  } catch (error) {
    console.error("OTP Error:", error);
    return { success: false, error: "Failed to send OTP" };
  }
}

export async function verifyOtp(email: string, otp: string) {
  const parsed = otpSchema.safeParse({ email, otp });
  if (!parsed.success) {
    return { success: false, error: "Invalid OTP" };
  }

  const normalizedEmail = normalizeEmail(parsed.data.email);

  try {
    await consumeRateLimit({
      action: "customer_verify_otp",
      blockMs: 15 * 60 * 1000,
      identifier: normalizedEmail,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
  } catch (error) {
    return {
      success: false,
      error: getRateLimitMessage(error) || "OTP verification unavailable",
    };
  }

  const customer = await CustomerDB.findByEmail(normalizedEmail);
  if (!customer || !customer.otpHash || !customer.otpExpiresAt) {
    return { success: false, error: "Invalid OTP" };
  }

  if (customer.otpExpiresAt.getTime() < Date.now()) {
    return { success: false, error: "OTP Expired" };
  }

  if (customer.otpVerifyAttempts >= 5) {
    return { success: false, error: "Too many invalid attempts" };
  }

  const isValid = verifyOtpHash(normalizedEmail, parsed.data.otp, customer.otpHash);
  if (!isValid) {
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        otpVerifyAttempts: {
          increment: 1,
        },
      },
    });
    return { success: false, error: "Invalid OTP" };
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      otpVerifyAttempts: 0,
    },
  });

  return { success: true, customerId: customer.id };
}

export async function register(email: string, password: string, otp: string) {
  const parsed = registerSchema.safeParse({ email, password, otp });
  if (!parsed.success) {
    return { success: false, error: "Invalid registration details" };
  }

  const normalizedEmail = normalizeEmail(parsed.data.email);
  const check = await verifyOtp(normalizedEmail, parsed.data.otp);
  if (!check.success) {
    return check;
  }

  const customer = await CustomerDB.findByEmail(normalizedEmail);
  if (!customer) {
    return { success: false, error: "Customer not found" };
  }

  if (customer.passwordHash) {
    return { success: false, error: "Account already exists" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      email: normalizedEmail,
      normalizedEmail,
      otp: null,
      otpExpiresAt: null,
      otpHash: null,
      otpLastSentAt: null,
      otpVerifyAttempts: 0,
      passwordHash,
    },
  });

  const token = await CartexUserTokenService.generateJWT(customer.id);
  await setAuthToken(token);

  return { success: true, customerId: customer.id };
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AppKeys.USER_AUTH_TOKEN);
    return { success: true };
  } catch (error) {
    console.error("Logout Error:", error);
    return { success: false, error: "Failed to logout" };
  }
}
