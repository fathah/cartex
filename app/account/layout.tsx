import React from "react";
import StoreHeader from "@/components/store/header";
import SideBarMenu from "./comps/SideBarMenu";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/user";
import { UserProvider } from "./comps/UserContext";

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

        <div className="container mx-auto px-4 mt-10">{children}</div>
      </div>
      <div className=" bg-gray-50 h-20"></div>
    </UserProvider>
  );
};

export default AccountPageLayout;
