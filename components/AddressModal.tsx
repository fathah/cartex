"use client";

import { Modal, Form, Input, Select, Button, message } from "antd";
import { useState } from "react";
import { addAddress } from "@/actions/addresses";

interface AddressModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: any;
}

export default function AddressModal({
  open,
  onCancel,
  onSuccess,
  initialValues,
}: AddressModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values: any) => {
    setLoading(true);
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (values[key]) formData.append(key, values[key]);
    });

    try {
      await addAddress(formData);
      message.success("Address saved successfully");
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error(error);
      message.error("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={initialValues?.id ? "Edit Address" : "Add New Address"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues || { country: "UAE" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: "Please enter first name" }]}
          >
            <Input placeholder="e.g. Faab" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: "Please enter last name" }]}
          >
            <Input placeholder="e.g. Yorker" />
          </Form.Item>
        </div>

        <Form.Item
          name="address1"
          label="Address Line 1"
          rules={[{ required: true, message: "Please enter address" }]}
        >
          <Input placeholder="e.g. Deira, Dubai" />
        </Form.Item>

        <Form.Item name="address2" label="Address Line 2 (Optional)">
          <Input placeholder="Apartment, suite, etc." />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="city"
            label="City"
            rules={[{ required: true, message: "Please enter city" }]}
          >
            <Input placeholder="e.g. Dubai" />
          </Form.Item>
          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: "Please select country" }]}
          >
            <Select placeholder="Select country">
              <Select.Option value="AE">United Arab Emirates</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[{ required: true, message: "Please enter phone number" }]}
        >
          <Input placeholder="e.g. +971-50-1234567" />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Address
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
