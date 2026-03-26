"use client";

import { useState } from "react";
import { Alert, Button, Card, Form, Input, message } from "antd";
import { Bot, KeyRound } from "lucide-react";
import { updateAIAutomationSettings } from "@/actions/settings";

interface AIAutomationSettingsProps {
  initialSettings: {
    openrouterApiKey?: string | null;
    openrouterModel?: string | null;
  };
}

export default function AIAutomationSettings({
  initialSettings,
}: AIAutomationSettingsProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    openrouterApiKey?: string;
    openrouterModel?: string;
  }) => {
    setLoading(true);

    try {
      await updateAIAutomationSettings({
        openrouterApiKey: values.openrouterApiKey?.trim() || null,
        openrouterModel: values.openrouterModel?.trim() || null,
      });
      message.success("AI & automation settings saved");
    } catch {
      message.error("Failed to save AI & automation settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="AI & Automation"
      bordered={false}
      className="shadow-sm"
    >
      <Alert
        type="info"
        showIcon
        className="mb-6"
        message="Configure the OpenRouter credentials used for AI-powered workflows."
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          openrouterApiKey: initialSettings?.openrouterApiKey || "",
          openrouterModel: initialSettings?.openrouterModel || "",
        }}
        onFinish={onFinish}
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
            <Bot size={16} className="text-sky-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">
            OpenRouter Configuration
          </h3>
        </div>

        <Form.Item
          name="openrouterApiKey"
          label="OpenRouter API Key"
          extra="Stored in the database so server-side AI automations can use it."
        >
          <Input.Password
            size="large"
            placeholder="sk-or-v1-..."
            prefix={<KeyRound size={16} className="text-gray-400" />}
          />
        </Form.Item>

        <Form.Item
          name="openrouterModel"
          label="Model Name"
          extra="Example: openai/gpt-5-mini or the specific model you plan to use."
        >
          <Input size="large" placeholder="openai/gpt-5-mini" />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            className="bg-[#003d29]"
          >
            Save AI Settings
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
