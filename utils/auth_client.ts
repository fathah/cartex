import { AppKeys } from "@/constants/keys";
import Cookies from "js-cookie";

export async function setAuthTokenClient(token: string){
    Cookies.set(AppKeys.USER_AUTH_TOKEN, token, { expires: 10 });
}