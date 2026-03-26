"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Tag,
  Divider,
  Skeleton,
  Empty,
} from "antd";
import {
  Plus,
  Settings2,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getPaymentGateways,
  createPaymentGateway,
  updatePaymentGateway,
} from "@/actions/payment";
import { GatewayEnvironment } from "@prisma/client";

// ─── Gateway Definitions ─────────────────────────────────────────────────────

interface GatewayField {
  key: string;
  label: string;
  placeholder: string;
  secret?: boolean; // render as password input
  hint?: string;
}

interface GatewayDef {
  code: string;
  name: string;
  icon: React.ReactNode;
  color: string; // bg color class for icon wrapper
  description: string;
  docsUrl: string;
  fields: {
    live: GatewayField[];
    test: GatewayField[];
  };
}

const GATEWAYS: GatewayDef[] = [
  {
    code: "stripe",
    name: "Stripe",
    icon: (
      <img
        src="/images/brands/stripe.png"
        alt="Stripe"
        className="w-full h-full object-contain"
      />
    ),
    color: "bg-white border border-gray-200",
    description: "The world's most powerful payment platform.",
    docsUrl: "https://dashboard.stripe.com/apikeys",
    fields: {
      live: [
        {
          key: "publishableKey",
          label: "Publishable Key",
          placeholder: "pk_live_...",
          hint: "Starts with pk_live_",
        },
        {
          key: "secretKey",
          label: "Secret Key",
          placeholder: "sk_live_...",
          secret: true,
          hint: "Starts with sk_live_",
        },
        {
          key: "webhookSecret",
          label: "Webhook Secret",
          placeholder: "whsec_...",
          secret: true,
          hint: "From Stripe dashboard → Webhooks",
        },
      ],
      test: [
        {
          key: "publishableKey",
          label: "Publishable Key",
          placeholder: "pk_test_...",
          hint: "Starts with pk_test_",
        },
        {
          key: "secretKey",
          label: "Secret Key",
          placeholder: "sk_test_...",
          secret: true,
          hint: "Starts with sk_test_",
        },
        {
          key: "webhookSecret",
          label: "Webhook Secret",
          placeholder: "whsec_...",
          secret: true,
          hint: "From Stripe dashboard → Webhooks",
        },
      ],
    },
  },
  {
    code: "network_international",
    name: "Network International",
    icon: (
      <img
        src="/images/brands/network.png"
        alt="Network"
        className="w-full h-full object-contain"
      />
    ),
    color: "bg-white border border-gray-200",
    description: "Leading payment processor across MENA & Africa.",
    docsUrl: "https://developer.network.ae",
    fields: {
      live: [
        {
          key: "apiKey",
          label: "API Key",
          placeholder: "Live API Key",
          secret: true,
        },
        {
          key: "outletRef",
          label: "Outlet Reference",
          placeholder: "e.g. outlet_XXXXXX",
          hint: "Found in Network merchant dashboard",
        },
        {
          key: "merchantIdentifier",
          label: "Merchant Identifier",
          placeholder: "e.g. ACME_001",
        },
      ],
      test: [
        {
          key: "apiKey",
          label: "API Key",
          placeholder: "Test API Key",
          secret: true,
        },
        {
          key: "outletRef",
          label: "Outlet Reference",
          placeholder: "e.g. outlet_XXXXXX",
          hint: "Found in Network merchant dashboard",
        },
        {
          key: "merchantIdentifier",
          label: "Merchant Identifier",
          placeholder: "e.g. ACME_001",
        },
      ],
    },
  },
  {
    code: "razorpay",
    name: "Razorpay",
    icon: (
      <img
        src="/images/brands/razorpay.png"
        alt="Razorpay"
        className="w-full h-full object-contain"
      />
    ),
    color: "bg-white border border-gray-200",
    description: "India's leading full-stack payments solution.",
    docsUrl: "https://dashboard.razorpay.com/app/keys",
    fields: {
      live: [
        {
          key: "keyId",
          label: "Key ID",
          placeholder: "rzp_live_...",
          hint: "Starts with rzp_live_",
        },
        {
          key: "keySecret",
          label: "Key Secret",
          placeholder: "••••••••••••",
          secret: true,
        },
        {
          key: "webhookSecret",
          label: "Webhook Secret",
          placeholder: "••••••••••••",
          secret: true,
          hint: "From Razorpay dashboard → Webhooks",
        },
      ],
      test: [
        {
          key: "keyId",
          label: "Key ID",
          placeholder: "rzp_test_...",
          hint: "Starts with rzp_test_",
        },
        {
          key: "keySecret",
          label: "Key Secret",
          placeholder: "••••••••••••",
          secret: true,
        },
        {
          key: "webhookSecret",
          label: "Webhook Secret",
          placeholder: "••••••••••••",
          secret: true,
          hint: "From Razorpay dashboard → Webhooks",
        },
      ],
    },
  },
  {
    code: "phonepe",
    name: "PhonePe",
    icon: (
      <img
        src="/images/brands/phonepe.png"
        alt="PhonePe"
        className="w-full h-full object-contain"
      />
    ),
    color: "bg-white border border-gray-200",
    description: "India's most popular UPI-based payments gateway.",
    docsUrl: "https://developer.phonepe.com/v1/docs",
    fields: {
      live: [
        {
          key: "merchantId",
          label: "Merchant ID",
          placeholder: "e.g. MERCHANTUAT",
          hint: "Provided by PhonePe",
        },
        {
          key: "saltKey",
          label: "Salt Key",
          placeholder: "••••••••••••",
          secret: true,
        },
        {
          key: "saltIndex",
          label: "Salt Index",
          placeholder: "1",
          hint: "Usually 1",
        },
        {
          key: "callbackUrl",
          label: "Callback URL",
          placeholder: "https://yourstore.com/api/phonepe/callback",
          hint: "Where PhonePe sends payment notifications",
        },
      ],
      test: [
        {
          key: "merchantId",
          label: "Merchant ID",
          placeholder: "PGTESTPAYUAT",
          hint: "Use PGTESTPAYUAT for sandbox",
        },
        {
          key: "saltKey",
          label: "Salt Key",
          placeholder: "••••••••••••",
          secret: true,
        },
        {
          key: "saltIndex",
          label: "Salt Index",
          placeholder: "1",
          hint: "Usually 1",
        },
        {
          key: "callbackUrl",
          label: "Callback URL",
          placeholder: "https://yourstore.com/api/phonepe/callback",
        },
      ],
    },
  },
];

