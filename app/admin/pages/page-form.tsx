"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Switch, message } from "antd";
import {
  createPage,
  updatePage,
  checkPageSlugAvailability,
} from "@/actions/app_pages";

interface PageFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const PageFormModal: React.FC<PageFormModalProps> = ({
  open,
  onCancel,
  onSuccess,
  initialData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue(initialData);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialData, form]);

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEdit) {
      // Only auto-generate slug on create
      const name = e.target.value;
      const slug = slugify(name);
      form.setFieldsValue({ slug });
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Check slug uniqueness
      const isAvailable = await checkPageSlugAvailability(
        values.slug,
        initialData?.id,
      );
      if (!isAvailable) {
        form.setFields([{ name: "slug", errors: ["Slug already exists"] }]);
        setLoading(false);
        return;
      }

      let res;
      if (isEdit) {
        res = await updatePage(initialData.id, values);
      } else {
        res = await createPage(values);
      }

      if (res.success) {
        message.success(`Page ${isEdit ? "updated" : "created"} successfully`);
        onSuccess();
        onCancel(); // Close modal
      } else {
        message.error(res.error || "Operation failed");
      }
    } catch (error) {
      console.error(error);
      message.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit Page" : "Create New Page"}
      open={open}
      onCancel={onCancel}
      onOk={form.submit}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="Page Name"
          rules={[{ required: true, message: "Please enter page name" }]}
        >
          <Input placeholder="e.g. About Us" onChange={handleNameChange} />
        </Form.Item>

        <Form.Item
          name="slug"
          label="Slug"
          rules={[{ required: true, message: "Please enter a unique slug" }]}
          help="Unique URL identifier (e.g. about-us)"
        >
          <Input placeholder="about-us" />
        </Form.Item>

        <Form.Item name="isPublished" label="Published" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PageFormModal;
