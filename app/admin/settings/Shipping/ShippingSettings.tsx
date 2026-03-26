"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Tag,
  message,
} from "antd";
import { Edit2, Globe, Plus, Trash2, Truck } from "lucide-react";
import {
  addShippingRate,
  createShippingMethod,
  createShippingProfile,
  createShippingStarterPreset,
  createShippingZone,
  deleteShippingMethod,
  deleteShippingProfile,
  deleteShippingRate,
  deleteShippingZone,
  getShippingProfiles,
  getShippingZones,
  updateShippingMethod,
  updateShippingProfile,
  updateShippingRate,
  updateShippingZone,
} from "@/actions/shipping";
import { getMarkets } from "@/actions/market";
import {
  getCarrierOption,
  getCarrierServiceOptions,
  SHIPPING_CARRIER_OPTIONS,
  SHIPPING_STARTER_PLAYBOOKS,
} from "@/lib/shipping-carriers";
import {
  SHIPPING_METHOD_SOURCE,
  SHIPPING_RATE_APPLICATION,
  SHIPPING_RATE_TYPE,
} from "@/lib/shipping-constants";
import AdminMoney from "@/components/common/AdminMoney";
import { formatDeliveryEstimate } from "@/lib/shipping";

function formatRateSummary(rate: any) {
  if (rate.type === SHIPPING_RATE_TYPE.FLAT) {
    return "Flat price";
  }

  if (rate.type === SHIPPING_RATE_TYPE.WEIGHT) {
    return "Weight band";
  }

  if (rate.type === SHIPPING_RATE_TYPE.PRICE) {
    return "Order value band";
  }

  if (rate.type === SHIPPING_RATE_TYPE.CONDITIONAL) {
    return Number(rate.price) === 0 ? "Free shipping rule" : "Conditional rule";
  }

  return rate.type;
}

