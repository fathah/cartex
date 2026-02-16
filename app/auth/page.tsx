"use client";

import { useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ZAuthClient } from "@ziqx/auth";
import { validateAdminAuthToken } from "@/services/zauth";
import { LoadingOutlined } from "@ant-design/icons";

const AuthContent = () => {
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
                    setTimeout(() => {
                        window.location.href = "/admin";
                    }, 1000);
                } else {
                    login();
                }
            })
        } else {
            login();
        }
    }, [params, login]);


    return (
        <div className="h-screen fullcenter gap-8">
            <LoadingOutlined spin className="text-2xl"/>
            Authenticating..
        </div>
    );
}

const AdminAuth = () => {
    return (
        <Suspense fallback={<div className="h-screen fullcenter">Loading...</div>}>
            <AuthContent />
        </Suspense>
    );
}

export default AdminAuth;
