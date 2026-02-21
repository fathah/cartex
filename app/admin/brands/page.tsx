"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Card,
  Drawer,
  Popconfirm,
  Badge,
} from "antd";
import { Plus, Edit, Trash2, Component, Images } from "lucide-react";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/actions/brands";
import AdminLayout from "@/components/layout/AdminLayout";
import MediaPicker from "@/app/admin/media/media_picker";
import { AppConstants } from "@/constants/constants";

export default function BrandsIndex() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState<any>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // Logo state
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch brands");
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (brand?: any) => {
    setCurrentBrand(brand || null);
    if (brand) {
      form.setFieldsValue({ name: brand.name });
      setSelectedLogo(brand.logo || null);
    } else {
      form.resetFields();
      setSelectedLogo(null);
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setCurrentBrand(null);
    form.resetFields();
    setSelectedLogo(null);
  };

  const handleSave = async (values: any) => {
    try {
      setSaving(true);
      if (currentBrand) {
        await updateBrand(currentBrand.id, values.name, selectedLogo);
        message.success("Brand updated successfully");
      } else {
        await createBrand(values.name, selectedLogo || undefined);
        message.success("Brand created successfully");
      }
      closeDrawer();
      fetchBrands();
    } catch (error) {
      console.error(error);
      message.error("Failed to save brand");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBrand(id);
      message.success("Brand deleted successfully");
      fetchBrands();
    } catch (error) {
      console.error(error);
      message.error("Failed to delete brand. It might be linked to products.");
    }
  };

  const columns = [
    {
      title: "Logo",
      dataIndex: "logo",
      key: "logo",
      width: 100,
      render: (logo: string) =>
        logo ? (
          <div className="w-12 h-12 bg-gray-50 rounded-md flex items-center justify-center border p-1 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${AppConstants.DRIVE_ROOT_URL}/${logo}`}
              alt="Brand Logo"
              className="max-w-full max-h-full object-contain mix-blend-multiply"
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
            <Component size={20} />
          </div>
        ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      className: "font-medium text-gray-900",
    },
    {
      title: "Linked Products",
      key: "products",
      render: (_: any, record: any) => (
        <Badge count={record._count?.products || 0} showZero color="#1cc88a" />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<Edit size={16} />}
            onClick={() => openDrawer(record)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          />
          <Popconfirm
            title="Delete the brand"
            description="Are you sure to delete this brand?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              className="hover:bg-red-50"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage product brands and logos
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => openDrawer()}
          className="bg-[#003d29] hover:bg-[#002a1c] flex items-center gap-2"
        >
          Add Brand
        </Button>
      </div>

      <Card className="shadow-sm border-gray-200">
        <Table
          columns={columns}
          dataSource={brands}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 12 }}
          scroll={{ x: 600 }}
        />
      </Card>

      <Drawer
        title={currentBrand ? "Edit Brand" : "Create Brand"}
        placement="right"
        onClose={closeDrawer}
        open={isDrawerOpen}
        width={400}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="name"
            label="Brand Name"
            rules={[{ required: true, message: "Please enter brand name" }]}
          >
            <Input placeholder="e.g. Nike, Apple, Sony" size="large" />
          </Form.Item>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Brand Logo
            </label>

            <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center gap-4 bg-gray-50">
              {selectedLogo ? (
                <div className="relative group w-32 h-32 bg-white rounded-lg shadow-sm border p-2 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${AppConstants.DRIVE_ROOT_URL}/${selectedLogo}`}
                    alt="Selected Logo"
                    className="max-w-full max-h-full object-contain mix-blend-multiply"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <Button
                      danger
                      size="small"
                      onClick={() => setSelectedLogo(null)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Images size={24} />
                  <span className="text-xs">No Logo</span>
                </div>
              )}

              <MediaPicker
                onSelect={(media: any) => {
                  setSelectedLogo(media.url);
                  message.success("Logo selected");
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-8">
            <Button onClick={closeDrawer}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              className="bg-[#003d29]"
            >
              {currentBrand ? "Save Changes" : "Create Brand"}
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}
