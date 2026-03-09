import React from "react";
import { Modal, Select, Tag, Space, Button } from "antd";

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
  field: string | null;
  updating: boolean;
  onSave: (id: string, field: string, value: string) => void;
}

export const StatusUpdateModal = ({
  isOpen,
  onClose,
  record,
  field,
  updating,
  onSave,
}: StatusUpdateModalProps) => {
  const [value, setValue] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (record && field) {
      setValue(record[field]);
    }
  }, [record, field, isOpen]);

  if (!record || !field) return null;

  const getOptions = () => {
    switch (field) {
      case "paymentStatus":
        return [
          { value: "PENDING", label: <Tag color="orange">PENDING</Tag> },
          { value: "PAID", label: <Tag color="green">PAID</Tag> },
          { value: "FAILED", label: <Tag color="red">FAILED</Tag> },
          { value: "REFUNDED", label: <Tag color="default">REFUNDED</Tag> },
        ];
      case "status":
        return [
          { value: "PENDING", label: <span>PENDING</span> },
          { value: "ORDERED", label: <span>ORDERED</span> },
          { value: "PROCESSING", label: <span>PROCESSING</span> },
          { value: "SHIPPED", label: <span>SHIPPED</span> },
          { value: "FULFILLED", label: <span>FULFILLED</span> },
          { value: "CANCELLED", label: <span>CANCELLED</span> },
          { value: "RETURNED", label: <span>RETURNED</span> },
        ];
      default:
        return [];
    }
  };

  const handleSave = () => {
    if (value) {
      onSave(record.id, field, value);
      onClose();
    }
  };

  const titleField =
    field === "paymentStatus" ? "Payment Status" : "Order Status";

  return (
    <Modal
      title={`Update ${titleField} - #${record.orderNumber}`}
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={updating}
          onClick={handleSave}
        >
          Update Status
        </Button>,
      ]}
    >
      <div className="py-4">
        <p className="text-gray-500 mb-2 text-sm">Select new status:</p>
        <Select
          className="w-full"
          value={value}
          onChange={setValue}
          options={getOptions()}
          size="large"
        />
      </div>
    </Modal>
  );
};
