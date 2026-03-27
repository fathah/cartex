"use client";

import React, { useEffect } from "react";
import { Form, Input, Modal, Select, message } from "antd";
import { createShippingZone, updateShippingZone } from "@/actions/shipping";
import { useShipping } from "../ShippingProvider";

interface ZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingZone: any | null;
}

export default function ZoneModal({
  isOpen,
  onClose,
  editingZone,
}: ZoneModalProps) {
  const [formZone] = Form.useForm();
  const { marketOptions, fetchZones } = useShipping();

  useEffect(() => {
    if (isOpen) {
      if (editingZone) {
        formZone.setFieldsValue({
          countries: editingZone.areas.map((area: any) => area.country),
          name: editingZone.name,
        });
      } else {
        formZone.resetFields();
      }
    }
  }, [isOpen, editingZone, formZone]);

  const handleZoneSubmit = async (values: any) => {
    try {
      const areas = values.countries.map((country: string) => ({
        country,
        state: "*",
      }));

      if (editingZone) {
        await updateShippingZone(editingZone.id, { areas, name: values.name });
        message.success("Zone updated");
      } else {
        await createShippingZone(values.name, areas);
        message.success("Zone created");
      }

      await fetchZones();
      onClose();
    } catch {
      message.error("Operation failed");
    }
  };

  return (
    <Modal
      title={editingZone ? "Edit Zone" : "Create Shipping Zone"}
      open={isOpen}
      onCancel={onClose}
      onOk={formZone.submit}
    >
      <Form form={formZone} layout="vertical" onFinish={handleZoneSubmit}>
        <Form.Item name="name" label="Zone Name" rules={[{ required: true }]}>
          <Input placeholder="e.g. GCC, Domestic, Europe" />
        </Form.Item>
        <Form.Item
          name="countries"
          label="Countries"
          rules={[{ required: true }]}
        >
          <Select
            mode="multiple"
            placeholder="Select available markets"
            options={marketOptions}
            loading={marketOptions.length === 0}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
