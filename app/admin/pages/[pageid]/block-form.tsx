"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { generateSignedUrl } from "@/services/zdrive";
import { uploadFile } from "@/services/zdrive-client";

interface BlockFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (config: any) => void;
  initialConfig?: any;
  blockType: string;
}

const BlockFormModal: React.FC<BlockFormModalProps> = ({
  open,
  onCancel,
  onSuccess,
  initialConfig,
  blockType,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialConfig) {
        form.setFieldsValue(initialConfig);
      }
    }
  }, [open, initialConfig, form]);

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      const signedUrl = await generateSignedUrl(file.name);
      if (!signedUrl) throw new Error("Failed to get signed URL");

      const uploadRes = await uploadFile(file, signedUrl);
      if (!uploadRes.success || !uploadRes.filename)
        throw new Error("Upload to ZDrive failed");

      onSuccess(uploadRes.filename);
    } catch (err) {
      console.error(err);
      onError(new Error("Upload failed"));
      message.error("Upload failed");
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const onFinish = (values: any) => {
    // Process values if needed (e.g. extract image URL from upload)
    const processedValues = { ...values };

    if (values.image && values.image[0]?.response) {
      processedValues.imageUrl = values.image[0].response;
      delete processedValues.image;
    } else if (values.image && typeof values.image === "string") {
      processedValues.imageUrl = values.image;
    }

    onSuccess(processedValues);
  };

  const renderFields = () => {
    switch (blockType) {
      case "HERO":
        return (
          <>
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="subtitle" label="Subtitle">
              <Input />
            </Form.Item>
            <Form.Item name="ctaText" label="CTA Text">
              <Input />
            </Form.Item>
            <Form.Item name="ctaLink" label="CTA Link">
              <Input />
            </Form.Item>
            <Form.Item
              name="image"
              label="Background Image"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                customRequest={handleUpload}
                listType="picture"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Form.Item>
            {/* If editing and has existing image, we might want to show it or handle it better. 
                 For simplicity, this assumes a fresh upload or just overwriting. 
                 Real implementation would handle initial fileList for existing image.
              */}
          </>
        );
      case "TEXT":
        return (
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>
        );
      case "IMAGE_GRID":
        return (
          <div className="text-gray-500">
            Image Grid configuration coming soon.
          </div>
        );
      default:
        return <div>Unknown Block Type</div>;
    }
  };

  return (
    <Modal
      title={`Edit ${blockType} Block`}
      open={open}
      onCancel={onCancel}
      onOk={form.submit}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {renderFields()}
      </Form>
    </Modal>
  );
};

export default BlockFormModal;
