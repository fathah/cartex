"use client";

import React from "react";
import { Card, Table, Tag, Button } from "antd";
import { Eye } from "lucide-react";
import Link from "next/link";
import AdminMoney from "@/components/common/AdminMoney";
import { formatDate } from "@/utils/date";

interface RecentOrdersTableProps {
  orders: any[];
}

export const RecentOrdersTable = ({ orders }: RecentOrdersTableProps) => {
  const columns = [
    {
      title: "Order",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (num: number, record: any) => (
        <span className="font-medium text-blue-600">
          #{num || record.id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (customer: any) => (
        <div>
          <div className="text-sm font-medium">
            {customer?.fullname || "Guest"}
          </div>
          <div className="text-xs text-gray-400">{customer?.email}</div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number, record: any) => (
        <AdminMoney
          value={price}
          currencyCode={record.currency}
          className="font-semibold"
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "FULFILLED") color = "success";
        if (status === "PROCESSING") color = "processing";
        if (status === "CANCELLED") color = "error";
        if (status === "ORDERED") color = "cyan";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Time",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <span className="text-gray-400 text-xs">
          {formatDate(new Date(date))}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      render: (_: any, record: any) => (
        <Link href={`/admin/orders?search=${record.orderNumber || record.id}`}>
          <Button type="text" icon={<Eye size={16} />} size="small" />
        </Link>
      ),
    },
  ];

  return (
    <Card title="Recent Orders" bordered={false} className="shadow-sm mb-6">
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        pagination={false}
        size="middle"
      />
      <div className="mt-4 text-center">
        <Link href="/admin/orders">
          <Button variant="outlined">View All Orders</Button>
        </Link>
      </div>
    </Card>
  );
};
