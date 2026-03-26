"use client";

import React, { useState } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Tag,
  Space,
  message,
  Popconfirm,
  Select,
  Typography,
  Switch,
} from "antd";
import { Plus, Trash2, Edit } from "lucide-react";
import {
  addOption,
  updateOption,
  deleteOption,
  updateVariant,
  deleteVariant,
} from "@/actions/product";
import { getMarkets } from "@/actions/market";
import AdminMoney from "@/components/common/AdminMoney";

interface VariantManagerProps {
  productId: string;
  options: any[];
  variants: any[];
  onRefresh?: () => void | Promise<void>;
}

type OptionFormValues = {
  name: string;
  values: string[];
};

export default function VariantManager({
  productId,
  options,
  variants,
  onRefresh,
}: VariantManagerProps) {
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [isEditVariantModalOpen, setIsEditVariantModalOpen] = useState(false);
  const [savingOption, setSavingOption] = useState(false);
  const [savingVariant, setSavingVariant] = useState(false);
  const [deletingOptionId, setDeletingOptionId] = useState<string | null>(null);
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(null);
  const [bulkDeletingVariants, setBulkDeletingVariants] = useState(false);
  const [editingOption, setEditingOption] = useState<any | null>(null);
  const [currentVariant, setCurrentVariant] = useState<any>(null);
  const [selectedVariantIds, setSelectedVariantIds] = useState<React.Key[]>([]);
  const [optionForm] = Form.useForm<OptionFormValues>();
  const [variantForm] = Form.useForm();
  const [markets, setMarkets] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const data = await getMarkets();
        setMarkets(data.filter((market: any) => market.isActive));
      } catch (error) {
        console.error(error);
      }
    };

    fetchMarkets();
  }, []);

  const closeOptionModal = () => {
    setIsOptionModalOpen(false);
    setEditingOption(null);
    optionForm.resetFields();
  };

  const openCreateOptionModal = () => {
    setEditingOption(null);
    optionForm.setFieldsValue({ name: "", values: [] });
    setIsOptionModalOpen(true);
  };

  const openEditOptionModal = (option: any) => {
    setEditingOption(option);
    optionForm.setFieldsValue({
      name: option.name,
      values: option.values.map((value: any) => value.value),
    });
    setIsOptionModalOpen(true);
  };

  const refresh = async () => {
    await onRefresh?.();
    setSelectedVariantIds([]);
  };

  const normalizeValues = (values: string[]) =>
    Array.from(
      new Map(
        (values || [])
          .map((value) => value.trim())
          .filter(Boolean)
          .map((value) => [value.toLowerCase(), value]),
      ).values(),
    );

  const handleSaveOption = async (values: OptionFormValues) => {
    const normalizedValues = normalizeValues(values.values);
    if (normalizedValues.length === 0) {
      message.error("Add at least one option value");
      return;
    }

    setSavingOption(true);
    try {
      if (editingOption) {
        await updateOption(productId, editingOption.id, values.name.trim(), normalizedValues);
        message.success("Option updated");
      } else {
        await addOption(productId, values.name.trim(), normalizedValues);
        message.success("Option added");
      }
      closeOptionModal();
      await refresh();
    } catch (error) {
      console.error(error);
      message.error("Failed to save option");
    } finally {
      setSavingOption(false);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    setDeletingOptionId(optionId);
    try {
      await deleteOption(productId, optionId);
      message.success("Option deleted");
      await refresh();
    } catch (error) {
      console.error(error);
      message.error("Failed to delete option");
    } finally {
      setDeletingOptionId(null);
    }
  };

  const openEditVariantModal = (variant: any) => {
    setCurrentVariant(variant);
    const marketPrices = markets.map((market) => {
      const existing = (variant.variantMarkets || []).find(
        (entry: any) => entry.marketId === market.id,
      );
      return {
        marketId: market.id,
        marketName: market.name,
        currencyCode: market.currencyCode,
        salePrice: Number(existing?.salePrice ?? variant.salePrice ?? 0),
        compareAtPrice:
          existing?.compareAtPrice !== null &&
          existing?.compareAtPrice !== undefined
            ? Number(existing.compareAtPrice)
            : null,
        costPrice:
          existing?.costPrice !== null && existing?.costPrice !== undefined
            ? Number(existing.costPrice)
            : null,
        inventoryQuantity:
          existing?.inventoryQuantity !== null &&
          existing?.inventoryQuantity !== undefined
            ? Number(existing.inventoryQuantity)
            : 0,
        isAvailable: existing?.isAvailable ?? true,
        isPublished: existing?.isPublished ?? true,
        minOrderQty:
          existing?.minOrderQty !== null && existing?.minOrderQty !== undefined
            ? Number(existing.minOrderQty)
            : 1,
        maxOrderQty:
          existing?.maxOrderQty !== null && existing?.maxOrderQty !== undefined
            ? Number(existing.maxOrderQty)
            : null,
      };
    });
    variantForm.setFieldsValue({
      salePrice: Number(variant.salePrice),
      compareAtPrice:
        variant.compareAtPrice !== null && variant.compareAtPrice !== undefined
          ? Number(variant.compareAtPrice)
          : null,
      costPrice:
        variant.costPrice !== null && variant.costPrice !== undefined
          ? Number(variant.costPrice)
          : null,
      requiresShipping: variant.requiresShipping ?? true,
      weightGrams: Number(variant.weightGrams || 0),
      lengthCm:
        variant.lengthCm !== null && variant.lengthCm !== undefined
          ? Number(variant.lengthCm)
          : null,
      widthCm:
        variant.widthCm !== null && variant.widthCm !== undefined
          ? Number(variant.widthCm)
          : null,
      heightCm:
        variant.heightCm !== null && variant.heightCm !== undefined
          ? Number(variant.heightCm)
          : null,
      sku: variant.sku,
      inventory: variant.inventory?.quantity || 0,
      marketPrices,
    });
    setIsEditVariantModalOpen(true);
  };

  const handleEditVariant = async (values: any) => {
    setSavingVariant(true);
    try {
      await updateVariant(currentVariant.id, values);
      message.success("Variant updated");
      setIsEditVariantModalOpen(false);
      setCurrentVariant(null);
      await refresh();
    } catch (error) {
      console.error(error);
      message.error("Failed to update variant");
    } finally {
      setSavingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    setDeletingVariantId(variantId);
    try {
      await deleteVariant(variantId);
      message.success("Variant deleted");
      await refresh();
    } catch (error: any) {
      console.error(error);
      message.error(error?.message || "Failed to delete variant");
    } finally {
      setDeletingVariantId(null);
    }
  };

  const handleBulkDeleteVariants = async () => {
    if (selectedVariantIds.length === 0) {
      return;
    }

    if (variants.length - selectedVariantIds.length < 1) {
      message.error("A product must keep at least one active variant");
      return;
    }

    setBulkDeletingVariants(true);
    try {
      for (const variantId of selectedVariantIds) {
        await deleteVariant(String(variantId));
      }
      message.success(`${selectedVariantIds.length} variants deleted`);
      await refresh();
    } catch (error: any) {
      console.error(error);
      message.error(error?.message || "Failed to delete selected variants");
    } finally {
      setBulkDeletingVariants(false);
    }
  };

  const variantColumns = [
    { title: "Variant", dataIndex: "title", key: "title" },
    {
      title: "Options",
      key: "selectedOptions",
      render: (_: any, record: any) => (
        <Space wrap>
          {record.selectedOptions?.length > 0 ? (
            record.selectedOptions.map((option: any) => (
              <Tag key={option.id}>{option.value}</Tag>
            ))
          ) : (
            <Tag>Default</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Sale Price",
      dataIndex: "salePrice",
      key: "salePrice",
      render: (value: any) => <AdminMoney value={value} />,
    },
    {
      title: "Market Pricing",
      key: "marketPricing",
      render: (_: any, record: any) => (
        <Space wrap>
          {(record.variantMarkets || []).length > 0 ? (
            record.variantMarkets.map((entry: any) => (
              <Tag
                key={entry.id}
                color={entry.isAvailable ? "blue" : "default"}
              >
                {entry.market?.code || entry.marketId}:{" "}
                {entry.isAvailable ? (
                  <AdminMoney
                    value={entry.salePrice}
                    currencyCode={entry.market?.currencyCode}
                  />
                ) : (
                  "N/A"
                )}
              </Tag>
            ))
          ) : (
            <Tag>Not configured</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Shipment",
      key: "shipment",
      render: (_: any, record: any) =>
        record.requiresShipping ? (
          <Space wrap>
            <Tag color="blue">{Number(record.weightGrams || 0)} g</Tag>
            {(record.lengthCm || record.widthCm || record.heightCm) && (
              <Tag>
                {record.lengthCm || 0}x{record.widthCm || 0}x{record.heightCm || 0} cm
              </Tag>
            )}
          </Space>
        ) : (
          <Tag>Digital / No Shipping</Tag>
        ),
    },
    {
      title: "Inventory",
      key: "inventory",
      render: (_: any, record: any) => (
        <Space wrap>
          {(record.variantMarkets || []).length > 0 ? (
            record.variantMarkets.map((entry: any) => (
              <Tag key={entry.id}>
                {entry.market?.code || entry.marketId}: {entry.inventoryQuantity ?? 0}
              </Tag>
            ))
          ) : (
            <Tag>{record.inventory?.quantity || 0}</Tag>
          )}
        </Space>
      ),
    },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<Edit size={16} />}
            size="small"
            onClick={() => openEditVariantModal(record)}
          />
          <Popconfirm
            title="Delete this variant?"
            description="This removes the variant from the active catalog."
            onConfirm={() => handleDeleteVariant(record.id)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button
              danger
              size="small"
              icon={<Trash2 size={16} />}
              loading={deletingVariantId === record.id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" className="w-full" size="large">
      <Card
        title="Options"
        extra={
          <Button onClick={openCreateOptionModal} icon={<Plus size={16} />}>
            Add Option
          </Button>
        }
      >
        <div className="mb-4 text-sm text-gray-500">
          Option groups define the variant matrix. Editing values updates valid
          combinations and retires invalid ones.
        </div>

        {options.length === 0 ? (
          <div className="text-gray-500">No options added.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {options.map((option) => (
              <div
                key={option.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">{option.name}</div>
                    <Typography.Text type="secondary">
                      {option.values.length} values
                    </Typography.Text>
                  </div>
                  <Space>
                    <Button
                      size="small"
                      icon={<Edit size={16} />}
                      onClick={() => openEditOptionModal(option)}
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title={`Delete ${option.name}?`}
                      description="This will remove related variant combinations that depend on it."
                      onConfirm={() => handleDeleteOption(option.id)}
                      okText="Delete"
                      cancelText="Cancel"
                    >
                      <Button
                        danger
                        size="small"
                        icon={<Trash2 size={16} />}
                        loading={deletingOptionId === option.id}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>
                <Space wrap>
                  {option.values.map((value: any) => (
                    <Tag key={value.id}>{value.value}</Tag>
                  ))}
                </Space>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        title="Variants"
        extra={
          <Space>
            {selectedVariantIds.length > 0 && (
              <Typography.Text type="secondary">
                {selectedVariantIds.length} selected
              </Typography.Text>
            )}
            <Popconfirm
              title="Delete selected variants?"
              description="Selected variants will be removed from the active catalog."
              onConfirm={handleBulkDeleteVariants}
              okText="Delete"
              cancelText="Cancel"
              disabled={selectedVariantIds.length === 0}
            >
              <Button
                danger
                icon={<Trash2 size={16} />}
                disabled={selectedVariantIds.length === 0}
                loading={bulkDeletingVariants}
              >
                Delete Selected
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        <Table
          dataSource={variants}
          columns={variantColumns}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedVariantIds,
            onChange: (keys) => setSelectedVariantIds(keys),
          }}
          pagination={false}
          size="small"
          locale={{ emptyText: "No variants available" }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        title={editingOption ? `Edit ${editingOption.name}` : "Add Option"}
        open={isOptionModalOpen}
        onCancel={closeOptionModal}
        footer={null}
        destroyOnClose
      >
        <Form form={optionForm} onFinish={handleSaveOption} layout="vertical">
          <Form.Item
            name="name"
            label="Option Name"
            rules={[{ required: true, message: "Option name is required" }]}
          >
            <Input placeholder="Size, Color, Material, Pack Size" />
          </Form.Item>

          <Form.Item
            name="values"
            label="Values"
            rules={[
              {
                validator: async (_, values) => {
                  if (!normalizeValues(values || []).length) {
                    throw new Error("Add at least one option value");
                  }
                },
              },
            ]}
            extra="Press Enter after each value. Duplicates are merged automatically."
          >
            <Select
              mode="tags"
              tokenSeparators={[","]}
              placeholder="Add values like Small, Medium, Large"
              open={false}
            />
          </Form.Item>

          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={closeOptionModal}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={savingOption}>
              {editingOption ? "Save Option" : "Add Option"}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={`Edit Variant: ${currentVariant?.title || ""}`}
        open={isEditVariantModalOpen}
        onCancel={() => setIsEditVariantModalOpen(false)}
        footer={null}
        destroyOnClose
        width={1200}
      >
        <Form form={variantForm} onFinish={handleEditVariant} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Form.Item
              name="salePrice"
              label="Base Sale Price"
              rules={[{ required: true, message: "Sale price is required" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                precision={2}
              />
            </Form.Item>

            <Form.Item name="compareAtPrice" label="Base Compare At Price">
              <InputNumber style={{ width: "100%" }} min={0} precision={2} />
            </Form.Item>

            <Form.Item name="costPrice" label="Base Cost Price">
              <InputNumber style={{ width: "100%" }} min={0} precision={2} />
            </Form.Item>

            <Form.Item
              name="inventory"
              label="Inventory Quantity"
              rules={[{ required: true, message: "Inventory is required" }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item name="sku" label="SKU">
              <Input placeholder="PROD-001" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Form.Item
              name="requiresShipping"
              label="Requires Shipping"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item name="weightGrams" label="Weight (g)">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item name="lengthCm" label="Length (cm)">
              <InputNumber style={{ width: "100%" }} min={0} precision={2} />
            </Form.Item>

            <Form.Item name="widthCm" label="Width (cm)">
              <InputNumber style={{ width: "100%" }} min={0} precision={2} />
            </Form.Item>

            <Form.Item name="heightCm" label="Height (cm)">
              <InputNumber style={{ width: "100%" }} min={0} precision={2} />
            </Form.Item>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
              <Typography.Text strong>Market Prices</Typography.Text>
              <div className="text-xs text-gray-500">
                Each market controls availability and sell price independently.
              </div>
              </div>
              <div className="text-xs text-gray-400">
                Scroll horizontally for all market columns
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[1080px]">
                <div className="grid grid-cols-[180px_100px_100px_100px_130px_140px_140px_140px_120px_120px] gap-3 px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200">
                  <div>Market</div>
                  <div>Visible</div>
                  <div>Available</div>
                  <div>Stock</div>
                  <div>Sale</div>
                  <div>Compare At</div>
                  <div>Cost</div>
                  <div>Min Qty</div>
                  <div>Max Qty</div>
                </div>

                <div className="space-y-3 pt-3">
              {markets.map((market, index) => (
                <div
                  key={market.id}
                  className="grid grid-cols-[180px_100px_100px_100px_130px_140px_140px_140px_120px_120px] gap-3 items-start rounded-lg border border-gray-100 p-3"
                >
                  <div>
                    <div className="font-medium">{market.name}</div>
                    <div className="text-xs text-gray-500">
                      {market.code} • {market.currencyCode}
                    </div>
                  </div>

                  <div className="pt-1">
                    <Form.Item
                      name={["marketPrices", index, "isPublished"]}
                      valuePropName="checked"
                      className="mb-0"
                    >
                        <Switch size="small" />
                      </Form.Item>
                  </div>

                  <div className="pt-1">
                    <Form.Item
                      name={["marketPrices", index, "isAvailable"]}
                      valuePropName="checked"
                      className="mb-0"
                    >
                      <Switch size="small" />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name={["marketPrices", index, "marketId"]}
                    hidden
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name={["marketPrices", index, "inventoryQuantity"]}
                    className="mb-0"
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                    />
                  </Form.Item>

                  <Form.Item
                    name={["marketPrices", index, "salePrice"]}
                    className="mb-0"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      precision={2}
                      addonAfter={market.currencyCode}
                    />
                  </Form.Item>

                  <Form.Item
                    name={["marketPrices", index, "compareAtPrice"]}
                    className="mb-0"
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      precision={2}
                      addonAfter={market.currencyCode}
                    />
                  </Form.Item>

                  <Form.Item
                    name={["marketPrices", index, "costPrice"]}
                    className="mb-0"
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      precision={2}
                      addonAfter={market.currencyCode}
                    />
                  </Form.Item>

                  <Form.Item
                    name={["marketPrices", index, "minOrderQty"]}
                    className="mb-0"
                  >
                    <InputNumber style={{ width: "100%" }} min={1} />
                  </Form.Item>

                  <Form.Item
                    name={["marketPrices", index, "maxOrderQty"]}
                    className="mb-0"
                  >
                    <InputNumber style={{ width: "100%" }} min={1} />
                  </Form.Item>
                </div>
              ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={() => setIsEditVariantModalOpen(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={savingVariant}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </Space>
  );
}
