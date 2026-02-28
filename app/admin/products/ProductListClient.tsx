"use client";

import React, { useState } from "react";
import { Table, Button, Tag, Space, Modal, message, Switch } from "antd";
import { Plus, Edit, Trash2, LinkIcon, Import } from "lucide-react";
import { useRouter } from "next/navigation";
import { Product } from "@prisma/client";
import { updateProduct } from "@/actions/product";
import Link from "next/link";
import ImportProducts from "./ImportProducts";
import { AppConstants } from "@/constants/constants";

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
  const [isImportOpen, setIsImportOpen] = useState(false);

  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      setLoadingIds((prev) => new Set(prev).add(id));
      await updateProduct(id, { isFeatured });
      message.success(
        `Product is now ${isFeatured ? "featured" : "unfeatured"}`,
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      message.error("Failed to update featured status");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Link",
      dataIndex: "slug",
      key: "slug",
      render: (slug: string) => (
        <div
          className="inline-flex items-center gap-2 text-xs text-blue-600 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-md cursor-pointer"
          onClick={() => {
            const link = `${AppConstants.PUBLIC_URL}/product/${slug}`;
            navigator.clipboard.writeText(link);
            message.success("Link copied to clipboard");
          }}
        >
          <LinkIcon size={16} /> Copy Link
        </div>
      ),
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
      title: "Featured?",
      dataIndex: "isFeatured",
      key: "isFeatured",
      render: (isFeatured: boolean, record: any) => (
        <Switch
          checked={isFeatured}
          loading={loadingIds.has(record.id)}
          onChange={(checked) => handleToggleFeatured(record.id, checked)}
        />
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
        <div className="flex gap-2">
          <Link href="/admin/products/new">
            <Button type="primary" icon={<Plus size={16} />}>
              Add Product
            </Button>
          </Link>
          <Button
            type="default"
            icon={<Import size={16} />}
            onClick={() => setIsImportOpen(true)}
          >
            Import Product
          </Button>
        </div>
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

      <ImportProducts
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => {
          router.refresh(); // Refresh page data strictly inside NextJS cache
        }}
      />
    </div>
  );
}
