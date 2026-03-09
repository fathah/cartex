import React from "react";
import {
  Modal,
  Select,
  Input,
  InputNumber,
  Button,
  Space,
  Table,
  Tag,
  Divider,
  message,
  Empty,
} from "antd";
import { Search, User, Package, Plus, Trash2 } from "lucide-react";
import { getCustomers } from "@/actions/customers";
import { searchProducts } from "@/actions/search";
import { createAdminOrder } from "@/actions/admin-orders";
import Currency from "@/components/common/Currency";
import { getMediaUrl } from "@/utils/media_url";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateOrderModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateOrderModalProps) => {
  const [loading, setLoading] = React.useState(false);
  const [searchingUser, setSearchingUser] = React.useState(false);
  const [searchingProduct, setSearchingProduct] = React.useState(false);

  const [customerOptions, setCustomerOptions] = React.useState<any[]>([]);
  const [productOptions, setProductOptions] = React.useState<any[]>([]);

  const [selectedCustomer, setSelectedCustomer] = React.useState<string | null>(
    null,
  );
  const [guestEmail, setGuestEmail] = React.useState("");
  const [selectedItems, setSelectedItems] = React.useState<any[]>([]);

  // Search Customers
  const handleSearchUser = async (val: string) => {
    if (!val) return;
    setSearchingUser(true);
    try {
      const { customers } = await getCustomers({ search: val });
      setCustomerOptions(
        customers.map((c: any) => ({
          label: `${c.fullname} (${c.email})`,
          value: c.id,
          email: c.email,
        })),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setSearchingUser(false);
    }
  };

  // Search Products
  const handleSearchProduct = async (val: string) => {
    if (!val) return;
    setSearchingProduct(true);
    try {
      const { products } = await searchProducts(val);
      setProductOptions(products);
    } catch (error) {
      console.error(error);
    } finally {
      setSearchingProduct(false);
    }
  };

  const addItem = (product: any) => {
    const variant = product.variants?.[0]; // Default to first variant for now
    if (!variant) {
      message.error("No variant found for this product");
      return;
    }

    const existing = selectedItems.find(
      (item) => item.variantId === variant.id,
    );
    if (existing) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.variantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          variantId: variant.id,
          productId: product.id,
          title: product.name,
          variantTitle: variant.title,
          image: product.mediaProducts?.[0]?.media?.url,
          price: Number(variant.salePrice || variant.originalPrice),
          quantity: 1,
        },
      ]);
    }
    setProductOptions([]); // Clear search after selection
  };

  const removeItem = (variantId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.variantId !== variantId));
  };

  const handleCreate = async () => {
    if (!selectedCustomer && !guestEmail && !selectedItems.length) {
      message.warning("Please select a customer and add items");
      return;
    }

    if (selectedItems.length === 0) {
      message.warning("Add at least one item");
      return;
    }

    setLoading(true);
    try {
      const res = await createAdminOrder({
        customerId: selectedCustomer || undefined,
        email: guestEmail || undefined,
        items: selectedItems.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      });

      if (res.success) {
        message.success("Order created successfully!");
        onSuccess();
        onClose();
        // Reset local state
        setSelectedCustomer(null);
        setGuestEmail("");
        setSelectedItems([]);
      }
    } catch (error: any) {
      message.error(error.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = selectedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <Modal
      title="Create New Order"
      open={isOpen}
      onCancel={onClose}
      width={800}
      onOk={handleCreate}
      confirmLoading={loading}
      okText="Create Order"
      destroyOnHidden
    >
      <div className="space-y-6 py-4">
        {/* Customer Section */}
        <section>
          <div className="flex items-center gap-2 mb-3 font-medium">
            <User size={18} className="text-gray-400" />
            Customer Information
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              showSearch
              placeholder="Search existing customer..."
              filterOption={false}
              onSearch={handleSearchUser}
              onChange={setSelectedCustomer}
              loading={searchingUser}
              options={customerOptions}
              className="w-full"
              allowClear
              size="large"
            />
            <Input
              placeholder="Or enter guest email (e.g. guest@cartex.ziqx.cc)"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              disabled={!!selectedCustomer}
              size="large"
            />
          </div>
        </section>

        <Divider />

        {/* Product Section */}
        <section>
          <div className="flex items-center gap-2 mb-3 font-medium">
            <Package size={18} className="text-gray-400" />
            Add Products
          </div>
          <Select
            showSearch
            placeholder="Search products by name..."
            filterOption={false}
            onSearch={handleSearchProduct}
            loading={searchingProduct}
            className="w-full mb-4"
            size="large"
            popupRender={() => (
              <div className="max-h-64 overflow-auto p-1 bg-white">
                {productOptions.length > 0 ? (
                  productOptions.map((p) => (
                    <div
                      key={p.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between rounded group"
                      onClick={() => addItem(p)}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={getMediaUrl(p.mediaProducts?.[0]?.media?.url)}
                          className="w-10 h-10 object-cover rounded"
                          alt=""
                        />
                        <div>
                          <div className="text-sm font-medium">{p.name}</div>
                          <div className="text-xs text-gray-400">
                            {p.variants?.[0]?.title !== "Default Variant" &&
                              p.variants?.[0]?.title}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Currency
                          value={
                            p.variants?.[0]?.salePrice ||
                            p.variants?.[0]?.originalPrice
                          }
                          className="text-sm font-bold"
                        />
                        <Plus
                          size={16}
                          className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    {searchingProduct ? "Searching..." : "Type to search..."}
                  </div>
                )}
              </div>
            )}
          />

          {/* Selected Items Table */}
          {selectedItems.length > 0 ? (
            <div className="border border-gray-300 mt-4 rounded-lg overflow-hidden">
              <Table
                dataSource={selectedItems}
                rowKey="variantId"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: "Product",
                    render: (_, item) => (
                      <div className="flex items-center gap-2">
                        <img
                          src={getMediaUrl(item.image)}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div>
                          <div className="text-xs font-medium">
                            {item.title}
                          </div>
                          {item.variantTitle !== "Default Variant" && (
                            <div className="text-[10px] text-gray-400">
                              {item.variantTitle}
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Price",
                    dataIndex: "price",
                    render: (price) => <Currency value={price} />,
                  },
                  {
                    title: "Qty",
                    render: (_, item) => (
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        onChange={(val) => {
                          setSelectedItems(
                            selectedItems.map((i) =>
                              i.variantId === item.variantId
                                ? { ...i, quantity: val }
                                : i,
                            ),
                          );
                        }}
                        size="small"
                        className="w-16"
                      />
                    ),
                  },
                  {
                    title: "Total",
                    render: (_, item) => (
                      <Currency value={item.price * item.quantity} />
                    ),
                  },
                  {
                    title: "",
                    render: (_, item) => (
                      <Button
                        type="text"
                        danger
                        icon={<Trash2 size={14} />}
                        onClick={() => removeItem(item.variantId)}
                        size="small"
                      />
                    ),
                  },
                ]}
              />
              <div className="bg-gray-50 p-4 border-t flex justify-between items-center">
                <div className="text-gray-500 text-sm">
                  {selectedItems.length} line items
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">Order Subtotal:</span>
                  <span className="text-xl font-bold">
                    <Currency value={subtotal} />
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 border-2 border-dashed rounded-lg text-center bg-gray-50 mt-4">
              <Package size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400">No products added yet</p>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
};
