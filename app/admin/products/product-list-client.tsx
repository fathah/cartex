"use client";

import React from "react";
import { Table, Button, Tag, Space, Modal, message } from "antd";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Product } from "@prisma/client"; // Import type
import Link from "next/link";

interface ProductListClientProps {
  initialProducts: any[]; // Prism types are tricky to import exactly sometimes if referencing relation types
  total: number;
  currentPage: number;
}

export default function ProductListClient({
  initialProducts,
  total,
  currentPage,
}: ProductListClientProps) {
  const router = useRouter();

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "ACTIVE"
              ? "green"
              : status === "ARCHIVED"
                ? "red"
                : "gold"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: Date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Link href={`/admin/products/${record.id}`}>
            <Button icon={<Edit size={16} />} size="small" />
          </Link>
          {/* Delete implementation later */}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link href="/admin/products/new">
          <Button type="primary" icon={<Plus size={16} />}>
            Add Product
          </Button>
        </Link>
      </div>

      <Table
        dataSource={initialProducts}
        columns={columns}
        rowKey="id"
        pagination={{
          current: currentPage,
          total: total,
          pageSize: 20,
          onChange: (page) => router.push(`/admin/products?page=${page}`),
        }}
        scroll={{ x: 800 }}
      />
    </div>
  );
}
