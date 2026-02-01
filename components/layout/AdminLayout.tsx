"use client";

import React, { useState } from 'react';
import { Layout, Menu, theme, Avatar, Dropdown, Space } from 'antd';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  Settings, 
  Package
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const { Header, Content, Footer, Sider } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    { key: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { key: '/admin/products', icon: <ShoppingBag size={20} />, label: 'Products' },
    { key: '/admin/categories', icon: <Package size={20} />, label: 'Categories' },
    { key: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
    { key: '/admin/customers', icon: <Users size={20} />, label: 'Customers' },
    { key: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
        <Menu 
            theme="dark" 
            defaultSelectedKeys={[pathname]} 
            selectedKeys={[pathname]}
            mode="inline" 
            items={items} 
            onClick={({ key }) => router.push(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <Dropdown menu={{ items: [{ key: 'logout', label: 'Logout' }] }}>
                <Space>
                    <Avatar style={{ backgroundColor: '#87d068' }} icon={<Users size={16} />} />
                    <span className="font-medium cursor-pointer">Admin</span>
                </Space>
            </Dropdown>
        </Header>
        <Content style={{ margin: '16px' }}>
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
        <Footer style={{ textAlign: 'center' }}>
          Cartex Pro ©{new Date().getFullYear()} Created by Ziqx
        </Footer>
      </Layout>
    </Layout>
  );
}
