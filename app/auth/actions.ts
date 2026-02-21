"use server";

import UserDB from "@/db/user";
import { validateAdminAuthToken } from "@/services/zauth";
import { decodeJwt } from "jose";

export async function handleAdminLogin(accessToken: string) {
  const isValid = await validateAdminAuthToken(accessToken);
  if (!isValid) {
    return null;
  }

  const decoded: any = decodeJwt(accessToken);
  const ziqxId = decoded?.sub;
  if (!ziqxId) {
    return null;
  }

  const fullName = decoded?.fullName;
  const email = decoded?.email?.toLowerCase();

  const count = await UserDB.count();
  if (count === 0) {
    await UserDB.create({
      ziqxId,
      role: "SUPER_ADMIN",
      email: email,
      firstName: fullName,
    });
    return true;
  }

  const user = await UserDB.findByEmail(email);
  if (!user) {
    return null;
  }
  await UserDB.update(user.id, {
    email: email,
    ziqxId: ziqxId,
    firstName: fullName,
  });

  return true;
}
