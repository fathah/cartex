import React, { useState } from "react";
import { Form, Input, Button, Card, message, Select, Upload } from "antd";
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

interface SettingsFormProps {
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

  // Parse initial value to fileList if exists
  // Ensure we display the image correctly whether it's a full URL or a relative path from ZDrive
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

      // Save full URL so it works with simple <img src> in the storefront
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

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
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
    <Card title="Store Settings">
      <Form
        form={form}
        layout="vertical"
        initialValues={initialSettings}
        onFinish={onFinish}
      >
        <Form.Item
          name="storeName"
          label="Store Name"
          rules={[{ required: true, message: "Please enter store name" }]}
        >
          <Input placeholder="My E-commerce Store" />
        </Form.Item>

        <Form.Item
          name="currency"
          label="Currency"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="AED">AED (AED)</Select.Option>
            <Select.Option value="USD">USD ($)</Select.Option>
            <Select.Option value="EUR">EUR (€)</Select.Option>
            <Select.Option value="GBP">GBP (£)</Select.Option>
            <Select.Option value="INR">INR (₹)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="logoUrl" label="Logo" extra="Upload your store logo">
          <ImageUploader label="Logo" />
        </Form.Item>

        <Form.Item
          name="faviconUrl"
          label="Favicon"
          extra="Upload your store favicon"
        >
          <ImageUploader label="Favicon" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
