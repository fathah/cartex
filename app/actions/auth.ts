'use server';

import CustomerDB from '@/db/customer';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import prisma from '@/db/prisma';

import { sendMail } from '@/services/mail';
import { Prisma } from '@prisma/client';

export async function checkEmail(email: string) {
  const customer = await CustomerDB.findByEmail(email);
  // Exists only if customer exists AND has a password set (verified)
  return { exists: !!(customer && customer.passwordHash), customer };
}

export async function login(email: string, password: string) {
  const customer = await CustomerDB.findByEmail(email);
  
  if (!customer || !customer.passwordHash) {
    return { success: false, error: 'Invalid credentials' };
  }

  const isValid = await bcrypt.compare(password, customer.passwordHash);

  if (!isValid) {
    return { success: false, error: 'Invalid credentials' };
  }

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set('customer_session', customer.id, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });

  return { success: true, customerId: customer.id };
}

export async function sendOtp(email: string) {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Check if customer exists
        const existing = await CustomerDB.findByEmail(email);

        if (existing) {
             // If already verified (has password), we shouldn't be here normally if UI checks checkEmail first.
             // But valid use case: Forgot Password flow (not implemented yet) or just re-verifying unverified email.
             await prisma.customer.update({
                 where: { id: existing.id },
                 data: { otp, otpExpiresAt }
             });
        } else {
             // Create new unverified customer
             await prisma.customer.create({
                 data: {
                     email,
                     otp,
                     otpExpiresAt,
                     // passwordHash is null, so "exists" will return false in checkEmail
                 }
             });
        }

        // Send Email
        await sendMail(email, "Your Verification Code", `Your OTP is: ${otp}`);
        
        return { success: true };
    } catch (error) {
        console.error("OTP Error:", error);
        return { success: false, error: "Failed to send OTP" };
    }
}

export async function verifyOtp(email: string, otp: string) {
    const customer = await CustomerDB.findByEmail(email);
    if (!customer || !customer.otp || !customer.otpExpiresAt) {
        return { success: false, error: "Invalid OTP" };
    }

    if (new Date() > customer.otpExpiresAt) {
        return { success: false, error: "OTP Expired" };
    }

    if (customer.otp !== otp) {
        return { success: false, error: "Invalid OTP" };
    }

    return { success: true };
}


export async function register(email: string, password: string, otp: string) {
  // Re-verify OTP to be secure
  const check = await verifyOtp(email, otp);
  if (!check.success) {
      return check;
  }

  const customer = await CustomerDB.findByEmail(email);
  if (!customer) return { success: false, error: "Customer not found" };

  const passwordHash = await bcrypt.hash(password, 10);

  // Update customer: set password, clear OTP
  await prisma.customer.update({
      where: { id: customer.id },
      data: {
          passwordHash,
          otp: null,
          otpExpiresAt: null
      }
  });

  // Auto login
  const cookieStore = await cookies();
  cookieStore.set('customer_session', customer.id, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7
  });

  return { success: true, customerId: customer.id };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('customer_session');
}
