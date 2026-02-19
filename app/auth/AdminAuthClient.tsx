"use client";

import { useCallback, useEffect, Suspense } from "react";
import { ZAuthClient } from "@ziqx/auth";
import { validateAdminAuthToken } from "@/services/zauth";
import { LoadingOutlined } from "@ant-design/icons";
import { AppKeys } from "@/constants/keys";
import Cookies from "js-cookie";
import { handleAdminLogin } from "./actions";
import { useState } from "react";
import { Button } from "antd";

const AdminAuthClient = ({ accessToken }: { accessToken: string | null }) => {
  const [isAuthValid, setIsAuthValid] = useState(true);
  const login = useCallback(() => {
    const auth = new ZAuthClient({
      authKey: process.env.NEXT_PUBLIC_ZAUTH_KEY!,
    });
    auth.login({
      codeChallenge: "cartex",
      redirectUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/auth"
          : process.env.NEXT_PUBLIC_ZAUTH_URL!,
    });
  }, []);

  useEffect(() => {
    if (accessToken) {
      handleAdminLogin(accessToken).then((valid) => {
        if (valid) {
          Cookies.set(AppKeys.ADMIN_AUTH_TOKEN, accessToken);
          setTimeout(() => {
            window.location.href = "/admin";
          }, 1000);
        } else {
          setIsAuthValid(false);
        }
      });
    } else {
      login();
    }
  }, [accessToken, login]);

  return (
    <div className="h-screen fullcenter gap-8">
      {!isAuthValid ? (
        <>
          <h2 className="text-red-500">Invalid Authentication</h2>
          <Button onClick={login}>Login Again</Button>
        </>
      ) : (
        <>
          <LoadingOutlined spin className="text-2xl" />
          Authenticating..
        </>
      )}
    </div>
  );
};

export default AdminAuthClient;
