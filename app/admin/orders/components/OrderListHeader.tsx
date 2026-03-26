import React from "react";
import { Button } from "antd";

interface OrderListHeaderProps {
  onCreateDraft: () => void;
}

export const OrderListHeader = ({ onCreateDraft }: OrderListHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 mb-8">
      <div className="flex gap-2 w-full sm:w-auto">
        <Button className="flex-1 sm:flex-none">Export</Button>
        <Button
          type="primary"
          onClick={onCreateDraft}
          className="flex-1 sm:flex-none"
        >
          Create order
        </Button>
      </div>
    </div>
  );
};
