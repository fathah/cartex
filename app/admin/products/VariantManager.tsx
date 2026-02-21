"use client";

import React, { useState } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Tag,
  Space,
  message,
} from "antd";
import { Plus, Trash2, Edit } from "lucide-react";
import { addOption, updateVariant } from "@/actions/product";
import Currency from "@/components/common/Currency";
import { useCurrency } from "@/components/providers/currency-provider";

interface VariantManagerProps {
  productId: string;
  options: any[];
  variants: any[];
}

export default function VariantManager({
  productId,
  options,
  variants,
}: VariantManagerProps) {
  const [isAddOptionModalOpen, setIsAddOptionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentVariant, setCurrentVariant] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const handleAddOption = async (values: any) => {
    setLoading(true);
    try {
      // Values is likely string "S, M, L", split it
      const optionValues = values.values
        .split(",")
        .map((v: string) => v.trim())
        .filter(Boolean);
      await addOption(productId, values.name, optionValues);
      message.success("Option added and variants generated");
      setIsAddOptionModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error("Failed to add option");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVariant = async (values: any) => {
    setLoading(true);
    try {
      await updateVariant(currentVariant.id, values);
      message.success("Variant updated");
      setIsEditModalOpen(false);
      setCurrentVariant(null);
      // Optionally trigger refresh if not using router refresh in action
    } catch (error) {
      message.error("Failed to update variant");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (record: any) => {
    setCurrentVariant(record);
    editForm.setFieldsValue({
      originalPrice: Number(record.originalPrice),
      salePrice: Number(record.salePrice),
      sku: record.sku,
      inventory: record.inventory?.quantity || 0,
    });
    setIsEditModalOpen(true);
  };

  const variantColumns = [
    { title: "Variant", dataIndex: "title", key: "title" },
    {
      title: "Original Price",
      dataIndex: "originalPrice",
      key: "originalPrice",
      render: (val: any) => <Currency value={val} />,
    },
    {
      title: "Sale Price",
      dataIndex: "salePrice",
      key: "salePrice",
      render: (val: any) => <Currency value={val} />,
    },

    {
      title: "Inventory",
      dataIndex: "inventory",
      key: "inventory",
      render: (inv: any) => inv?.quantity || 0,
    },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          icon={<Edit size={16} />}
          size="small"
          onClick={() => openEditModal(record)}
        />
      ),
    },
  ];

  return (
    <Space direction="vertical" className="w-full">
      <Card
        title="Options"
        extra={
          <Button
            onClick={() => setIsAddOptionModalOpen(true)}
            icon={<Plus size={16} />}
          >
            Add Option
          </Button>
        }
      >
        {options.map((opt) => (
          <div
            key={opt.id}
            className="mb-4 border-b pb-4 last:border-0 last:pb-0"
          >
            <div className="font-semibold mb-2">{opt.name}</div>
            <Space wrap>
              {opt.values.map((v: any) => (
                <Tag key={v.id}>{v.value}</Tag>
              ))}
            </Space>
          </div>
        ))}
        {options.length === 0 && (
          <div className="text-gray-500">No options added.</div>
        )}
      </Card>

      {variants.length > 0 && (
        <Card title="Variants">
          <Table
            dataSource={variants}
            columns={variantColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      )}

      <Modal
        title="Add Option"
        open={isAddOptionModalOpen}
        onCancel={() => setIsAddOptionModalOpen(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddOption} layout="vertical">
          <Form.Item
            name="name"
            label="Option Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Size, Color, Material" />
          </Form.Item>
          <Form.Item
            name="values"
            label="Values (comma separated)"
            rules={[{ required: true }]}
          >
            <Input placeholder="Small, Medium, Large" />
          </Form.Item>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => setIsAddOptionModalOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={`Edit Variant: ${currentVariant?.title}`}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <Form form={editForm} onFinish={handleEditVariant} layout="vertical">
          <Form.Item
            name="originalPrice"
            label="Original Price"
            rules={[{ required: true }]}
          >
            <InputNumber
              prefix={<Currency value={0} currencyOnly />}
              style={{ width: "100%" }}
              min={0}
              precision={2}
            />
          </Form.Item>
          <Form.Item
            name="salePrice"
            label="Sale Price"
            rules={[{ required: true }]}
          >
            <InputNumber
              prefix={<Currency value={0} currencyOnly />}
              style={{ width: "100%" }}
              min={0}
              precision={2}
            />
          </Form.Item>
          <Form.Item
            name="inventory"
            label="Inventory Quantity"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item name="sku" label="SKU">
            <Input placeholder="PROD-001" />
          </Form.Item>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setIsEditModalOpen(false)} className="mr-2">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </Space>
  );
}
