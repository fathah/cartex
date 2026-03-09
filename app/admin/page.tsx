"use client";
import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Spin, Button, Space, Tag } from "antd";
import {
  FolderOpen,
  ShoppingCart,
  DollarSign,
  Users,
  Plus,
  Package,
  Settings as SettingsIcon,
} from "lucide-react";
import { getDashboardStats, type DashboardStats } from "@/actions/dashboard";
import Currency from "@/components/common/Currency";
import { DashboardCharts } from "./components/DashboardCharts";
import { RecentOrdersTable } from "./components/RecentOrdersTable";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <Space>
          <Link href="/admin/orders">
            <Button icon={<ShoppingCart size={16} />}>Manage Orders</Button>
          </Link>
          <Link href="/admin/products/new">
            <Button type="primary" icon={<Plus size={16} />}>
              Add Product
            </Button>
          </Link>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="shadow-sm hover:translate-y-[-2px] transition-transform"
          >
            <Statistic
              title={
                <span className="text-gray-400 font-medium">Total Revenue</span>
              }
              value={stats?.totalSales || 0}
              precision={2}
              valueStyle={{ color: "#1677ff", fontWeight: "bold" }}
              prefix={<DollarSign size={20} className="mr-1" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="shadow-sm hover:translate-y-[-2px] transition-transform"
          >
            <Statistic
              title={
                <span className="text-gray-400 font-medium">Total Orders</span>
              }
              value={stats?.totalOrders || 0}
              valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
              prefix={<ShoppingCart size={20} className="mr-1" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="shadow-sm hover:translate-y-[-2px] transition-transform"
          >
            <Statistic
              title={
                <span className="text-gray-400 font-medium">Live Products</span>
              }
              value={stats?.totalProducts || 0}
              valueStyle={{ color: "#faad14", fontWeight: "bold" }}
              prefix={<Package size={20} className="mr-1" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="shadow-sm hover:translate-y-[-2px] transition-transform"
          >
            <Statistic
              title={
                <span className="text-gray-400 font-medium">
                  Active Customers
                </span>
              }
              value={stats?.activeUsers || 0}
              valueStyle={{ color: "#722ed1", fontWeight: "bold" }}
              prefix={<Users size={20} className="mr-1" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <DashboardCharts dailySales={stats?.dailySales || []} />

      {/* Recent Orders Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentOrdersTable orders={stats?.recentOrders || []} />
        </div>

        {/* Quick Actions / Shortcuts */}
        <div className="space-y-6">
          <Card title="Quick Actions" bordered={false} className="shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <ShortcutCard
                icon={<Package size={20} className="text-blue-500" />}
                label="Inventory"
                href="/admin/products"
              />
              <ShortcutCard
                icon={<Users size={20} className="text-purple-500" />}
                label="Customers"
                href="/admin/customers"
              />
              <ShortcutCard
                icon={<SettingsIcon size={20} className="text-orange-500" />}
                label="Store Settings"
                href="/admin/settings"
              />
              <ShortcutCard
                icon={<FolderOpen size={20} className="text-green-500" />}
                label="Collections"
                href="/admin/categories"
              />
            </div>
          </Card>

          <Card title="Store Status" bordered={false} className="shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Store Status</span>
                <Tag color="success">Online</Tag>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Payment Gateway</span>
                <Tag color="processing">Active</Tag>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Active Theme</span>
                <span className="font-medium text-gray-700">Perfume Pro</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const ShortcutCard = ({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) => {
  return (
    <Link href={href}>
      <div className="w-full h-20 flex flex-col items-center justify-center gap-2 border-gray-100 hover:border-purple-200 border rounded-lg">
        {icon}
        <span className="text-xs text-black">{label}</span>
      </div>
    </Link>
  );
};
