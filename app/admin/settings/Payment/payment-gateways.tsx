"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Collapse,
  Empty,
} from "antd";
import { Plus, Settings } from "lucide-react";
import {
  getPaymentGateways,
  createPaymentGateway,
  updatePaymentGateway,
} from "@/actions/payment";
import { GatewayEnvironment } from "@prisma/client";

const { Panel } = Collapse;

export default function PaymentGateways() {
  const [gateways, setGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<any>(null);
  const [formGateway] = Form.useForm();

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const data = await getPaymentGateways();
      setGateways(data);
    } catch (error) {
      message.error("Failed to load gateways");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const handleAddGateway = () => {
    setEditingGateway(null);
    formGateway.resetFields();
    setIsGatewayModalOpen(true);
  };

  const handleEditGateway = (gateway: any) => {
    setEditingGateway(gateway);
    formGateway.setFieldsValue({
      ...gateway,
      config: JSON.stringify(gateway.config, null, 2),
    });
    setIsGatewayModalOpen(true);
  };

  const handleGatewaySubmit = async (values: any) => {
    try {
      let configParsed = {};
      try {
        configParsed = JSON.parse(values.config || "{}");
      } catch (e) {
        message.error("Invalid JSON config");
        return;
      }

      const data = { ...values, config: configParsed };

      if (editingGateway) {
        await updatePaymentGateway(editingGateway.id, data);
        message.success("Gateway updated");
      } else {
        await createPaymentGateway(data);
        message.success("Gateway created");
      }
      setIsGatewayModalOpen(false);
      fetchGateways();
    } catch (err) {
      message.error("Operation failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Payment Gateways</h2>
          <p className="text-gray-500 text-sm">
            Manage integrations with payment providers.
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={handleAddGateway}>
          Add Gateway
        </Button>
      </div>

      <Collapse ghost>
        {gateways.map((gateway) => (
          <Panel
            key={gateway.id}
            header={
              <div className="flex items-center gap-2">
                <Settings size={16} />
                <span className="font-medium">{gateway.name}</span>
                {gateway.environment === "TEST" && (
                  <Tag color="orange">TEST MODE</Tag>
                )}
              </div>
            }
            extra={
              <Button
                size="small"
                type="link"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditGateway(gateway);
                }}
              >
                Configure
              </Button>
            }
          >
            <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(gateway.config, null, 2)}
            </pre>
          </Panel>
        ))}
      </Collapse>
      {gateways.length === 0 && !loading && (
        <Empty description="No gateways configured" />
      )}

      {/* Gateway Modal */}
      <Modal
        title={editingGateway ? "Configure Gateway" : "Add Payment Gateway"}
        open={isGatewayModalOpen}
        onCancel={() => setIsGatewayModalOpen(false)}
        onOk={formGateway.submit}
      >
        <Form
          form={formGateway}
          layout="vertical"
          onFinish={handleGatewaySubmit}
        >
          <Form.Item
            name="name"
            label="Provider Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Stripe" />
          </Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input placeholder="stripe" />
          </Form.Item>
          <Form.Item
            name="environment"
            label="Environment"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value={GatewayEnvironment.TEST}>
                Test / Sandbox
              </Select.Option>
              <Select.Option value={GatewayEnvironment.LIVE}>
                Live / Production
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="config"
            label="Configuration (JSON)"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={6} placeholder='{ "apiKey": "..." }' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
