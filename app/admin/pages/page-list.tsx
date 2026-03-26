"use client";

import React, { useState } from "react";
import { Table, Button, Space, Tag, Popconfirm, message } from "antd";
import { Edit, Trash2, Plus, ExternalLink, Library } from "lucide-react";
import { Page } from "@prisma/client";
import { deletePage } from "@/actions/app_pages";
import PageFormModal from "./page-form";
import PresetSidebar from "./_components/preset-sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PageListProps {
  data: Page[];
}

const PageList: React.FC<PageListProps> = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isPresetSidebarOpen, setIsPresetSidebarOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    try {
      const res = await deletePage(id);
      if (res.success) {
        message.success("Page deleted");
        router.refresh();
      } else {
        message.error("Failed to delete page");
      }
    } catch (e) {
      console.error(e);
      message.error("Error deleting page");
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPage(null);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    router.refresh();
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Page) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{text}</span>
          <span className="text-xs text-gray-500">/{record.slug}</span>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "isPublished",
      key: "isPublished",
      render: (isPublished: boolean) => (
        <Tag color={isPublished ? "green" : "orange"}>
          {isPublished ? "Published" : "Draft"}
        </Tag>
      ),
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: Date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Page) => (
        <Space>
          <Link href={`/admin/pages/${record.id}`}>
            <Button
              icon={<ExternalLink size={16} />}
              type="text"
              title="Page Builder"
            />
          </Link>
          <Button
            type="text"
            icon={<Edit size={16} />}
            onClick={() => handleEdit(record)}
            title="Edit Properties"
          />
          <Popconfirm
            title="Delete this page?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<Trash2 size={16} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pages</h1>
        <Space>
          <Button
            icon={<Library size={16} />}
            onClick={() => setIsPresetSidebarOpen(true)}
          >
            Presets
          </Button>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleCreate}
          >
            Create Page
          </Button>
        </Space>
      </div>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <PageFormModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        initialData={editingPage}
      />

      <PresetSidebar
        open={isPresetSidebarOpen}
        onClose={() => setIsPresetSidebarOpen(false)}
      />
    </div>
  );
};

export default PageList;
