import React from "react";
import {
  Drawer,
  Descriptions,
  Select,
  Tag,
  Divider,
  Table,
  Button,
} from "antd";
import { FileText, CreditCard, Truck } from "lucide-react";
import Currency from "@/components/common/Currency";
import { getMediaUrl } from "@/utils/media_url";

interface OrderDetailsDrawerProps {
  isOpen: boolean;
  mode: "view" | "create";
  onClose: () => void;
  order: any;
  updating: boolean;
  onUpdateStatus: (id: string, field: string, value: string) => void;
}

export const OrderDetailsDrawer = ({
  isOpen,
  mode,
  onClose,
  order,
  updating,
  onUpdateStatus,
}: OrderDetailsDrawerProps) => {
  return (
    <Drawer
      title={
        mode === "create"
          ? "Create Draft Order"
          : `Order #${order?.orderNumber || ""}`
      }
      width={720}
      onClose={onClose}
      open={isOpen}
    >
      {mode === "create" ? (
        <div className="flex flex-col items-center justify-center p-12 text-center h-full">
          <FileText size={48} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Create Order
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            The draft orders interface is not fully set up yet. When ready, the
            creation form will load natively here.
          </p>
          <Button onClick={onClose}>Close</Button>
        </div>
      ) : order ? (
        <div className="space-y-6">
          <Descriptions title="Customer Info" bordered column={1} size="small">
            <Descriptions.Item label="Name">
              {order.customer?.fullname}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {order.customer?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Payment Status">
              <Select
                value={order.paymentStatus}
                onChange={(val) =>
                  onUpdateStatus(order.id, "paymentStatus", val)
                }
                disabled={updating}
                options={[
                  {
                    value: "PENDING",
                    label: <Tag color="orange">PENDING</Tag>,
                  },
                  { value: "PAID", label: <Tag color="green">PAID</Tag> },
                  { value: "FAILED", label: <Tag color="red">FAILED</Tag> },
                  {
                    value: "REFUNDED",
                    label: <Tag color="default">REFUNDED</Tag>,
                  },
                ]}
                variant="borderless"
                className="-ml-3"
              />
            </Descriptions.Item>

            <Descriptions.Item label="Order Status">
              <Select
                value={order.status}
                onChange={(val) => onUpdateStatus(order.id, "status", val)}
                disabled={updating}
                options={[
                  { value: "PENDING", label: "PENDING" },
                  { value: "ORDERED", label: "ORDERED" },
                  { value: "PROCESSING", label: "PROCESSING" },
                  { value: "SHIPPED", label: "SHIPPED" },
                  { value: "FULFILLED", label: "FULFILLED" },
                  { value: "CANCELLED", label: "CANCELLED" },
                  { value: "RETURNED", label: "RETURNED" },
                ]}
                variant="borderless"
                className="-ml-3 w-32"
              />
            </Descriptions.Item>
            <Descriptions.Item label="Fulfillment">
              <Tag
                color={
                  order.fulfillmentStatus === "FULFILLED" ? "green" : "default"
                }
              >
                {order.fulfillmentStatus}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <div>
            <h3 className="text-lg font-medium mb-4">Order Items</h3>
            <Table
              dataSource={order.items}
              rowKey="id"
              pagination={false}
              scroll={{ x: 500 }}
              columns={[
                {
                  title: "Item",
                  dataIndex: "title",
                  key: "title",
                  render: (text: string, record: any) => (
                    <div className="flex items-center gap-3">
                      {record.image ? (
                        <img
                          src={getMediaUrl(record.image)}
                          alt={text}
                          className="w-10 h-10 object-cover rounded shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs shadow-sm">
                          No img
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{text}</p>
                        {record.sku && (
                          <p className="text-xs text-gray-400 tracking-wide">
                            SKU: {record.sku}
                          </p>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  title: "Qty",
                  dataIndex: "quantity",
                  key: "quantity",
                },
                {
                  title: "Price",
                  dataIndex: "price",
                  key: "price",
                  render: (val: number) => <Currency value={val} />,
                },
              ]}
            />
          </div>

          <Divider />

          <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <Currency value={order.subtotal} />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <Currency value={order.shippingTotal} />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax</span>
              <Currency value={order.taxTotal} />
            </div>
            <Divider className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <Currency value={order.totalPrice} />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-400">
          Loading order details...
        </div>
      )}
    </Drawer>
  );
};
