"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Empty, Form, Input, Modal, Select, Tag, message } from "antd";
import { Edit2, Globe, Plus, Trash2, Truck } from "lucide-react";
import {
  addShippingRate,
  createShippingMethod,
  createShippingZone,
  deleteShippingMethod,
  deleteShippingRate,
  deleteShippingZone,
  getShippingZones,
  updateShippingZone,
} from "@/actions/shipping";
import { getMarkets } from "@/actions/market";
import { ShippingRateType } from "@prisma/client";
import AdminMoney from "@/components/common/AdminMoney";

export default function ShippingSettings() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [marketOptions, setMarketOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  const [editingZone, setEditingZone] = useState<any>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [selectedRateZoneId, setSelectedRateZoneId] = useState<string | null>(
    null,
  );

  const [formZone] = Form.useForm();
  const [formMethod] = Form.useForm();
  const [formRate] = Form.useForm();

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
    setSelectedZoneId(zoneId);
    formMethod.resetFields();
    setIsMethodModalOpen(true);
  };

  const handleMethodSubmit = async (values: any) => {
    if (!selectedZoneId) {
      return;
    }

    try {
      await createShippingMethod(selectedZoneId, values);
      message.success("Method added");
      setIsMethodModalOpen(false);
      fetchZones();
    } catch {
      message.error("Failed to add method. Code might be duplicate.");
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
    setSelectedMethodId(methodId);
    setSelectedRateZoneId(zoneId);
    formRate.resetFields();
    formRate.setFieldValue("type", ShippingRateType.FLAT);
    setIsRateModalOpen(true);
  };

  const handleRateSubmit = async (values: any) => {
    if (!selectedMethodId || !selectedRateZoneId) {
      return;
    }

    try {
      await addShippingRate(selectedMethodId, {
        max: values.max ? Number(values.max) : undefined,
        min: values.min ? Number(values.min) : undefined,
        price: Number(values.price),
        type: values.type,
        zoneId: selectedRateZoneId,
      });
      message.success("Rate added");
      setIsRateModalOpen(false);
      fetchZones();
    } catch {
      message.error("Failed to add rate");
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

  const renderRates = (rates: any[], zoneId: string) => {
    const zoneRates = (rates || []).filter(
      (rate) => !rate.shippingZoneId || rate.shippingZoneId === zoneId,
    );

    if (zoneRates.length === 0) {
      return <span className="text-gray-400 text-xs">No rates configured</span>;
    }

    return (
      <div className="space-y-1">
        {zoneRates.map((rate) => (
          <div
            key={rate.id}
            className="flex items-center gap-2 rounded border border-gray-100 bg-gray-50 px-2 py-1 text-sm"
          >
            <Tag color="blue" className="mr-0 origin-left scale-75">
              {rate.type}
            </Tag>
            <span className="font-medium">
              <AdminMoney value={Number(rate.price)} />
            </span>
            {rate.type === "CONDITIONAL" && (
              <span className="text-xs text-gray-500">
                (Orders <AdminMoney value={Number(rate.minOrderAmount || 0)} /> -{" "}
                {rate.maxOrderAmount ? (
                  <AdminMoney value={Number(rate.maxOrderAmount)} />
                ) : (
                  "∞"
                )}
                )
              </span>
            )}
            <Button
              type="text"
              size="small"
              danger
              icon={<Trash2 size={12} />}
              className="ml-auto"
              onClick={() => handleDeleteRate(rate.id)}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Shipping Zones</h2>
          <p className="text-sm text-gray-500">
            Manage where you ship and how much it costs.
          </p>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={handleAddZone}>
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
                  <div key={method.id} className="rounded-md border border-gray-200 p-3">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Truck size={16} className="text-blue-500" />
                        <span className="font-medium">{method.name}</span>
                        <span className="rounded bg-gray-100 px-1 text-xs text-gray-400">
                          {method.code}
                        </span>
                      </div>
                      <div className="flex gap-1">
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
                    <div className="pl-6">{renderRates(method.rates, zone.id)}</div>
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
        title={editingZone ? "Edit Zone" : "Create Shipping Zone"}
        open={isZoneModalOpen}
        onCancel={() => setIsZoneModalOpen(false)}
        onOk={formZone.submit}
      >
        <Form form={formZone} layout="vertical" onFinish={handleZoneSubmit}>
          <Form.Item name="name" label="Zone Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Domestic, North America" />
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
        title="Add Shipping Method"
        open={isMethodModalOpen}
        onCancel={() => setIsMethodModalOpen(false)}
        onOk={formMethod.submit}
      >
        <Form form={formMethod} layout="vertical" onFinish={handleMethodSubmit}>
          <Form.Item name="name" label="Method Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Standard Shipping" />
          </Form.Item>
          <Form.Item name="code" label="Code (Unique)" rules={[{ required: true }]}>
            <Input placeholder="e.g. standard_us" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="3-5 Business Days" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span className="text-2xl">Add Shipping Rate</span>}
        open={isRateModalOpen}
        onCancel={() => setIsRateModalOpen(false)}
        onOk={formRate.submit}
      >
        <Form form={formRate} layout="vertical" onFinish={handleRateSubmit}>
          <Form.Item name="type" label="Rate Type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={ShippingRateType.FLAT}>
                Flat Amount
              </Select.Option>
              <Select.Option value={ShippingRateType.CONDITIONAL}>
                Conditional (Free over amount)
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, current) => prev.type !== current.type}>
            {({ getFieldValue }) => (
              <>
                <Form.Item name="price" label="Cost" rules={[{ required: true }]}>
                  <Input addonBefore="Amount" type="number" step="0.01" />
                </Form.Item>

                {getFieldValue("type") === ShippingRateType.CONDITIONAL && (
                  <div className="flex gap-4">
                    <Form.Item
                      name="min"
                      label="Min Order Amount"
                      className="flex-1"
                    >
                      <Input addonBefore="Amount" type="number" />
                    </Form.Item>
                    <Form.Item
                      name="max"
                      label="Max Order Amount"
                      className="flex-1"
                    >
                      <Input addonBefore="Amount" type="number" />
                    </Form.Item>
                  </div>
                )}
              </>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