export default function ShippingSettings() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingPreset, setCreatingPreset] = useState<string | null>(null);
  const [marketOptions, setMarketOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [editingRate, setEditingRate] = useState<any>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [selectedRateZoneId, setSelectedRateZoneId] = useState<string | null>(
    null,
  );

  const [formZone] = Form.useForm();
  const [formMethod] = Form.useForm();
  const [formRate] = Form.useForm();
  const [formProfile] = Form.useForm();

  const fetchZones = async () => {
    setLoading(true);
    try {
      const data = await getShippingZones();
      setZones(data);
    } catch {
      message.error("Failed to load shipping zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setProfiles(await getShippingProfiles());
      } catch {
        message.error("Failed to load shipping profiles");
      }
    };

    fetchProfiles();
  }, []);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const markets = await getMarkets();
        setMarketOptions(
          markets
            .filter((market: any) => market.isActive)
            .map((market: any) => ({
              label: `${market.name} (${market.currencyCode})`,
              value: market.countryCode || market.code,
            })),
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchMarkets();
  }, []);

  const handleAddZone = () => {
    setEditingZone(null);
    formZone.resetFields();
    setIsZoneModalOpen(true);
  };

  const refreshProfiles = async () => {
    setProfiles(await getShippingProfiles());
  };

  const handleAddProfile = () => {
    setEditingProfile(null);
    formProfile.resetFields();
    formProfile.setFieldsValue({ handlingFee: 0, isDefault: false });
    setIsProfileModalOpen(true);
  };

  const handleEditProfile = (profile: any) => {
    setEditingProfile(profile);
    formProfile.setFieldsValue({
      ...profile,
      handlingFee: Number(profile.handlingFee || 0),
    });
    setIsProfileModalOpen(true);
  };

  const handleProfileSubmit = async (values: any) => {
    try {
      if (editingProfile) {
        await updateShippingProfile(editingProfile.id, values);
        message.success("Profile updated");
      } else {
        await createShippingProfile(values);
        message.success("Profile created");
      }

      setIsProfileModalOpen(false);
      await refreshProfiles();
    } catch {
      message.error("Failed to save shipping profile");
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      await deleteShippingProfile(id);
      message.success("Profile deleted");
      await refreshProfiles();
    } catch {
      message.error("Failed to delete profile");
    }
  };

  const handleEditZone = (zone: any) => {
    setEditingZone(zone);
    formZone.setFieldsValue({
      countries: zone.areas.map((area: any) => area.country),
      name: zone.name,
    });
    setIsZoneModalOpen(true);
  };

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

      setIsZoneModalOpen(false);
      fetchZones();
    } catch {
      message.error("Operation failed");
    }
  };

  const handleDeleteZone = async (id: string) => {
    try {
      await deleteShippingZone(id);
      message.success("Zone deleted");
      fetchZones();
    } catch {
      message.error("Failed to delete zone");
    }
  };

  const handleAddMethod = (zoneId: string) => {
    setEditingMethod(null);
    setSelectedZoneId(zoneId);
    formMethod.resetFields();
    formMethod.setFieldsValue({
      isActive: true,
      sortOrder: 0,
      sourceType: SHIPPING_METHOD_SOURCE.MANUAL,
    });
    setIsMethodModalOpen(true);
  };

  const handleCreateStarterPreset = async (preset: "gcc" | "india") => {
    try {
      setCreatingPreset(preset);
      const result = await createShippingStarterPreset(preset);
      await Promise.all([refreshProfiles(), fetchZones()]);
      message.success(
        `Starter setup added. ${result.createdZones} zone(s) and ${result.createdMethods} method(s) created.`,
      );
    } catch {
      message.error("Failed to create starter shipping setup");
    } finally {
      setCreatingPreset(null);
    }
  };

  const handleEditMethod = (method: any, zoneId: string) => {
    setEditingMethod(method);
    setSelectedZoneId(zoneId);
    formMethod.setFieldsValue({
      code: method.code,
      description: method.description,
      isActive: method.isActive,
      maxDeliveryDays: method.maxDeliveryDays,
      minDeliveryDays: method.minDeliveryDays,
      name: method.name,
      providerCode: method.providerCode,
      providerServiceCode: method.providerServiceCode,
      sortOrder: method.sortOrder || 0,
      sourceType: method.sourceType || SHIPPING_METHOD_SOURCE.MANUAL,
    });
    setIsMethodModalOpen(true);
  };

  const handleMethodSubmit = async (values: any) => {
    if (!selectedZoneId) {
      return;
    }

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

      setIsMethodModalOpen(false);
      fetchZones();
    } catch {
      message.error("Failed to save shipping method. Code might be duplicate.");
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      await deleteShippingMethod(id);
      message.success("Method deleted");
      fetchZones();
    } catch {
      message.error("Failed to delete method");
    }
  };

  const handleAddRate = (methodId: string, zoneId: string) => {
    setEditingRate(null);
    setSelectedMethodId(methodId);
    setSelectedRateZoneId(zoneId);
    formRate.resetFields();
    formRate.setFieldsValue({
      isActive: true,
      priority: 0,
      type: SHIPPING_RATE_TYPE.FLAT,
    });
    setIsRateModalOpen(true);
  };

  const handleEditRate = (rate: any, methodId: string, zoneId: string) => {
    setEditingRate(rate);
    setSelectedMethodId(methodId);
    setSelectedRateZoneId(zoneId);
    formRate.setFieldsValue({
      isActive: rate.isActive,
      max: rate.maxOrderAmount ? Number(rate.maxOrderAmount) : undefined,
      maxWeightGrams: rate.maxWeightGrams ?? undefined,
      min: rate.minOrderAmount ? Number(rate.minOrderAmount) : undefined,
      minWeightGrams: rate.minWeightGrams ?? undefined,
      price: Number(rate.price),
      priority: rate.priority || 0,
      applicationType: rate.applicationType || SHIPPING_RATE_APPLICATION.BASE,
      shippingProfileId: rate.shippingProfileId || undefined,
      type: rate.type,
    });
    setIsRateModalOpen(true);
  };

  const handleRateSubmit = async (values: any) => {
    if (!selectedMethodId || !selectedRateZoneId) {
      return;
    }

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
        zoneId: selectedRateZoneId,
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

      setIsRateModalOpen(false);
      fetchZones();
    } catch {
      message.error("Failed to save rate");
    }
  };

  const handleDeleteRate = async (id: string) => {
    try {
      await deleteShippingRate(id);
      message.success("Rate deleted");
      fetchZones();
    } catch {
      message.error("Failed to delete rate");
    }
  };

  const renderRates = (rates: any[], methodId: string, zoneId: string) => {
    const zoneRates = (rates || []).filter(
      (rate) => !rate.shippingZoneId || rate.shippingZoneId === zoneId,
    );

    if (zoneRates.length === 0) {
      return <span className="text-gray-400 text-xs">No rates configured</span>;
    }

    return (
      <div className="space-y-2">
        {zoneRates.map((rate) => (
          <div
            key={rate.id}
            className="rounded border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <Tag color="blue" className="mr-0">
                {rate.type}
              </Tag>
              {!rate.isActive && <Tag color="default">Inactive</Tag>}
              <span className="font-medium">{formatRateSummary(rate)}</span>
              {rate.applicationType === SHIPPING_RATE_APPLICATION.SURCHARGE && (
                <Tag color="gold">Surcharge</Tag>
              )}
              {rate.shippingProfile && (
                <Tag color="purple">{rate.shippingProfile.name}</Tag>
              )}
              <span className="ml-auto text-xs text-gray-500">
                Priority {rate.priority || 0}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
              <span>
                Price: <AdminMoney value={Number(rate.price)} />
              </span>
              {(rate.type === SHIPPING_RATE_TYPE.CONDITIONAL ||
                rate.type === SHIPPING_RATE_TYPE.PRICE) && (
                <span>
                  Range: <AdminMoney value={Number(rate.minOrderAmount || 0)} />{" "}
                  -{" "}
                  {rate.maxOrderAmount ? (
                    <AdminMoney value={Number(rate.maxOrderAmount)} />
                  ) : (
                    "∞"
                  )}
                </span>
              )}
              {(rate.minWeightGrams || rate.maxWeightGrams) && (
                <span>
                  Weight: {rate.minWeightGrams || 0}g -{" "}
                  {rate.maxWeightGrams || "∞"}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-1">
              <Button
                type="text"
                size="small"
                icon={<Edit2 size={12} />}
                onClick={() => handleEditRate(rate, methodId, zoneId)}
              >
                Edit
              </Button>
              <Button
                type="text"
                size="small"
                danger
                icon={<Trash2 size={12} />}
                onClick={() => handleDeleteRate(rate.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Quick Start</h2>
            <p className="text-sm text-gray-500">
              Start with a ready-made setup for GCC or India, then adjust rates
              and activate the methods you want to use.
            </p>
          </div>
          <Tag color="blue" className="mt-1">
            Carrier-ready
          </Tag>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {SHIPPING_STARTER_PLAYBOOKS.map((preset) => (
            <div
              key={preset.code}
              className="flex h-full flex-col justify-between rounded-xl border border-gray-200 bg-gray-50 p-5"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    {preset.title}
                  </h3>
                  <Tag color="default" className="mr-0">
                    {preset.code.toUpperCase()}
                  </Tag>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {preset.description}
                </p>
                <p className="mt-3 text-sm text-gray-500">{preset.focus}</p>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Providers
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {preset.providers
                      .map(
                        (providerCode) =>
                          getCarrierOption(providerCode)?.label || providerCode,
                      )
                      .join(", ")}
                  </div>
                </div>
                <Button
                  type="primary"
                  loading={creatingPreset === preset.code}
                  onClick={() =>
                    handleCreateStarterPreset(preset.code as "gcc" | "india")
                  }
                >
                  Use Preset
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <br />
      <Card className="border-gray-200 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Shipping Profiles</h2>
            <p className="text-sm text-gray-500">
              Keep product shipping logic simple. Assign products to profiles
              like Standard, Heavy, Fragile, or Express-only.
            </p>
          </div>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleAddProfile}
          >
            Add Profile
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{profile.name}</span>
                    {profile.isDefault && <Tag color="green">Default</Tag>}
                  </div>
                  <div className="text-xs text-gray-500">{profile.code}</div>
                  {profile.description && (
                    <div className="mt-1 text-sm text-gray-500">
                      {profile.description}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-600">
                    Handling fee:{" "}
                    <AdminMoney value={Number(profile.handlingFee || 0)} />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="text"
                    size="small"
                    icon={<Edit2 size={14} />}
                    onClick={() => handleEditProfile(profile)}
                  />
                  {!profile.isDefault && (
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<Trash2 size={14} />}
                      onClick={() => handleDeleteProfile(profile.id)}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <br />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Shipping Zones</h2>
          <p className="text-sm text-gray-500">
            Configure service levels per market, then add flat, free, or
            price-band rules for each one.
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={handleAddZone}
        >
          Add Zone
        </Button>
      </div>

      {loading && zones.length === 0 ? (
        <div className="p-8 text-center text-gray-400">Loading settings...</div>
      ) : zones.length === 0 ? (
        <Empty description="No shipping zones setup yet" />
      ) : (
        <div className="grid gap-6">
          {zones.map((zone) => (
            <Card key={zone.id} className="border-gray-200 shadow-sm">
              <div className="mb-4 flex items-start justify-between border-b border-gray-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-gray-400" />
                    <h3 className="text-base font-bold">{zone.name}</h3>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {zone.areas.length > 0
                      ? zone.areas.map((area: any) => area.country).join(", ")
                      : "No regions defined"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="small"
                    icon={<Edit2 size={14} />}
                    onClick={() => handleEditZone(zone)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    danger
                    icon={<Trash2 size={14} />}
                    onClick={() => handleDeleteZone(zone.id)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {zone.methods.map((method: any) => (
                  <div
                    key={method.id}
                    className="rounded-md border border-gray-200 p-3"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Truck size={16} className="text-blue-500" />
                          <span className="font-medium">{method.name}</span>
                          <span className="rounded bg-gray-100 px-1 text-xs text-gray-400">
                            {method.code}
                          </span>
                          {!method.isActive && (
                            <Tag color="default">Inactive</Tag>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                          <span>Sort order {method.sortOrder || 0}</span>
                          <span>
                            {method.sourceType === "CARRIER"
                              ? "Carrier linked"
                              : "Manual rules"}
                          </span>
                          {method.providerCode && (
                            <span>{method.providerCode}</span>
                          )}
                          {formatDeliveryEstimate(
                            method.minDeliveryDays,
                            method.maxDeliveryDays,
                          ) && (
                            <span>
                              ETA{" "}
                              {formatDeliveryEstimate(
                                method.minDeliveryDays,
                                method.maxDeliveryDays,
                              )}
                            </span>
                          )}
                        </div>
                        {method.description && (
                          <div className="mt-1 text-sm text-gray-500">
                            {method.description}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="small"
                          type="text"
                          icon={<Edit2 size={14} />}
                          onClick={() => handleEditMethod(method, zone.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          type="text"
                          icon={<Plus size={14} />}
                          onClick={() => handleAddRate(method.id, zone.id)}
                        >
                          Add Rate
                        </Button>
                        <Button
                          size="small"
                          type="text"
                          danger
                          icon={<Trash2 size={14} />}
                          onClick={() => handleDeleteMethod(method.id)}
                        />
                      </div>
                    </div>
                    <div className="pl-6">
                      {renderRates(method.rates, method.id, zone.id)}
                    </div>
                  </div>
                ))}

                <Button
                  type="dashed"
                  block
                  icon={<Plus size={14} />}
                  onClick={() => handleAddMethod(zone.id)}
                >
                  Add Shipping Method
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        title={
          editingProfile ? "Edit Shipping Profile" : "Create Shipping Profile"
        }
        open={isProfileModalOpen}
        onCancel={() => setIsProfileModalOpen(false)}
        onOk={formProfile.submit}
      >
        <Form
          form={formProfile}
          layout="vertical"
          onFinish={handleProfileSubmit}
        >
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

      <Modal
        title={editingZone ? "Edit Zone" : "Create Shipping Zone"}
        open={isZoneModalOpen}
        onCancel={() => setIsZoneModalOpen(false)}
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

      <Modal
        title={editingMethod ? "Edit Shipping Method" : "Add Shipping Method"}
        open={isMethodModalOpen}
        onCancel={() => setIsMethodModalOpen(false)}
        onOk={formMethod.submit}
      >
        <Form form={formMethod} layout="vertical" onFinish={handleMethodSubmit}>
          <Form.Item
            name="name"
            label="Method Name"
            rules={[{ required: true }]}
          >
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
                getFieldValue("sourceType") ===
                SHIPPING_METHOD_SOURCE.CARRIER ? (
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
                        const providerCode =
                          getMethodFieldValue("providerCode");
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

      <Modal
        title={editingRate ? "Edit Shipping Rate" : "Add Shipping Rate"}
        open={isRateModalOpen}
        onCancel={() => setIsRateModalOpen(false)}
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

              if (rateType === SHIPPING_RATE_TYPE.FLAT) {
                return null;
              }

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
    </div>
  );
}
