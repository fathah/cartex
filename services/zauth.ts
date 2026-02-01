"use server";

import { AppKeys } from "@/constants/keys";
import { ZAuthTokenService } from "@ziqx/auth";
import { cookies } from "next/headers";



export async function validateAdminAuthToken(code?:string) {

  let token = code;
  if(!code){
    const store = await cookies();
    token = store.get(AppKeys.ADMIN_AUTH_TOKEN)?.value;
  }

  if(!token){
    return false;
  }

    const tokenService = new ZAuthTokenService();

const isValid = await tokenService.validate(token);

if (isValid) {
  return true;
} else {
  return false;
}
}

