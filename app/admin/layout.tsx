import AdminLayout from "@/components/layout/AdminLayout";
import { validateAdminAuthToken } from "@/services/zauth";
import UnauthorizedPage from "@/components/admin/UnauthorizedPage";

const AdminRoot = async ({ children }: { children: React.ReactNode }) => {
  const isAuthValid = await validateAdminAuthToken();

  if (!isAuthValid) {
    return <UnauthorizedPage />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminRoot;
