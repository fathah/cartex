import React from "react";
import SideBarMenu from "../comps/SideBarMenu";

export default function WithSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <SideBarMenu />
      <main className="w-full lg:w-3/4">{children}</main>
    </div>
  );
}
