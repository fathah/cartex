import React from "react";
import { Modal, Table, Divider, Button } from "antd";
import Currency from "@/components/common/Currency";
import { getMediaUrl } from "@/utils/media_url";

interface OrderItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export const OrderItemsModal = ({
  isOpen,
  onClose,
  order,
}: OrderItemsModalProps) => {
  if (!order) return null;

  return (
    <Modal
      title={`Order Items - #${order.orderNumber}`}
      open={isOpen}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <div className="py-2">
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
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs shadow-sm text-center">
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
              align: "center",
            },
            {
              title: "Price",
              dataIndex: "price",
              key: "price",
              render: (val: number) => <Currency value={val} />,
              align: "right",
            },
            {
              title: "Total",
              key: "total",
              render: (_: any, record: any) => (
                <Currency value={record.price * record.quantity} />
              ),
              align: "right",
            },
          ]}
        />
        <Divider />
        <div className="flex justify-end gap-8 px-4">
          <div className="text-gray-500">
            Total Items:{" "}
            <span className="text-black font-bold">{order.items.length}</span>
          </div>
          <div className="text-gray-500">
            Order Total:{" "}
            <span className="text-black font-bold">
              <Currency value={order.totalPrice} />
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
