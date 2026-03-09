import React from "react";
import { Card } from "antd";

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
}

const StatCard = ({ title, value, change, trend }: StatCardProps) => (
  <Card bordered={false} className="shadow-sm">
    <div className="text-gray-500 text-sm mb-2">{title}</div>
    <div className="text-2xl font-bold mb-2">{value}</div>
    {/* <div
      className={`text-xs flex items-center gap-1 ${
        trend === "up" ? "text-green-600" : "text-red-500"
      }`}
    >
      <span>{change}</span>
      <span className="text-gray-400">last week</span>
    </div> */}
  </Card>
);

interface OrderStatCardsProps {
  stats: {
    total: number;
    returns: number;
    fulfilled: number;
  };
}

export const OrderStatCards = ({ stats }: OrderStatCardsProps) => {
  return (
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
  );
};
