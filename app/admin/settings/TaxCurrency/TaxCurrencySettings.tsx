"use client";

import React, { useState } from "react";
import {
  Form,
  Button,
  Card,
  message,
  Select,
  InputNumber,
  Segmented,
  Divider,
  Row,
  Col,
  Alert,
} from "antd";
import { PercentIcon, DollarSign, Info } from "lucide-react";
import { updateSettings } from "@/actions/settings";
import { useCurrency } from "@/components/providers/currency-provider";

interface TaxCurrencySettingsProps {
  initialSettings: any;
}

const CURRENCIES = [
  { value: "AED", label: "AED — UAE Dirham (د.إ)" },
  { value: "USD", label: "USD — US Dollar ($)" },
  { value: "EUR", label: "EUR — Euro (€)" },
  { value: "GBP", label: "GBP — British Pound (£)" },
  { value: "INR", label: "INR — Indian Rupee (₹)" },
  { value: "SAR", label: "SAR — Saudi Riyal (ر.س)" },
  { value: "KWD", label: "KWD — Kuwaiti Dinar (د.ك)" },
  { value: "QAR", label: "QAR — Qatari Riyal (ر.ق)" },
  { value: "BHD", label: "BHD — Bahraini Dinar (.د.ب)" },
  { value: "OMR", label: "OMR — Omani Rial (ر.ع.)" },
];

export default function TaxCurrencySettings({
  initialSettings,
}: TaxCurrencySettingsProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { setCurrency } = useCurrency();
  const [taxMode, setTaxMode] = useState<string>(
    initialSettings?.taxMode || "EXCLUSIVE",
  );

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await updateSettings({
        currency: values.currency,
        taxRate: values.taxRate,
        taxMode: values.taxMode,
      });
      if (values.currency) setCurrency(values.currency);
      message.success("Currency & Tax settings saved");
    } catch {
      message.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Currency & Tax Settings"
      bordered={false}
      className="shadow-sm"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          currency: initialSettings?.currency || "USD",
          taxRate: initialSettings?.taxRate ?? 5,
          taxMode: initialSettings?.taxMode || "EXCLUSIVE",
        }}
      >
        {/* ── Currency ─────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <DollarSign size={16} className="text-blue-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">Currency</h3>
        </div>

        <Row gutter={24}>
          <Col span={24} md={{ span: 12 }}>
            <Form.Item
              name="currency"
              label="Store Currency"
              rules={[{ required: true, message: "Select a currency" }]}
              extra="All prices across the storefront will be displayed in this currency."
            >
              <Select
                size="large"
                showSearch
                optionFilterProp="label"
                options={CURRENCIES}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* ── Tax ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <PercentIcon size={16} className="text-amber-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">
            Tax Configuration
          </h3>
        </div>

        <Row gutter={24} className="mb-4">
          <Col span={24} md={{ span: 12 }}>
            <Form.Item
              name="taxMode"
              label="Tax Display Mode"
              extra={
                taxMode === "INCLUSIVE"
                  ? "Prices already include tax. The tax amount shown at checkout is extracted from the price."
                  : "Tax will be added on top of product prices at checkout."
              }
            >
              <Segmented
                block
                options={[
                  {
                    label: (
                      <div className="py-1">
                        <div className="font-semibold text-sm">
                          Tax Exclusive
                        </div>
                        <div className="text-xs text-gray-400">
                          Tax added at checkout
                        </div>
                      </div>
                    ),
                    value: "EXCLUSIVE",
                  },
                  {
                    label: (
                      <div className="py-1">
                        <div className="font-semibold text-sm">
                          Tax Inclusive
                        </div>
                        <div className="text-xs text-gray-400">
                          Tax included in price
                        </div>
                      </div>
                    ),
                    value: "INCLUSIVE",
                  },
                ]}
                onChange={(v) => {
                  setTaxMode(v as string);
                  form.setFieldValue("taxMode", v);
                }}
              />
            </Form.Item>
          </Col>

          <Col span={24} md={{ span: 12 }}>
            <Form.Item
              name="taxRate"
              label="Tax Rate (%)"
              rules={[
                { required: true, message: "Enter a tax rate" },
                { type: "number", min: 0, max: 100, message: "Must be 0–100" },
              ]}
              extra="Enter the percentage value, e.g. 5 for 5% VAT."
            >
              <InputNumber
                size="large"
                className="w-full"
                min={0}
                max={100}
                step={0.5}
                precision={2}
                addonAfter="%"
                placeholder="5"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Live preview */}
        <TaxPreview form={form} taxMode={taxMode} />

        <Divider />

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            className="bg-[#003d29]"
          >
            Save Currency & Tax
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

/** Shows a worked example based on current settings */
function TaxPreview({ form, taxMode }: { form: any; taxMode: string }) {
  const examplePrice = 100;
  const taxRate = Form.useWatch("taxRate", form) ?? 5;
  const rate = Number(taxRate) || 0;

  let gross: number;
  let taxAmount: number;
  let net: number;

  if (taxMode === "INCLUSIVE") {
    // Price already includes tax: net = gross / (1 + rate/100)
    gross = examplePrice;
    net = gross / (1 + rate / 100);
    taxAmount = gross - net;
  } else {
    // Tax added on top
    net = examplePrice;
    taxAmount = (net * rate) / 100;
    gross = net + taxAmount;
  }

  return (
    <Alert
      type="info"
      icon={<Info size={16} />}
      showIcon
      className="mb-4"
      message={
        <div className="text-sm">
          <span className="font-semibold">Preview — </span>
          {taxMode === "INCLUSIVE" ? (
            <>
              Product listed at <strong>{gross.toFixed(2)}</strong> → includes{" "}
              <strong>{taxAmount.toFixed(2)}</strong> tax ({rate}%) → net price{" "}
              <strong>{net.toFixed(2)}</strong>
            </>
          ) : (
            <>
              Product listed at <strong>{net.toFixed(2)}</strong> +{" "}
              <strong>{taxAmount.toFixed(2)}</strong> tax ({rate}%) ={" "}
              <strong>{gross.toFixed(2)}</strong> at checkout
            </>
          )}
        </div>
      }
    />
  );
}
