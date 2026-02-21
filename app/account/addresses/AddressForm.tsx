"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { addAddress, updateAddress } from "@/actions/addresses";
import { Button, Input, Form, message, Select } from "antd";

const AddressForm = ({
  onClose,
  initialValues,
}: {
  onClose: () => void;
  initialValues?: any;
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (values[key]) formData.append(key, values[key]);
    });

    try {
      if (initialValues?.id) {
        await updateAddress(initialValues.id, formData);
        message.success("Address updated successfully");
      } else {
        await addAddress(formData);
        message.success("Address added successfully");
      }
      onClose();
    } catch (error) {
      message.error("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true }]}
            className="mb-0"
          >
            <Input placeholder="e.g. Zaid Omer" />
          </Form.Item>
          <Form.Item
            name="addressType"
            label="Address Type"
            rules={[{ required: true }]}
            initialValue="HOME"
            className="mb-0"
          >
            <Select>
              <Select.Option value="HOME">Home</Select.Option>
              <Select.Option value="WORK">Work</Select.Option>
              <Select.Option value="OTHER">Other</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="address1"
          label="Address Line 1"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g. Deira, Dubai" />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="city" label="City" rules={[{ required: true }]}>
            <Input placeholder="e.g. Dubai" />
          </Form.Item>
          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. UAE" />
          </Form.Item>
        </div>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g. +971-50-1234567" />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="bg-blue-600"
          >
            Save Address
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddressForm;
