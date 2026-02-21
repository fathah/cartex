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

  const fullname = decoded?.fullName;
  const email = decoded?.email?.toLowerCase();

  const count = await UserDB.count();
  if (count === 0) {
    await UserDB.create({
      ziqxId,
      role: "SUPER_ADMIN",
      email,
      fullname,
    });
    return true;
  }

  const user = await UserDB.findByEmail(email);
  if (!user) {
    return null;
  }
  await UserDB.update(user.id, {
    email,
    ziqxId,
    fullname,
  });

  return true;
}
