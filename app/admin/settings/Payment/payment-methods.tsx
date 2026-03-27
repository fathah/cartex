"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Tag,
  message,
} from "antd";
import { Banknote, CreditCard, Edit2 } from "lucide-react";
import {
  getPaymentMethods,
  getPaymentGateways,
  updatePaymentMethod,
} from "@/actions/payment";
import { CHECKOUT_PAYMENT_METHODS } from "@/lib/payment-methods";

export default function PaymentMethods() {
  const [methods, setMethods] = useState<any[]>([]);
  const [gateways, setGateways] = useState<any[]>([]);
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
      setGateways(fetchedGateways.filter((gateway: any) => gateway.isActive));
    } catch (error) {
      message.error("Failed to load payment settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditMethod = async (method: any) => {
    try {
      const latestGateways = await getPaymentGateways();
      setGateways(latestGateways.filter((gateway: any) => gateway.isActive));
    } catch {
      message.error("Failed to refresh gateways");
    }

    setEditingMethod(method);
    formMethod.setFieldsValue({
      description: method.description,
      fee: method.fee ? Number(method.fee) : undefined,
      feeLabel: method.feeLabel,
      feeType: method.feeType || "FLAT",
      gatewayIds: method.gateways.map((gateway: any) => gateway.id),
      isActive: method.isActive,
      name: method.name,
    });
    setIsMethodModalOpen(true);
  };

  const handleMethodSubmit = async (values: any) => {
    if (!editingMethod) {
      return;
    }

    try {
      await updatePaymentMethod(editingMethod.id, {
        description: values.description,
        fee: values.fee ?? undefined,
        feeLabel: values.feeLabel,
        feeType: values.feeType,
        gatewayIds:
          editingMethod.code === CHECKOUT_PAYMENT_METHODS.ONLINE.code
            ? values.gatewayIds || []
            : [],
        isActive: values.isActive,
        name: values.name,
      });
      message.success("Payment method updated");
      setIsMethodModalOpen(false);
      fetchData();
    } catch (err) {
      message.error("Failed to update payment method");
    }
  };

  const handleToggleMethod = async (id: string, checked: boolean) => {
    try {
      await updatePaymentMethod(id, { isActive: checked });
      setMethods((current) =>
        current.map((method) =>
          method.id === id ? { ...method, isActive: checked } : method,
        ),
      );
      message.success(checked ? "Method enabled" : "Method disabled");
    } catch (err) {
      message.error("Failed to update status");
    }
  };

  const methodCards = methods.sort((left, right) => {
    const sortOrder = [CHECKOUT_PAYMENT_METHODS.COD.code, CHECKOUT_PAYMENT_METHODS.ONLINE.code];
    return sortOrder.indexOf(left.code) - sortOrder.indexOf(right.code);
  });

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Checkout Payment Methods</h2>
        <p className="text-gray-500 text-sm">
          Keep checkout simple with just Cash on Delivery and Online Payment.
          Gateways are attached to Online Payment only.
        </p>
      </div>

      <div className="grid gap-4">
        {methodCards.map((method) => {
          const isOnline = method.code === CHECKOUT_PAYMENT_METHODS.ONLINE.code;

          return (
            <Card key={method.id} size="small" className="border-gray-200">
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                    {isOnline ? (
                      <CreditCard size={20} />
                    ) : (
                      <Banknote size={20} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{method.name}</span>
                      <Tag>{method.code}</Tag>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {isOnline
                        ? method.gateways.length > 0
                          ? `Connected gateways: ${method.gateways.map((gateway: any) => gateway.name).join(", ")}`
                          : "No active gateway linked"
                        : "Offline payment collected on delivery"}
                    </div>
                    {method.fee > 0 && (
                      <div className="text-amber-600 text-xs mt-1">
                        Fee: {method.feeLabel || `${method.feeType === "PERCENTAGE" ? `${method.fee}%` : method.fee}`}
                      </div>
                    )}
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
                </div>
              </div>
            </Card>
          );
        })}
        {methodCards.length === 0 && !loading && (
          <Empty description="No payment methods" />
        )}
      </div>

      <Modal
        title={editingMethod ? `Edit ${editingMethod.name}` : "Edit Payment Method"}
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
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>

          {editingMethod?.code === CHECKOUT_PAYMENT_METHODS.ONLINE.code && (
            <Form.Item
              name="gatewayIds"
              label="Connected Gateways"
              rules={[{ required: true, message: "Select at least one gateway" }]}
            >
              <Select mode="multiple" placeholder="Select gateways">
                {gateways.map((gateway) => (
                  <Select.Option key={gateway.id} value={gateway.id}>
                    {gateway.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="feeType" label="Fee Type" initialValue="FLAT">
              <Select>
                <Select.Option value="FLAT">Flat Amount</Select.Option>
                <Select.Option value="PERCENTAGE">Percentage</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="fee" label="Fee Value">
              <InputNumber min={0} step={0.01} className="w-full" />
            </Form.Item>
          </div>

          <Form.Item name="feeLabel" label="Fee Label (Optional)">
            <Input placeholder="e.g. +5 AED processing fee" />
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
