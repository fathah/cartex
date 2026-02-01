"use client";

import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin } from 'antd';
import { FolderOpen, ShoppingCart, DollarSign, Users } from 'lucide-react';
import { getDashboardStats, type DashboardStats } from '@/app/actions/dashboard';

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
    <div>
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <Row gutter={16}>
            <Col span={6}>
            <Card bordered={false}>
                <Statistic
                title="Total Sales"
                value={stats?.totalSales || 0}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                prefix={<DollarSign size={18} />}
                />
            </Card>
            </Col>
            <Col span={6}>
            <Card bordered={false}>
                <Statistic
                title="Orders"
                value={stats?.totalOrders || 0}
                prefix={<ShoppingCart size={18} />}
                />
            </Card>
            </Col>
            <Col span={6}>
            <Card bordered={false}>
                <Statistic
                title="Products"
                value={stats?.totalProducts || 0}
                prefix={<FolderOpen size={18} />}
                />
            </Card>
            </Col>
            <Col span={6}>
            <Card bordered={false}>
                <Statistic
                title="Active Users"
                value={stats?.activeUsers || 0}
                prefix={<Users size={18} />}
                />
            </Card>
            </Col>
        </Row>
    </div>
  );
}
