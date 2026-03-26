"use server";

import prisma from "@/db/prisma";
import {
  consumeRateLimit,
  RateLimitError,
  getRequestIp,
} from "@/services/rate-limit";
import { normalizeEmail } from "@/services/security";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export async function subscribeToNewsletter(
  prevState: any,
  formData: FormData,
) {
  try {
    const email = formData.get("email");

    const validatedData = subscribeSchema.safeParse({ email });
    if (!validatedData.success) {
      return {
        error: validatedData.error.issues[0].message,
        success: false,
      };
    }

    const normalizedEmail = normalizeEmail(validatedData.data.email);
    const identifier = await getRequestIp();

    try {
      await consumeRateLimit({
        action: "newsletter_subscribe",
        blockMs: 30 * 60 * 1000,
        identifier,
        limit: 5,
        windowMs: 10 * 60 * 1000,
      });
    } catch (error) {
      if (error instanceof RateLimitError) {
        return {
          error: `Too many attempts. Try again in ${error.retryAfterSeconds} seconds.`,
          success: false,
        };
      }

      throw error;
    }

    const existingSubscriber = await prisma.newsLetterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingSubscriber) {
      return {
        message: "Successfully subscribed to the newsletter!",
        success: true,
      };
    }

    await prisma.newsLetterSubscriber.create({
      data: {
        email: normalizedEmail,
      },
    });

    return {
      message: "Successfully subscribed to the newsletter!",
      success: true,
    };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
      success: false,
    };
  }
}
