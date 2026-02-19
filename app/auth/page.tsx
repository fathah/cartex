import { getZiqxAccessToken } from "@/services/zauth";
import AdminAuthClient from "./AdminAuthClient";

type AdminAuthProps = {
  searchParams: Promise<{ code?: string }>;
};

const AdminAuthIndex = async ({ searchParams }: AdminAuthProps) => {
  const { code } = await searchParams;
  console.log("code", code);

  const accessToken = await getZiqxAccessToken(code);
  return (
    <div>
      <AdminAuthClient accessToken={accessToken} />
    </div>
  );
};

export default AdminAuthIndex;
