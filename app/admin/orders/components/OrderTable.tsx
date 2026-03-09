import { Table, Tag, Space } from "antd";
import { Eye, FileText } from "lucide-react";
import Currency from "@/components/common/Currency";
import { formatDate } from "@/utils/date";

interface OrderTableProps {
  orders: any[];
  total: number;
  loading: boolean;
  onView: (id: string) => void;
  onStatusClick: (record: any, field: string) => void;
  onItemsClick: (record: any) => void;
}

export const OrderTable = ({
  orders,
  total,
  loading,
  onView,
  onStatusClick,
  onItemsClick,
}: OrderTableProps) => {
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
      render: (date: Date) => formatDate(date),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: any) => {
        const color = getStatusColor(status);
        return (
          <Tag
            color={color}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onStatusClick(record, "status")}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Customer",
      key: "customer",
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium">{record.customer?.fullname}</div>
          <div className="text-xs text-gray-400">{record.customer?.email}</div>
        </div>
      ),
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status: string, record: any) => {
        const color =
          status === "PAID" ? "green" : status === "PENDING" ? "orange" : "red";
        return (
          <Tag
            color={color}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onStatusClick(record, "paymentStatus")}
          >
            {status}
          </Tag>
        );
      },
    },

    {
      title: "Items",
      key: "items",
      render: (_: any, record: any) => (
        <span
          className="cursor-pointer hover:text-blue-600 transition-colors underline decoration-dotted"
          onClick={() => onItemsClick(record)}
        >
          {record.items.length} items
        </span>
      ),
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
            onClick={() => onView(record.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1 text-xs"
          >
            <Eye size={18} /> View
          </button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="id"
      pagination={{ total }}
      loading={loading}
      scroll={{ x: 1000 }}
    />
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "FULFILLED":
      return "green";
    case "PENDING":
      return "orange";
    case "CANCELLED":
      return "red";
    default:
      return "default";
  }
};
