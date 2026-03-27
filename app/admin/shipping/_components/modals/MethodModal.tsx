"use client";

import React, { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Alert,
  message,
} from "antd";
import { createShippingMethod, updateShippingMethod } from "@/actions/shipping";
import {
  getCarrierOption,
  getCarrierServiceOptions,
  SHIPPING_CARRIER_OPTIONS,
} from "@/lib/shipping-carriers";
import { SHIPPING_METHOD_SOURCE } from "@/lib/shipping-constants";
import { useShipping } from "../ShippingProvider";

interface MethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMethod: any | null;
  selectedZoneId: string | null;
}

export default function MethodModal({
  isOpen,
  onClose,
  editingMethod,
  selectedZoneId,
}: MethodModalProps) {
  const [formMethod] = Form.useForm();
  const { fetchZones } = useShipping();

  useEffect(() => {
    if (isOpen) {
      if (editingMethod) {
        formMethod.setFieldsValue({
          code: editingMethod.code,
          description: editingMethod.description,
          isActive: editingMethod.isActive,
          maxDeliveryDays: editingMethod.maxDeliveryDays,
          minDeliveryDays: editingMethod.minDeliveryDays,
          name: editingMethod.name,
          providerCode: editingMethod.providerCode,
          providerServiceCode: editingMethod.providerServiceCode,
          sortOrder: editingMethod.sortOrder || 0,
          sourceType: editingMethod.sourceType || SHIPPING_METHOD_SOURCE.MANUAL,
        });
      } else {
        formMethod.resetFields();
        formMethod.setFieldsValue({
          isActive: true,
          sortOrder: 0,
          sourceType: SHIPPING_METHOD_SOURCE.MANUAL,
        });
      }
    }
  }, [isOpen, editingMethod, formMethod]);

  const handleMethodSubmit = async (values: any) => {
    if (!selectedZoneId) return;

    try {
      const basePayload = {
        code: values.code,
        description: values.description,
        maxDeliveryDays: values.maxDeliveryDays ?? null,
        minDeliveryDays: values.minDeliveryDays ?? null,
        name: values.name,
        providerCode:
          values.sourceType === SHIPPING_METHOD_SOURCE.CARRIER
            ? values.providerCode || null
            : null,
        providerServiceCode:
          values.sourceType === SHIPPING_METHOD_SOURCE.CARRIER
            ? values.providerServiceCode || null
            : null,
        sortOrder: values.sortOrder ?? 0,
        sourceType: values.sourceType || SHIPPING_METHOD_SOURCE.MANUAL,
      };

      if (editingMethod) {
        await updateShippingMethod(editingMethod.id, {
          ...basePayload,
          isActive: values.isActive,
        });
        message.success("Method updated");
      } else {
        await createShippingMethod(selectedZoneId, basePayload);
        message.success("Method added");
      }

      await fetchZones();
      onClose();
    } catch {
      message.error("Failed to save shipping method. Code might be duplicate.");
    }
  };

  return (
    <Modal
      title={editingMethod ? "Edit Shipping Method" : "Add Shipping Method"}
      open={isOpen}
      onCancel={onClose}
      onOk={formMethod.submit}
    >
      <Form form={formMethod} layout="vertical" onFinish={handleMethodSubmit}>
        <Form.Item name="name" label="Method Name" rules={[{ required: true }]}>
          <Input placeholder="e.g. Standard Shipping" />
        </Form.Item>
        <Form.Item
          name="code"
          label="Code (Unique)"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g. standard_gcc" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea placeholder="Visible helper text under the method name" />
        </Form.Item>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Form.Item
            name="sourceType"
            label="Source"
            initialValue={SHIPPING_METHOD_SOURCE.MANUAL}
          >
            <Select>
              <Select.Option value={SHIPPING_METHOD_SOURCE.MANUAL}>
                Manual Rules
              </Select.Option>
              <Select.Option value={SHIPPING_METHOD_SOURCE.CARRIER}>
                Carrier Integration
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, current) =>
              prev.sourceType !== current.sourceType
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("sourceType") === SHIPPING_METHOD_SOURCE.CARRIER ? (
                <>
                  <Form.Item name="providerCode" label="Carrier Provider">
                    <Select
                      options={SHIPPING_CARRIER_OPTIONS.filter(
                        (option) => option.code !== "manual",
                      ).map((option) => ({
                        label: option.label,
                        value: option.code,
                      }))}
                    />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, current) =>
                      prev.providerCode !== current.providerCode
                    }
                  >
                    {({ getFieldValue: getMethodFieldValue }) => {
                      const providerCode = getMethodFieldValue("providerCode");
                      const provider = getCarrierOption(providerCode);

                      return (
                        <>
                          <Form.Item
                            name="providerServiceCode"
                            label="Service Code"
                          >
                            <Select
                              options={getCarrierServiceOptions(
                                providerCode,
                              ).map((service) => ({
                                label: service,
                                value: service,
                              }))}
                            />
                          </Form.Item>
                          {provider && (
                            <Alert
                              className="mb-6"
                              showIcon
                              type="info"
                              message={`Recommended markets: ${provider.markets.join(", ")}`}
                              description={`Typical services: ${provider.services.join(", ") || "Connect your carrier mapping first."}`}
                            />
                          )}
                        </>
                      );
                    }}
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Form.Item name="sortOrder" label="Sort Order">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="minDeliveryDays" label="Min Delivery Days">
            <InputNumber min={1} className="w-full" />
          </Form.Item>
          <Form.Item name="maxDeliveryDays" label="Max Delivery Days">
            <InputNumber min={1} className="w-full" />
          </Form.Item>
        </div>
        {editingMethod && (
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
