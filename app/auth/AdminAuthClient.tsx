"use client";

import { useCallback, useEffect } from "react";
import { ZAuthClient } from "@ziqx/auth";
import { LoadingOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { AppConstants } from "@/constants/constants";
import { PUBLIC_ENV } from "@/constants/env_public";
import { useSearchParams } from "next/navigation";

const AdminAuthClient = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const login = useCallback(() => {
    const auth = new ZAuthClient({
      authKey: PUBLIC_ENV.ZAUTH_KEY!,
    });
    auth.login({
      codeChallenge: "cartex",
      redirectUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/auth/callback"
          : `${AppConstants.PUBLIC_URL}/auth/callback`,
    });
  }, []);

  useEffect(() => {
    if (!error) {
      login();
    }
  }, [error, login]);

  return (
    <div className="h-screen fullcenter gap-8">
      {error ? (
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
