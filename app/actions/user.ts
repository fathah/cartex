"use server";

import { cookies } from "next/headers";
import { AppKeys } from "@/constants/keys";
import CartexUserTokenService from "@/services/token_service";
import CustomerDB from "@/db/customer";
import prisma from "@/db/prisma";

export async function getCurrentUser() {
  try {
    const store = await cookies();
    const token = store.get(AppKeys.USER_AUTH_TOKEN);

    if (!token || !token.value) {
      return null;
    }

    const payload = await CartexUserTokenService.verifyJWT(token.value);

    if (!payload || !payload.userId) {
      return null;
    }

    const customer = await CustomerDB.findById(payload.userId);

    if (!customer) {
      return null;
    }

    // Return only necessary user data (don't send sensitive info like passwordHash)
    return {
      id: customer.id,
      email: customer.email,
      fullname: customer.fullname,
      phone: customer.phone,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function updateProfile(data: {
  fullname: string;
  phone?: string;
}) {
  try {
    const store = await cookies();
    const token = store.get(AppKeys.USER_AUTH_TOKEN);

    if (!token || !token.value) {
      return { success: false, error: "Not authenticated" };
    }

    const payload = await CartexUserTokenService.verifyJWT(token.value);

    if (!payload || !payload.userId) {
      return { success: false, error: "Invalid token" };
    }

    // Validate input
    if (!data.fullname || data.fullname.trim().length < 2) {
      return {
        success: false,
        error: "Full name is required and must be at least 2 characters",
      };
    }

    // Update user profile
    const updatedCustomer = await prisma.customer.update({
      where: { id: payload.userId },
      data: {
        fullname: data.fullname.trim(),
        phone: data.phone?.trim() || null,
      },
    });

    return {
      success: true,
      customer: {
        id: updatedCustomer.id,
        email: updatedCustomer.email,
        fullname: updatedCustomer.fullname,
        phone: updatedCustomer.phone,
      },
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
