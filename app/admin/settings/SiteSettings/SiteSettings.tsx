"use client";

import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Select,
  Upload,
  Divider,
  Row,
  Col,
} from "antd";
import {
  UploadOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { updateSettings } from "@/actions/settings";
import { useCurrency } from "@/components/providers/currency-provider";
import { generateSignedUrl } from "@/services/zdrive";
import { uploadFile } from "@/services/zdrive-client";
import { AppConstants } from "@/constants/constants";

interface SiteSettingsProps {
  initialSettings: any;
}

const ImageUploader = ({
  value,
  onChange,
  label,
}: {
  value?: string;
  onChange?: (val: string) => void;
  label: string;
}) => {
  const [loading, setLoading] = useState(false);

  const getImageUrl = (val: string) => {
    if (val.startsWith("http") || val.startsWith("/")) return val;
    return `${AppConstants.DRIVE_ROOT_URL}/${val}`;
  };

  const fileList = value
    ? [
        {
          uid: "-1",
          name: "image",
          status: "done",
          url: getImageUrl(value),
        },
      ]
    : [];

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setLoading(true);
    try {
      const signedUrl = await generateSignedUrl(file.name);
      if (!signedUrl) throw new Error("Failed to get signed URL");

      const uploadRes = await uploadFile(file, signedUrl);
      if (!uploadRes.success || !uploadRes.filename)
        throw new Error("Upload failed");

      const fullUrl = `${AppConstants.DRIVE_ROOT_URL}/${uploadRes.filename}`;
      onChange?.(fullUrl);
      onSuccess("ok");
      message.success(`${label} uploaded`);
    } catch (err) {
      console.error(err);
      onError(err);
      message.error(`${label} upload failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onChange?.("");
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <Upload
      listType="picture-card"
      fileList={fileList as any}
      customRequest={handleUpload}
      onRemove={handleRemove}
      showUploadList={{ showPreviewIcon: false }}
    >
      {fileList.length >= 1 ? null : uploadButton}
    </Upload>
  );
};

export default function SiteSettings({ initialSettings }: SiteSettingsProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { setCurrency } = useCurrency();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await updateSettings(values);
      if (values.currency) {
        setCurrency(values.currency);
      }
      message.success("Settings updated successfully");
    } catch (error) {
      message.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Site Settings" bordered={false} className="shadow-sm">
      <Form
        form={form}
        layout="vertical"
        initialValues={initialSettings}
        onFinish={onFinish}
      >
        <h3 className="text-lg font-medium mb-4">General Information</h3>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="storeName"
              label="Store Name"
              rules={[{ required: true, message: "Please enter store name" }]}
            >
              <Input placeholder="My E-commerce Store" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="currency"
              label="Store Currency"
              rules={[{ required: true }]}
            >
              <Select size="large">
                <Select.Option value="AED">AED (AED)</Select.Option>
                <Select.Option value="USD">USD ($)</Select.Option>
                <Select.Option value="EUR">EUR (€)</Select.Option>
                <Select.Option value="GBP">GBP (£)</Select.Option>
                <Select.Option value="INR">INR (₹)</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <h3 className="text-lg font-medium mb-4">Branding</h3>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="logoUrl"
              label="Logo"
              extra="Recommended size: 200x60px. Supports PNG, JPG."
            >
              <ImageUploader label="Logo" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="faviconUrl"
              label="Favicon"
              extra="Recommended size: 32x32px. Supports ICO, PNG."
            >
              <ImageUploader label="Favicon" />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <h3 className="text-lg font-medium mb-4">SEO Configuration</h3>
        <Form.Item
          name="seoTitle"
          label="Meta Title"
          extra="This title will appear in search engine results and browser tabs."
        >
          <Input placeholder="My Store - Best Products Online" size="large" />
        </Form.Item>

        <Form.Item
          name="seoDescription"
          label="Meta Description"
          extra="A brief description of your store for search engines."
        >
          <Input.TextArea
            rows={3}
            placeholder="We sell premium products at great prices..."
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            className="bg-[#003d29]"
          >
            Save Site Settings
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
