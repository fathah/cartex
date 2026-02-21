"use server";

import prisma from "@/db/prisma";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function subscribeToNewsletter(
  prevState: any,
  formData: FormData,
) {
  try {
    const email = formData.get("email") as string;

    // Validate email
    const validatedData = subscribeSchema.safeParse({ email });
    if (!validatedData.success) {
      return {
        error: validatedData.error.issues[0].message,
        success: false,
      };
    }

    // Check if user already exists
    const existingSubscriber = await prisma.newsLetterSubscriber.findUnique({
      where: { email: validatedData.data.email },
    });

    if (existingSubscriber) {
      return {
        error: "This email is already subscribed to our newsletter.",
        success: false,
      };
    }

    // Process subscription
    await prisma.newsLetterSubscriber.create({
      data: {
        email: validatedData.data.email,
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
