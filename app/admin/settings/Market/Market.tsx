"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Input,
  Space,
  Tag,
  Popconfirm,
  message,
  Card,
  Tooltip,
} from "antd";
import { Plus, Trash2, Edit, Globe, Power, Archive } from "lucide-react";
import {
  getMarkets,
  createMarket,
  updateMarket,
  deleteMarket,
} from "@/actions/market";
import { COUNTRIES } from "@/constants/regions";

const ShopMarket = () => {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingMarket, setEditingMarket] = useState<any>(null);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const data = await getMarkets();
      setMarkets(data);
    } catch (error) {
      message.error("Failed to fetch markets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const handleCreateOrUpdate = async (values: any) => {
    try {
      if (editingMarket) {
        await updateMarket(editingMarket.id, {
          name: values.name,
        });
        message.success("Market updated successfully");
      } else {
        const country = (COUNTRIES as any)[values.countryCode];
        await createMarket({
          name: values.name || country.name,
          code: country.code,
          countryCode: country.code,
          currencyCode: country.currency,
        });
        message.success("Market created successfully");
      }
      setModalOpen(false);
      form.resetFields();
      setEditingMarket(null);
      fetchMarkets();
    } catch (error) {
      message.error("Failed to save market");
    }
  };

  const handleToggleStatus = async (market: any) => {
    try {
      await updateMarket(market.id, { isActive: !market.isActive });
      message.success(
        `Market ${market.isActive ? "deactivated" : "activated"}`,
      );
      fetchMarkets();
    } catch (error) {
      message.error("Failed to update market status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMarket(id);
      message.success("Market deleted successfully");
      fetchMarkets();
    } catch (error) {
      message.error("Failed to delete market");
    }
  };

  const columns = [
    {
      title: "Market Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <Space>
          <span className="font-medium text-gray-900">{text}</span>
          <Tag color="blue">{record.code}</Tag>
        </Space>
      ),
    },
    {
      title: "Currency",
      dataIndex: "currencyCode",
      key: "currencyCode",
      render: (text: string) => <Tag color="orange">{text}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Active" : "Archived"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title={record.isActive ? "Deactivate" : "Activate"}>
            <Button
              type="text"
              icon={
                <Power
                  size={16}
                  className={
                    record.isActive ? "text-green-500" : "text-gray-400"
                  }
                />
              }
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Button
            type="text"
            icon={<Edit size={16} className="text-blue-500" />}
            onClick={() => {
              setEditingMarket(record);
              form.setFieldsValue(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="Delete Market?"
            description="All regional pricing for this market will be lost."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<Trash2 size={16} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Filter out countries that are already added
  const availableCountries = Object.values(COUNTRIES).filter(
    (c) => !markets.some((m) => m.code === c.code),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 m-0">
              Regional Markets
            </h2>
            <p className="text-gray-500 m-0 text-sm">
              Manage countries where you sell your products
            </p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={() => {
            setEditingMarket(null);
            form.resetFields();
            setModalOpen(true);
          }}
          className="h-12 px-6 rounded-xl font-bold bg-blue-600 shadow-lg shadow-blue-100"
        >
          Add Market
        </Button>
      </div>

      <Card
        className="rounded-2xl border-gray-100 shadow-sm overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={markets}
          loading={loading}
          rowKey="id"
          pagination={false}
          className="market-table"
        />
      </Card>

      <Modal
        title={editingMarket ? "Edit Market" : "Add New Market"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingMarket ? "Save Changes" : "Create Market"}
        destroyOnClose
        centered
        className="rounded-2xl"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
          className="mt-4"
        >
          {!editingMarket && (
            <Form.Item
              name="countryCode"
              label="Select Country"
              rules={[{ required: true, message: "Please select a country" }]}
            >
              <Select placeholder="Choose a region to expand to">
                {availableCountries.map((c: any) => (
                  <Select.Option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="Market Display Name"
            rules={[{ required: true, message: "Please enter a name" }]}
            help="This is how the market will be identified in the admin panel."
          >
            <Input placeholder="e.g. UAE Market" />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        .market-table .ant-table-thead > tr > th {
          background: #f9fafb !important;
          font-weight: 600 !important;
          color: #4b5563 !important;
          padding: 16px 24px !important;
        }
        .market-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
        }
        .market-table .ant-table-row:hover > td {
          background: #f3f4f6 !important;
        }
      `}</style>
    </div>
  );
};

export default ShopMarket;
