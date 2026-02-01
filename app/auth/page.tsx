"use client";

import { useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { AppKeys } from "@/constants/keys";
import { ZAuthClient } from "@ziqx/auth";
import { validateAdminAuthToken } from "@/services/zauth";
import { Loading3QuartersOutlined, LoadingOutlined } from "@ant-design/icons";


const AdminAuth = () => {
    const params = useSearchParams();


    const login = useCallback(() => {
         const auth = new ZAuthClient({
                authKey: process.env.NEXT_PUBLIC_ZAUTH_KEY!
         });
        auth.login(process.env.NODE_ENV === "development")
    },[])

    useEffect(() => {
        const token = params.get("code");
        if (token) {
            validateAdminAuthToken(token).then((valid) => {
                if (valid) {
                    Cookies.set(AppKeys.ADMIN_AUTH_TOKEN, token);
                    setTimeout(() => {
                        window.location.href = "/admin";
                    }, 1000);
                } else {
                    Cookies.remove(AppKeys.ADMIN_AUTH_TOKEN);
                    login();
                }
            })
        } else {
            login();
            
        }
    }, [params]);


    return (
        <div className="h-screen fullcenter gap-8">
            <LoadingOutlined spin className="text-2xl"/>
            Authenticating..
        </div>
    );
}

export default AdminAuth;