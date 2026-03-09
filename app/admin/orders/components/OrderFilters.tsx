import React from "react";
import { Tabs, Input, Button } from "antd";
import { Search } from "lucide-react";

interface OrderFiltersProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  onSearch: (value: string) => void;
}

export const OrderFilters = ({
  activeTab,
  onTabChange,
  onSearch,
}: OrderFiltersProps) => {
  return (
    <div className="p-4 border-b border-gray-100 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
      <div className="w-full overflow-x-auto">
        <Tabs
          activeKey={activeTab}
          onChange={onTabChange}
          items={[
            { key: "all", label: "All" },
            { key: "unfulfilled", label: "Unfulfilled" },
            { key: "unpaid", label: "Unpaid" },
            { key: "open", label: "Open" },
            { key: "closed", label: "Closed" },
          ]}
          className="mb-0"
        />
      </div>

      <div className="flex gap-2 w-full xl:w-auto mt-2 xl:mt-0">
        <Input
          prefix={<Search size={16} />}
          placeholder="Search orders..."
          className="w-full xl:w-64"
          onChange={(e) => onSearch(e.target.value)}
        />
        <Button>Filter</Button>
      </div>
    </div>
  );
};
