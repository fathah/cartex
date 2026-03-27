"use client";

import React, { useEffect } from "react";
import { Form, Input, InputNumber, Modal, Switch, message } from "antd";
import {
  createShippingProfile,
  updateShippingProfile,
} from "@/actions/shipping";
import { useShipping } from "../ShippingProvider";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProfile: any | null;
}

export default function ProfileModal({
  isOpen,
  onClose,
  editingProfile,
}: ProfileModalProps) {
  const [formProfile] = Form.useForm();
  const { refreshProfiles } = useShipping();

  useEffect(() => {
    if (isOpen) {
      if (editingProfile) {
        formProfile.setFieldsValue({
          ...editingProfile,
          handlingFee: Number(editingProfile.handlingFee || 0),
        });
      } else {
        formProfile.resetFields();
        formProfile.setFieldsValue({ handlingFee: 0, isDefault: false });
      }
    }
  }, [isOpen, editingProfile, formProfile]);

  const handleProfileSubmit = async (values: any) => {
    try {
      if (editingProfile) {
        await updateShippingProfile(editingProfile.id, values);
        message.success("Profile updated");
      } else {
        await createShippingProfile(values);
        message.success("Profile created");
      }
      await refreshProfiles();
      onClose();
    } catch {
      message.error("Failed to save shipping profile");
    }
  };

  return (
    <Modal
      title={
        editingProfile ? "Edit Shipping Profile" : "Create Shipping Profile"
      }
      open={isOpen}
      onCancel={onClose}
      onOk={formProfile.submit}
    >
      <Form form={formProfile} layout="vertical" onFinish={handleProfileSubmit}>
        <Form.Item
          name="name"
          label="Profile Name"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g. Standard, Heavy Goods, Fragile" />
        </Form.Item>
        <Form.Item name="code" label="Code" rules={[{ required: true }]}>
          <Input placeholder="STANDARD" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea
            rows={3}
            placeholder="Simple explanation for the team"
          />
        </Form.Item>
        <Form.Item name="handlingFee" label="Handling Fee">
          <InputNumber min={0} step={0.01} className="w-full" />
        </Form.Item>
        <Form.Item
          name="isDefault"
          label="Default Profile"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