const GATEWAY_CODES = GATEWAYS.map((g) => g.code);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGatewayDef(code: string): GatewayDef | undefined {
  return GATEWAYS.find((g) => g.code === code);
}

function maskSecret(val: string): string {
  if (!val || val.length <= 8) return "••••••••";
  return val.slice(0, 6) + "••••••••" + val.slice(-4);
}

// ─── Config Fields Component ──────────────────────────────────────────────────

function ConfigFields({
  fields,
  existingConfig,
  maskedSecrets,
  requireSecrets,
}: {
  fields: GatewayField[];
  existingConfig?: Record<string, string>;
  maskedSecrets?: Record<string, string>;
  requireSecrets: boolean;
}) {
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-0">
      {fields.map((field) => (
        <Form.Item
          key={field.key}
          name={["config", field.key]}
          label={field.label}
          rules={[
            {
              required: field.secret ? requireSecrets : true,
              message: `${field.label} is required`,
            },
          ]}
          help={field.hint}
        >
          {field.secret ? (
            <div className="relative">
              <Input
                type={visible[field.key] ? "text" : "password"}
                placeholder={
                  maskedSecrets?.[field.key]
                    ? maskedSecrets[field.key]
                    : field.placeholder
                }
                suffix={
                  <button
                    type="button"
                    onClick={() =>
                      setVisible((v) => ({ ...v, [field.key]: !v[field.key] }))
                    }
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {visible[field.key] ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                  </button>
                }
              />
            </div>
          ) : (
            <Input placeholder={field.placeholder} />
          )}
        </Form.Item>
      ))}
    </div>
  );
}

// ─── Gateway Card ─────────────────────────────────────────────────────────────

