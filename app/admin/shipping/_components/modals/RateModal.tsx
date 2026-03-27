"use client";

import React, { useEffect } from "react";
import { Form, InputNumber, Modal, Select, Switch, Alert, message } from "antd";
import { addShippingRate, updateShippingRate } from "@/actions/shipping";
import {
  SHIPPING_RATE_APPLICATION,
  SHIPPING_RATE_TYPE,
} from "@/lib/shipping-constants";
import { useShipping } from "../ShippingProvider";

interface RateModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRate: any | null;
  selectedMethodId: string | null;
  selectedZoneId: string | null;
}

export default function RateModal({
  isOpen,
  onClose,
  editingRate,
  selectedMethodId,
  selectedZoneId,
}: RateModalProps) {
  const [formRate] = Form.useForm();
  const { fetchZones, profiles } = useShipping();

  useEffect(() => {
    if (isOpen) {
      if (editingRate) {
        formRate.setFieldsValue({
          isActive: editingRate.isActive,
          max: editingRate.maxOrderAmount
            ? Number(editingRate.maxOrderAmount)
            : undefined,
          maxWeightGrams: editingRate.maxWeightGrams ?? undefined,
          min: editingRate.minOrderAmount
            ? Number(editingRate.minOrderAmount)
            : undefined,
          minWeightGrams: editingRate.minWeightGrams ?? undefined,
          price: Number(editingRate.price),
          priority: editingRate.priority || 0,
          applicationType:
            editingRate.applicationType || SHIPPING_RATE_APPLICATION.BASE,
          shippingProfileId: editingRate.shippingProfileId || undefined,
          type: editingRate.type,
        });
      } else {
        formRate.resetFields();
        formRate.setFieldsValue({
          isActive: true,
          priority: 0,
          type: SHIPPING_RATE_TYPE.FLAT,
        });
      }
    }
  }, [isOpen, editingRate, formRate]);

  const handleRateSubmit = async (values: any) => {
    if (!selectedMethodId || !selectedZoneId) return;

    try {
      const basePayload = {
        max: values.max ?? undefined,
        maxWeightGrams: values.maxWeightGrams ?? undefined,
        min: values.min ?? undefined,
        minWeightGrams: values.minWeightGrams ?? undefined,
        price: Number(values.price),
        priority: values.priority ?? 0,
        applicationType: values.applicationType,
        shippingProfileId: values.shippingProfileId || null,
        zoneId: selectedZoneId,
      };

      if (editingRate) {
        await updateShippingRate(editingRate.id, {
          ...basePayload,
          isActive: values.isActive,
        });
        message.success("Rate updated");
      } else {
        await addShippingRate(selectedMethodId, {
          ...basePayload,
          type: values.type,
        });
        message.success("Rate added");
      }

      await fetchZones();
      onClose();
    } catch {
      message.error("Failed to save rate");
    }
  };

  return (
    <Modal
      title={editingRate ? "Edit Shipping Rate" : "Add Shipping Rate"}
      open={isOpen}
      onCancel={onClose}
      onOk={formRate.submit}
    >
      <Form form={formRate} layout="vertical" onFinish={handleRateSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item
            name="applicationType"
            label="Rule Use"
            initialValue={SHIPPING_RATE_APPLICATION.BASE}
          >
            <Select>
              <Select.Option value={SHIPPING_RATE_APPLICATION.BASE}>
                Base Shipping Rule
              </Select.Option>
              <Select.Option value={SHIPPING_RATE_APPLICATION.SURCHARGE}>
                Profile Surcharge
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="shippingProfileId" label="Applies To Profile">
            <Select
              allowClear
              placeholder="All profiles"
              options={profiles.map((profile) => ({
                label: profile.name,
                value: profile.id,
              }))}
            />
          </Form.Item>
        </div>

        <Form.Item name="type" label="Rate Type" rules={[{ required: true }]}>
          <Select>
            <Select.Option value={SHIPPING_RATE_TYPE.FLAT}>
              Flat amount
            </Select.Option>
            <Select.Option value={SHIPPING_RATE_TYPE.WEIGHT}>
              Weight band
            </Select.Option>
            <Select.Option value={SHIPPING_RATE_TYPE.CONDITIONAL}>
              Free or conditional rule
            </Select.Option>
            <Select.Option value={SHIPPING_RATE_TYPE.PRICE}>
              Order value band
            </Select.Option>
          </Select>
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} className="w-full" />
          </Form.Item>
          <Form.Item name="priority" label="Priority">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
        </div>

        <Form.Item
          noStyle
          shouldUpdate={(prev, current) => prev.type !== current.type}
        >
          {({ getFieldValue }) => {
            const rateType = getFieldValue("type");

            if (rateType === SHIPPING_RATE_TYPE.FLAT) return null;

            if (rateType === SHIPPING_RATE_TYPE.WEIGHT) {
              return (
                <Alert
                  className="mb-4"
                  showIcon
                  type="info"
                  message="Use weight bands for courier-style pricing"
                  description="For GCC and India setups, create one rule per parcel weight band and use the weight fields below."
                />
              );
            }

            return (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Form.Item name="min" label="Min Order Amount">
                  <InputNumber min={0} step={0.01} className="w-full" />
                </Form.Item>
                <Form.Item name="max" label="Max Order Amount">
                  <InputNumber min={0} step={0.01} className="w-full" />
                </Form.Item>
              </div>
            );
          }}
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item name="minWeightGrams" label="Min Weight (g)">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="maxWeightGrams" label="Max Weight (g)">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
        </div>

        {editingRate && (
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
