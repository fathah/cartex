import { getSettings } from "../../actions/settings";
import LoginClient from "./LoginClient";
import { Suspense } from "react";

const LoginIndexPage = async () => {
  const settings = await getSettings();
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginClient logo={settings.logoUrl!} />
      </Suspense>
    </div>
  );
};

export default LoginIndexPage;
