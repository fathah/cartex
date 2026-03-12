"use client";

import React, { useState } from "react";
import { Table, Button, Tag, Space, Modal, message, Switch, Spin } from "antd";
import { Plus, Edit, LinkIcon, Import } from "lucide-react";
import { useRouter } from "next/navigation";
import { Product } from "@prisma/client";
import { getProduct, updateProduct } from "@/actions/product";
import ImportProducts from "./ImportProducts";
import { AppConstants } from "@/constants/constants";
import ProductForm from "./ProductForm";

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formLoading, setFormLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [formKey, setFormKey] = useState(0);

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

  const openCreateModal = () => {
    setFormMode("create");
    setEditingProduct(null);
    setFormKey((prev) => prev + 1);
    setIsFormOpen(true);
  };

  const openEditModal = async (id: string) => {
    setFormMode("edit");
    setIsFormOpen(true);
    setFormLoading(true);
    try {
      const product = await getProduct(id);
      setEditingProduct(product);
      setFormKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      message.error("Failed to load product");
      setIsFormOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const refreshEditingProduct = async (productId?: string) => {
    const id = productId || editingProduct?.id;
    if (!id) return;
    try {
      const product = await getProduct(id);
      setEditingProduct(product);
    } catch (error) {
      console.error(error);
      message.error("Failed to refresh product");
    }
  };

  const handleFormSuccess = async (
    productId: string,
    mode: "create" | "update",
  ) => {
    if (mode === "create") {
      router.refresh();
      await openEditModal(productId);
      return;
    }
    router.refresh();
    setIsFormOpen(false);
    setEditingProduct(null);
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
          <Button
            icon={<Edit size={16} />}
            size="small"
            onClick={() => openEditModal(record.id)}
          />
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
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={openCreateModal}
          >
            Add Product
          </Button>
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

      <Modal
        title={
          <span className="text-2xl">
            {formMode === "create" ? "Add Product" : "Edit Product"}
          </span>
        }
        open={isFormOpen}
        onCancel={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        footer={null}
        width={1100}
        destroyOnClose
      >
        {formLoading ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : (
          <ProductForm
            key={formKey}
            initialData={formMode === "edit" ? editingProduct : undefined}
            onSuccess={handleFormSuccess}
            onRefreshProduct={refreshEditingProduct}
          />
        )}
      </Modal>
    </div>
  );
}
