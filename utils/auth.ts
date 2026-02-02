"use server";

import { AppKeys } from "@/constants/keys";
import CartexUserTokenService from "@/services/token_service";
import { cookies } from "next/headers";


export async function checkUserAuth(){
    const store = await cookies();
    const token = store.get(AppKeys.USER_AUTH_TOKEN);
    if(!token || !token.value){
        return false;
    }
    const validate = await CartexUserTokenService.verifyJWT(token.value);
    if(!validate){
        return false;
    }
    return true;
}

export async function setAuthToken(token: string){
    const store = await cookies();
    store.set(AppKeys.USER_AUTH_TOKEN, token);
}