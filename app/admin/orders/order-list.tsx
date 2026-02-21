"use client";

import React from "react";
import {
  Table,
  Input,
  Badge,
  Button,
  Tabs,
  Card,
  Tag,
  Space,
  Drawer,
  Descriptions,
  Divider,
  Select,
  message,
} from "antd";
import { Search, Eye, MoreHorizontal, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Currency from "@/components/common/Currency";
import { getMediaUrl } from "@/utils/media_url";
import { updateOrderStatus } from "@/actions/admin-orders";

interface OrderListProps {
  initialOrders: any[];
  initialTotal: number;
  stats: any;
  activeTab: string;
}

export default function OrderList({
  initialOrders,
  initialTotal,
  stats,
  activeTab,
}: OrderListProps) {
  const router = useRouter();
  const [orders, setOrders] = React.useState(initialOrders);
  const [loading, setLoading] = React.useState(false);

  const [drawer, setDrawer] = React.useState<{
    isOpen: boolean;
    mode: "view" | "create";
    orderId?: string;
  }>({ isOpen: false, mode: "view" });
  const [updating, setUpdating] = React.useState(false);

  const selectedOrder = drawer.orderId
    ? orders.find((o) => o.id === drawer.orderId)
    : null;

  const handleUpdateStatus = async (
    id: string,
    field: string,
    value: string,
  ) => {
    try {
      setUpdating(true);
      await updateOrderStatus(id, { [field]: value });

      // Update local state smoothly without full reload
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, [field]: value } : order,
        ),
      );

      message.success(`${field} updated instantly!`);
    } catch (error) {
      console.error(error);
      message.error(`Failed to update ${field}`);
    } finally {
      setUpdating(false);
    }
  };

  React.useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const columns = [
    {
      title: "Order",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text: number) => <span className="font-medium">#{text}</span>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: Date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Customer",
      key: "customer",
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium">
            {record.customer?.firstName} {record.customer?.lastName}
          </div>
          <div className="text-xs text-gray-400">{record.customer?.email}</div>
        </div>
      ),
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status: string) => {
        const color =
          status === "PAID" ? "green" : status === "PENDING" ? "orange" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Fulfillment",
      dataIndex: "fulfillmentStatus",
      key: "fulfillmentStatus",
      render: (status: string) => {
        const color = status === "FULFILLED" ? "green" : "default";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Items",
      key: "items",
      render: (_: any, record: any) => `${record.items.length} items`,
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => (
        <Currency value={price} className="font-medium" />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <button
            onClick={() =>
              setDrawer({ isOpen: true, mode: "view", orderId: record.id })
            }
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() =>
              setDrawer({ isOpen: true, mode: "view", orderId: record.id })
            }
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FileText size={18} />
          </button>
        </Space>
      ),
    },
  ];

  const StatCard = ({ title, value, change, trend }: any) => (
    <Card bordered={false} className="shadow-sm">
      <div className="text-gray-500 text-sm mb-2">{title}</div>
      <div className="text-2xl font-bold mb-2">{value}</div>
      <div
        className={`text-xs flex items-center gap-1 ${trend === "up" ? "text-green-600" : "text-red-500"}`}
      >
        <span>{change}</span>
        <span className="text-gray-400">last week</span>
      </div>
    </Card>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <Button>Export</Button>
          <Button
            type="primary"
            onClick={() => setDrawer({ isOpen: true, mode: "create" })}
          >
            Create order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value={stats.total}
          change="25.2%"
          trend="up"
        />
        <StatCard
          title="Order items over time"
          value="15"
          change="18.2%"
          trend="up"
        />
        <StatCard
          title="Returns Orders"
          value={stats.returns}
          change="-1.2%"
          trend="down"
        />
        <StatCard
          title="Fulfilled orders over time"
          value={stats.fulfilled}
          change="12.2%"
          trend="up"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => router.push(`/admin/orders?tab=${key}`)}
            items={[
              { key: "all", label: "All" },
              { key: "unfulfilled", label: "Unfulfilled" },
              { key: "unpaid", label: "Unpaid" },
              { key: "open", label: "Open" },
              { key: "closed", label: "Closed" },
            ]}
            className="mb-0"
          />

          <div className="flex gap-2">
            <Input
              prefix={<Search size={16} />}
              placeholder="Search"
              className="w-64"
            />
            <Button>Filter</Button>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={{ total: initialTotal }}
          loading={loading}
        />
      </div>

      <Drawer
        title={
          drawer.mode === "create"
            ? "Create Draft Order"
            : `Order #${selectedOrder?.orderNumber || ""}`
        }
        width={720}
        onClose={() => setDrawer({ ...drawer, isOpen: false })}
        open={drawer.isOpen}
      >
        {drawer.mode === "create" ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-full">
            <FileText size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Create Order
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              The draft orders interface is not fully set up yet. When ready,
              the creation form will load natively here.
            </p>
            <Button onClick={() => setDrawer({ ...drawer, isOpen: false })}>
              Close
            </Button>
          </div>
        ) : selectedOrder ? (
          <div className="space-y-6">
            <Descriptions
              title="Customer Info"
              bordered
              column={1}
              size="small"
            >
              <Descriptions.Item label="Name">
                {selectedOrder.customer?.firstName}{" "}
                {selectedOrder.customer?.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.customer?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Select
                  value={selectedOrder.paymentStatus}
                  onChange={(val) =>
                    handleUpdateStatus(selectedOrder.id, "paymentStatus", val)
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
              <Descriptions.Item label="Fulfillment">
                <Select
                  value={selectedOrder.fulfillmentStatus}
                  onChange={(val) =>
                    handleUpdateStatus(
                      selectedOrder.id,
                      "fulfillmentStatus",
                      val,
                    )
                  }
                  disabled={updating}
                  options={[
                    {
                      value: "UNFULFILLED",
                      label: <Tag color="default">UNFULFILLED</Tag>,
                    },
                    {
                      value: "PARTIALLY_FULFILLED",
                      label: <Tag color="blue">PARTIALLY_FULFILLED</Tag>,
                    },
                    {
                      value: "FULFILLED",
                      label: <Tag color="green">FULFILLED</Tag>,
                    },
                    {
                      value: "CANCELLED",
                      label: <Tag color="red">CANCELLED</Tag>,
                    },
                  ]}
                  variant="borderless"
                  className="-ml-3"
                />
              </Descriptions.Item>
              <Descriptions.Item label="Order Status">
                <Select
                  value={selectedOrder.status}
                  onChange={(val) =>
                    handleUpdateStatus(selectedOrder.id, "status", val)
                  }
                  disabled={updating}
                  options={[
                    { value: "PENDING", label: "PENDING" },
                    { value: "COMPLETED", label: "COMPLETED" },
                    { value: "CANCELLED", label: "CANCELLED" },
                    { value: "REFUNDED", label: "REFUNDED" },
                  ]}
                  variant="borderless"
                  className="-ml-3 w-32"
                />
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div>
              <h3 className="text-lg font-medium mb-4">Order Items</h3>
              <Table
                dataSource={selectedOrder.items}
                rowKey="id"
                pagination={false}
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
                <Currency value={selectedOrder.subtotal} />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <Currency value={selectedOrder.shippingTotal} />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <Currency value={selectedOrder.taxTotal} />
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <Currency value={selectedOrder.totalPrice} />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            Loading order details...
          </div>
        )}
      </Drawer>
    </div>
  );
}
