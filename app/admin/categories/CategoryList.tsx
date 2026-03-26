"use client";

import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Space,
} from "antd";
import { Plus, Pencil, Trash2, Image as ImageIcon, X } from "lucide-react";
import MediaPicker from "../media/media_picker";
import { getMediaUrl } from "@/utils/media_url";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/categories";

interface CategoryListProps {
  initialCategories: any[];
}

export default function CategoryList({ initialCategories }: CategoryListProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);

  // Sync prop changes if needed (e.g. after server revalidation)
  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const showModal = (category?: any) => {
    setEditingCategory(category || null);
    if (category) {
      form.setFieldsValue(category);
      setSelectedMediaUrl(category.image?.url || null);
    } else {
      form.resetFields();
      setSelectedMediaUrl(null);
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    setSelectedMediaUrl(null);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, values);
        if (result.success) {
          message.success("Category updated successfully");
          // Optimistic update or wait for prop update
        } else {
          message.error("Failed to update category");
        }
      } else {
        const result = await createCategory(values);
        if (result.success) {
          message.success("Category created successfully");
        } else {
          message.error("Failed to create category");
        }
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteCategory(id);
      if (result.success) {
        message.success("Category deleted");
      } else {
        message.error("Failed to delete");
      }
    } catch (error) {
      message.error("Error deleting category");
    }
  };

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
      title: "Image",
      key: "image",
      render: (_: any, record: any) =>
        record.image?.url ? (
          <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden border">
            <img
              src={getMediaUrl(record.image.url)}
              alt="Category"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center border border-dashed">
            <ImageIcon size={16} className="text-gray-300" />
          </div>
        ),
    },
    {
      title: "Products",
      key: "products",
      render: (_: any, record: any) => record._count?.products || 0,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<Pencil size={16} />}
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Delete this category?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<Trash2 size={16} />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-end items-center mb-6">
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => showModal()}
        >
          Add Category
        </Button>
      </div>

      <Table
        dataSource={categories}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
      />

      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input
              onChange={(e) => {
                if (!editingCategory) {
                  const slug = e.target.value
                    .toLowerCase()
                    .replace(/ /g, "-")
                    .replace(/[^\w-]+/g, "");
                  form.setFieldsValue({ slug });
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: "Please enter slug" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>

          <Form.Item name="mediaId" hidden>
            <Input />
          </Form.Item>

          <Form.Item label="Image (Optional)">
            <div className="flex items-center gap-4">
              {selectedMediaUrl && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border shadow-sm group">
                  <img
                    src={getMediaUrl(selectedMediaUrl)}
                    alt="Selected media"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                    onClick={() => {
                      form.setFieldsValue({ mediaId: null });
                      setSelectedMediaUrl(null);
                    }}
                  >
                    <X className="text-white" size={20} />
                  </div>
                </div>
              )}
              <MediaPicker
                onSelect={(media) => {
                  form.setFieldsValue({ mediaId: media.id });
                  setSelectedMediaUrl(media.url);
                }}
                trigger={
                  <Button icon={<ImageIcon size={16} />}>
                    {selectedMediaUrl ? "Change Image" : "Select Image"}
                  </Button>
                }
              />
            </div>
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingCategory ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