function GatewayCard({
  gateway,
  onConfigure,
}: {
  gateway: any;
  onConfigure: (g: any) => void;
}) {
  const def = getGatewayDef(gateway.code);
  const isLive = gateway.environment === GatewayEnvironment.LIVE;

  return (
    <div className="border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-all hover:shadow-sm">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${def?.color ?? "bg-gray-100 text-gray-500"}`}
        >
          {def?.icon ?? <CreditCard size={20} />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-gray-900">
              {gateway.name ?? def?.name}
            </span>
            <Tag
              color={isLive ? "green" : "orange"}
              className="rounded-full text-xs"
            >
              {isLive ? "LIVE" : "TEST"}
            </Tag>
            {gateway.isActive ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                <CheckCircle2 size={12} /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-red-400 font-medium">
                <AlertCircle size={12} /> Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {def?.description ?? "Payment gateway"}
          </p>

          {/* Config preview */}
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
            {Object.entries({
              ...(gateway.config ?? {}),
              ...(gateway.maskedSecrets ?? {}),
            }).map(([k, v]: any) => {
              const fieldDef = [
                ...(def?.fields.live ?? []),
                ...(def?.fields.test ?? []),
              ].find((f) => f.key === k);
              return (
                <div key={k} className="flex items-center gap-1.5 min-w-0">
                  <span className="text-gray-400 shrink-0">
                    {fieldDef?.label ?? k}:
                  </span>
                  <span className="font-mono text-gray-600 truncate">
                    {String(v)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action */}
        <button
          type="button"
          onClick={() => onConfigure(gateway)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-1.5 transition-all cursor-pointer shrink-0"
        >
          <Settings2 size={14} /> Configure
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PaymentGateways() {
  const [gateways, setGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // Track selected gateway code + environment for dynamic fields
  const selectedCode = Form.useWatch("code", form);
  const selectedEnv = Form.useWatch("environment", form);

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const data = await getPaymentGateways();
      // Only show supported gateways
      setGateways(data.filter((g: any) => GATEWAY_CODES.includes(g.code)));
    } catch {
      message.error("Failed to load gateways");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const openAdd = () => {
    setEditingGateway(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (gateway: any) => {
    setEditingGateway(gateway);
    form.setFieldsValue({
      code: gateway.code,
      environment: gateway.environment,
      isActive: gateway.isActive,
      config: gateway.config ?? {},
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    const def = getGatewayDef(values.code);
    setSaving(true);
    try {
      const payload = {
        name: def?.name ?? values.code,
        code: values.code,
        environment: values.environment,
        isActive: values.isActive ?? true,
        config: values.config ?? {},
      };

      if (editingGateway) {
        await updatePaymentGateway(editingGateway.id, payload);
        message.success("Gateway updated");
      } else {
        await createPaymentGateway(payload);
        message.success("Gateway added");
      }
      setModalOpen(false);
      fetchGateways();
    } catch {
      message.error("Failed to save gateway");
    } finally {
      setSaving(false);
    }
  };

  // Configured gateway codes (only one record per gateway)
  const configuredCodes = gateways.map((g) => g.code);
  const availableToAdd = GATEWAYS.filter(
    (g) => !configuredCodes.includes(g.code),
  );

  const currentDef = getGatewayDef(selectedCode);
  const env: "live" | "test" =
    selectedEnv === GatewayEnvironment.LIVE ? "live" : "test";
  const dynamicFields = currentDef?.fields[env] ?? [];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Gateways
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Connect your payment providers. Configs are encrypted and stored
            securely.
          </p>
        </div>
        <Button
          icon={<Plus size={16} />}
          onClick={openAdd}
          disabled={availableToAdd.length === 0}
          className="flex items-center gap-1"
        >
          Add Gateway
        </Button>
      </div>

      {/* Supported gateways hint */}
      <div className="flex flex-wrap gap-2 mb-6">
        {GATEWAYS.map((g) => {
          const isConfigured = configuredCodes.includes(g.code);
          return (
            <div
              key={g.code}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                isConfigured
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-400"
              }`}
            >
              {isConfigured && <CheckCircle2 size={11} />}
              {g.name}
            </div>
          );
        })}
      </div>

      <Divider className="my-0 mb-6" />

      {/* Gateway Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} active paragraph={{ rows: 2 }} />
          ))}
        </div>
      ) : gateways.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-gray-500 text-sm">
              No gateways configured yet. Click <strong>Add Gateway</strong> to
              connect one.
            </span>
          }
        />
      ) : (
        <div className="space-y-3">
          {gateways.map((g) => (
            <GatewayCard key={g.id} gateway={g} onConfigure={openEdit} />
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            {currentDef && (
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${currentDef.color}`}
              >
                {currentDef.icon}
              </div>
            )}
            <span>
              {editingGateway
                ? `Configure ${currentDef?.name ?? "Gateway"}`
                : "Add Payment Gateway"}
            </span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={form.submit}
        okText={editingGateway ? "Save Changes" : "Add Gateway"}
        confirmLoading={saving}
        width={520}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            environment: GatewayEnvironment.TEST,
            isActive: true,
          }}
          className="mt-4"
        >
          {/* Gateway picker — locked when editing */}
          <Form.Item
            name="code"
            label="Payment Gateway"
            rules={[{ required: true, message: "Select a gateway" }]}
          >
            <Select
              placeholder="Select a gateway"
              disabled={!!editingGateway}
              optionLabelProp="label"
            >
              {(editingGateway ? GATEWAYS : availableToAdd).map((g) => (
                <Select.Option key={g.code} value={g.code} label={g.name}>
                  <div className="flex items-center gap-2 py-0.5">
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center ${g.color}`}
                    >
                      {g.icon}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{g.name}</div>
                      <div className="text-xs text-gray-400">
                        {g.description}
                      </div>
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Environment */}
          <Form.Item
            name="environment"
            label="Environment"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value={GatewayEnvironment.TEST}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                  Test / Sandbox
                </div>
              </Select.Option>
              <Select.Option value={GatewayEnvironment.LIVE}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Live / Production
                </div>
              </Select.Option>
            </Select>
          </Form.Item>

          {/* Gateway-specific config fields */}
          {currentDef && dynamicFields.length > 0 && (
            <>
              <Divider orientation={"left" as any}>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  {currentDef.name} Credentials
                </span>
              </Divider>

              {/* Docs link */}
              <p className="text-xs text-gray-400 mb-4">
                Find your keys in the{" "}
                <a
                  href={currentDef.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {currentDef.name} dashboard ↗
                </a>
              </p>

              <ConfigFields
                fields={dynamicFields}
                existingConfig={editingGateway?.config}
                maskedSecrets={editingGateway?.maskedSecrets}
                requireSecrets={!editingGateway}
              />
            </>
          )}

          {/* Active toggle */}
          <Divider className="my-3" />
          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
            className="mb-0"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
