import AdminLayout from "@/components/layout/AdminLayout";
import { validateAdminAuthToken } from "@/services/zauth";
import Link from "next/link";

const AdminRoot = async({ children }: { children: React.ReactNode }) => {
  const isAuthValid = await validateAdminAuthToken();

  if (!isAuthValid) {
    return <section className="h-screen fullcenter flex-col gap-3">
      <h3>Unauthorized Access</h3>

      <Link href={'/auth'} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Login</Link>
    </section>
  }

  return (
    <AdminLayout>
        {children}
    </AdminLayout>
  );
}

export default AdminRoot;