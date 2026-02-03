import React from "react";
import StoreHeader from "@/components/store/header";
import SideBarMenu from "./SideBarMenu";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/user";
import { UserProvider } from "./UserContext";

export const dynamic = "force-dynamic";

const AccountPageLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Fetch user data once in the layout
  const user = await getCurrentUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  return (
    <UserProvider user={user}>
      <div className="min-h-screen bg-gray-50">
        <StoreHeader />

        <div className="container mx-auto px-4 mt-10">
          <div className="flex flex-col lg:flex-row gap-6">
            <SideBarMenu />

            <main className="w-full lg:w-3/4">{children}</main>
          </div>
        </div>
      </div>
    </UserProvider>
  );
};

export default AccountPageLayout;
