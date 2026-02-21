"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Modal,
  Form,
  Input,
  Select,
  Table,
  message,
  Tag,
  Space,
  Divider,
  Tooltip,
} from "antd";
import { Plus, Trash2, Edit2, Globe, Truck, DollarSign } from "lucide-react";
import {
  getShippingZones,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone,
  createShippingMethod,
  deleteShippingMethod,
  addShippingRate,
  deleteShippingRate,
} from "@/actions/shipping";
import { ShippingRateType } from "@prisma/client";
import { useCurrency } from "@/components/providers/currency-provider";

export default function ShippingSettings() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  // Editing State
  const [editingZone, setEditingZone] = useState<any>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

  const { currency } = useCurrency();

  const [formZone] = Form.useForm();
  const [formMethod] = Form.useForm();
  const [formRate] = Form.useForm();

  const fetchZones = async () => {
    setLoading(true);
    try {
      const data = await getShippingZones();
      setZones(data);
    } catch (error) {
      message.error("Failed to load shipping zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  // --- Zone Handlers ---

  const handleAddZone = () => {
    setEditingZone(null);
    formZone.resetFields();
    setIsZoneModalOpen(true);
  };

  const handleEditZone = (zone: any) => {
    setEditingZone(zone);
    formZone.setFieldsValue({
      name: zone.name,
      countries: zone.areas.map((a: any) => a.country), // Simplified for demo: multiple select of countries
    });
    setIsZoneModalOpen(true);
  };

  const handleZoneSubmit = async (values: any) => {
    try {
      // Transform simplistic country list to areas
      // For this UI, assume we just pick "Country" and State is "*" (All)
      const areas = values.countries.map((c: string) => ({
        country: c,
        state: "*",
      }));

      if (editingZone) {
        await updateShippingZone(editingZone.id, { name: values.name, areas });
        message.success("Zone updated");
      } else {
        await createShippingZone(values.name, areas);
        message.success("Zone created");
      }
      setIsZoneModalOpen(false);
      fetchZones();
    } catch (err) {
      message.error("Operation failed");
    }
  };

  const handleDeleteZone = async (id: string) => {
    try {
      await deleteShippingZone(id);
      message.success("Zone deleted");
      fetchZones();
    } catch (err) {
      message.error("Values failed");
    }
  };

  // --- Method Handlers ---

  const handleAddMethod = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    formMethod.resetFields();
    setIsMethodModalOpen(true);
  };

  const handleMethodSubmit = async (values: any) => {
    if (!selectedZoneId) return;
    try {
      // Generate a simpler code if user manual input not needed, but form has code
      await createShippingMethod(selectedZoneId, values);
      message.success("Method added");
      setIsMethodModalOpen(false);
      fetchZones();
    } catch (err) {
      message.error("Failed to add method. Code might be duplicate.");
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      await deleteShippingMethod(id);
      message.success("Method deleted");
      fetchZones();
    } catch (err) {
      message.error("Failed to delete method");
    }
  };

  // --- Rate Handlers ---

  const handleAddRate = (methodId: string) => {
    setSelectedMethodId(methodId);
    formRate.resetFields();
    formRate.setFieldValue("type", "FLAT");
    setIsRateModalOpen(true);
  };

  const handleRateSubmit = async (values: any) => {
    if (!selectedMethodId) return;
    try {
      await addShippingRate(selectedMethodId, {
        type: values.type,
        price: Number(values.price),
        min: values.min ? Number(values.min) : undefined,
        max: values.max ? Number(values.max) : undefined,
      });
      message.success("Rate added");
      setIsRateModalOpen(false);
      fetchZones();
    } catch (err) {
      message.error("Failed to add rate");
    }
  };

  const handleDeleteRate = async (id: string) => {
    try {
      await deleteShippingRate(id);
      message.success("Rate deleted");
      fetchZones();
    } catch (err) {
      message.error("Failed to delete rate");
    }
  };

  // --- Renderers ---

  const renderRates = (rates: any[]) => {
    if (!rates || rates.length === 0)
      return <span className="text-gray-400 text-xs">No rates configured</span>;

    return (
      <div className="space-y-1">
        {rates.map((rate) => (
          <div
            key={rate.id}
            className="flex items-center gap-2 text-sm bg-gray-50 px-2 py-1 rounded border border-gray-100"
          >
            <Tag color="blue" className="mr-0 scale-75 origin-left">
              {rate.type}
            </Tag>
            <span className="font-medium">
              {Number(rate.price).toFixed(2)} {currency}
            </span>
            {rate.type === "CONDITIONAL" && (
              <span className="text-gray-500 text-xs">
                (Orders {currency} {Number(rate.minOrderAmount)} - {currency}{" "}
                {Number(rate.maxOrderAmount) || "∞"})
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Shipping Zones</h2>
          <p className="text-gray-500 text-sm">
            Manage where you ship and how much it costs.
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
            <Card key={zone.id} className="shadow-sm border-gray-200">
              <div className="flex justify-between items-start mb-4 border-b border-gray-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-gray-400" />
                    <h3 className="font-bold text-base">{zone.name}</h3>
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    {zone.areas.length > 0
                      ? zone.areas.map((a: any) => a.country).join(", ")
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
                    className="border border-gray-200 rounded-md p-3"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Truck size={16} className="text-blue-500" />
                        <span className="font-medium">{method.name}</span>
                        <span className="text-xs text-gray-400  px-1 bg-gray-100 rounded">
                          {method.code}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="small"
                          type="text"
                          icon={<Plus size={14} />}
                          onClick={() => handleAddRate(method.id)}
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
                    <div className="pl-6">{renderRates(method.rates)}</div>
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

      {/* --- Modals --- */}

      {/* Zone Modal */}
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
              mode="tags"
              placeholder="Select countries (e.g. US, CA)"
              tokenSeparators={[","]}
              options={[
                { value: "AE", label: "United Arab Emirates" },
                // In a real app, load full country list
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Method Modal */}
      <Modal
        title="Add Shipping Method"
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
            <Input placeholder="e.g. standard_us" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="3-5 Business Days" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Rate Modal */}
      <Modal
        title="Add Shipping Rate"
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
              {/* <Select.Option value={ShippingRateType.WEIGHT}>Based on Weight</Select.Option> */}
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, current) => prev.type !== current.type}
          >
            {({ getFieldValue }) => (
              <>
                <Form.Item
                  name="price"
                  label="Cost"
                  rules={[{ required: true }]}
                >
                  <Input prefix="$" type="number" step="0.01" />
                </Form.Item>

                {getFieldValue("type") === ShippingRateType.CONDITIONAL && (
                  <div className="flex gap-4">
                    <Form.Item
                      name="min"
                      label="Min Order Amount"
                      className="flex-1"
                    >
                      <Input prefix="$" type="number" />
                    </Form.Item>
                    <Form.Item
                      name="max"
                      label="Max Order Amount"
                      className="flex-1"
                    >
                      <Input prefix="$" type="number" />
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
