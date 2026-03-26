"use client";

import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  theme,
  Avatar,
  Dropdown,
  Space,
  Drawer,
  Button,
} from "antd";
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  Settings,
  Package,
  Images,
  PanelsTopLeft,
  Component,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Menu as MenuIcon } from "lucide-react";
import { logoutAdmin } from "@/app/auth/actions";

const { Header, Content, Sider } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const items = [
    { key: "/admin", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    {
      key: "/admin/products",
      icon: <ShoppingBag size={20} />,
      label: "Products",
    },
    {
      key: "/admin/categories",
      icon: <Package size={20} />,
      label: "Categories",
    },
    { key: "/admin/orders", icon: <ShoppingCart size={20} />, label: "Orders" },
    { key: "/admin/customers", icon: <Users size={20} />, label: "Customers" },
    { key: "/admin/media", icon: <Images size={20} />, label: "Media" },
    { key: "/admin/pages", icon: <PanelsTopLeft size={20} />, label: "Pages" },
    { key: "/admin/brands", icon: <Component size={20} />, label: "Brands" },

    { key: "/admin/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <Layout style={{ height: "100vh", minWidth: 200, overflow: "hidden" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          className="hidden lg:block"
          style={{
            height: "100vh",
            position: "sticky",
            top: 0,
            left: 0,
            overflow: "hidden",
          }}
        >
          <div className="flex h-full flex-col">
            <div className="shrink-0 text-white text-center text-xl font-bold p-4">
              {collapsed ? (
                <div className="flex items-center justify-center bg-white text-black rounded-xl w-10 h-10">
                  C
                </div>
              ) : (
                "Cartex Panel"
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
              <Menu
                theme="dark"
                selectedKeys={[pathname]}
                mode="inline"
                items={items}
                onClick={({ key }) => router.push(key)}
              />
            </div>
          </div>
        </Sider>
      )}

      {/* Mobile Drawer Sidebar */}
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{ body: { padding: 0 }, wrapper: { width: 250 } }}
        className="lg:hidden"
      >
        <div className="h-full bg-[#001529]">
          <div className="text-white text-center text-xl font-bold p-4">
            Cartex Panel
          </div>
          <Menu
            theme="dark"
            selectedKeys={[pathname]}
            mode="inline"
            items={items}
            onClick={({ key }) => {
              router.push(key);
              setMobileMenuOpen(false);
            }}
          />
        </div>
      </Drawer>

      <Layout
        style={{
          minWidth: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div className="flex items-center gap-4">
            {isMobile && (
              <Button
                type="text"
                icon={<MenuIcon size={20} />}
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-0"
              />
            )}
            <h1 className="text-xl font-bold m-0">Admin Panel</h1>
          </div>
          <Dropdown
            menu={{
              items: [
                {
                  key: "logout",
                  label: "Logout",
                  onClick: async () => {
                    await logoutAdmin();
                    router.push("/auth");
                  },
                },
              ],
            }}
          >
            <Space>
              <Avatar
                style={{ backgroundColor: "#87d068" }}
                icon={<Users size={16} />}
              />
              <span className="font-medium cursor-pointer">Admin</span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: "16px",
            overflowY: "auto",
            minHeight: 0,
            height: "100%",
          }}
        >
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
