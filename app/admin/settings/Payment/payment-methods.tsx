"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Tag,
} from "antd";
import { Plus, Trash2, Edit2, CreditCard, Wallet } from "lucide-react";
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getPaymentGateways,
} from "@/actions/payment";
import { PaymentMethodType } from "@prisma/client";

export default function PaymentMethods() {
  const [methods, setMethods] = useState<any[]>([]);
  const [gateways, setGateways] = useState<any[]>([]); // Loading gateways just for linking dropdown
  const [loading, setLoading] = useState(false);

  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [formMethod] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedMethods, fetchedGateways] = await Promise.all([
        getPaymentMethods(),
        getPaymentGateways(),
      ]);
      setMethods(fetchedMethods);
      setGateways(fetchedGateways);
    } catch (error) {
      message.error("Failed to load payment settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMethod = () => {
    setEditingMethod(null);
    formMethod.resetFields();
    setIsMethodModalOpen(true);
  };

  const handleEditMethod = (method: any) => {
    setEditingMethod(method);
    formMethod.setFieldsValue({
      ...method,
      gatewayIds: method.gateways.map((g: any) => g.id),
    });
    setIsMethodModalOpen(true);
  };

  const handleMethodSubmit = async (values: any) => {
    try {
      if (editingMethod) {
        await updatePaymentMethod(editingMethod.id, values);
        message.success("Payment method updated");
      } else {
        await createPaymentMethod(values);
        message.success("Payment method created");
      }
      setIsMethodModalOpen(false);
      fetchData();
    } catch (err) {
      message.error("Operation failed");
    }
  };

  const handleToggleMethod = async (id: string, checked: boolean) => {
    try {
      await updatePaymentMethod(id, { isActive: checked });
      setMethods(
        methods.map((m) => (m.id === id ? { ...m, isActive: checked } : m)),
      );
      message.success(checked ? "Method enabled" : "Method disabled");
    } catch (err) {
      message.error("Failed to update status");
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      await deletePaymentMethod(id);
      message.success("Method deleted");
      fetchData();
    } catch (err) {
      message.error("Failed to delete");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Payment Methods</h2>
          <p className="text-gray-500 text-sm">
            Configure options available to users at checkout.
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={handleAddMethod}
        >
          Add Method
        </Button>
      </div>

      <div className="grid gap-4">
        {methods.map((method) => (
          <Card key={method.id} size="small" className="border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                  {method.type === "CARD" ? (
                    <CreditCard size={20} />
                  ) : (
                    <Wallet size={20} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{method.name}</span>
                    <Tag>{method.code}</Tag>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {method.gateways.length > 0
                      ? `Processed by: ${method.gateways.map((g: any) => g.name).join(", ")}`
                      : "No gateway linked"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Switch
                  checked={method.isActive}
                  onChange={(checked) => handleToggleMethod(method.id, checked)}
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
                <Button
                  type="text"
                  icon={<Edit2 size={16} />}
                  onClick={() => handleEditMethod(method)}
                />
                <Button
                  type="text"
                  danger
                  icon={<Trash2 size={16} />}
                  onClick={() => handleDeleteMethod(method.id)}
                />
              </div>
            </div>
          </Card>
        ))}
        {methods.length === 0 && !loading && (
          <Empty description="No payment methods" />
        )}
      </div>

      {/* Method Modal */}
      <Modal
        title={editingMethod ? "Edit Payment Method" : "Add Payment Method"}
        open={isMethodModalOpen}
        onCancel={() => setIsMethodModalOpen(false)}
        onOk={formMethod.submit}
      >
        <Form form={formMethod} layout="vertical" onFinish={handleMethodSubmit}>
          <Form.Item
            name="name"
            label="Display Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Credit Card" />
          </Form.Item>
          <Form.Item
            name="code"
            label="Code (Unique)"
            rules={[{ required: true }]}
          >
            <Input placeholder="CARD" />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={PaymentMethodType.CARD}>Card</Select.Option>
              <Select.Option value={PaymentMethodType.COD}>
                Cash On Delivery
              </Select.Option>
              <Select.Option value={PaymentMethodType.WALLET}>
                Wallet
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="gatewayIds" label="Linked Gateways (Optional)">
            <Select mode="multiple" placeholder="Select gateways">
              {gateways.map((g) => (
                <Select.Option key={g.id} value={g.id}>
                  {g.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="feeType" label="Fee Type" initialValue="FLAT">
              <Select>
                <Select.Option value="FLAT">Flat Amount</Select.Option>
                <Select.Option value="PERCENTAGE">Percentage</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="fee" label="Fee Value">
              <Input type="number" step="0.01" placeholder="0.00" />
            </Form.Item>
          </div>

          <Form.Item name="feeLabel" label="Fee Label (Optional)">
            <Input placeholder="e.g. +$5 Processing Fee" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
