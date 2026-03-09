"use client";

import React from "react";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/actions/admin-orders";

import { OrderListHeader } from "./components/OrderListHeader";
import { OrderStatCards } from "./components/OrderStatCards";
import { OrderFilters } from "./components/OrderFilters";
import { OrderTable } from "./components/OrderTable";
import { OrderDetailsDrawer } from "./components/OrderDetailsDrawer";
import { StatusUpdateModal } from "./components/StatusUpdateModal";
import { OrderItemsModal } from "./components/OrderItemsModal";
import { CreateOrderModal } from "./components/CreateOrderModal";

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

  const [statusModal, setStatusModal] = React.useState<{
    isOpen: boolean;
    record: any;
    field: string | null;
  }>({ isOpen: false, record: null, field: null });

  const [itemsModal, setItemsModal] = React.useState<{
    isOpen: boolean;
    order: any;
  }>({ isOpen: false, order: null });

  const [createModalOpen, setCreateModalOpen] = React.useState(false);

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

      message.success(`${field.toUpperCase()} updated!`);
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

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <OrderListHeader onCreateDraft={() => setCreateModalOpen(true)} />

      <OrderStatCards stats={stats} />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <OrderFilters
          activeTab={activeTab}
          onTabChange={(key) => router.push(`/admin/orders?tab=${key}`)}
          onSearch={(val) => {
            // Simple local search if needed, or pass back to router
            console.log("Search", val);
          }}
        />
        <OrderTable
          orders={orders}
          total={initialTotal}
          loading={loading}
          onView={(id) =>
            setDrawer({ isOpen: true, mode: "view", orderId: id })
          }
          onStatusClick={(record, field) =>
            setStatusModal({ isOpen: true, record, field })
          }
          onItemsClick={(order) => setItemsModal({ isOpen: true, order })}
        />
      </div>

      <OrderDetailsDrawer
        isOpen={drawer.isOpen}
        mode={drawer.mode}
        onClose={() => setDrawer({ ...drawer, isOpen: false })}
        order={selectedOrder}
        updating={updating}
        onUpdateStatus={handleUpdateStatus}
      />

      <StatusUpdateModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        record={statusModal.record}
        field={statusModal.field}
        updating={updating}
        onSave={handleUpdateStatus}
      />

      <OrderItemsModal
        isOpen={itemsModal.isOpen}
        onClose={() => setItemsModal({ ...itemsModal, isOpen: false })}
        order={itemsModal.order}
      />

      <CreateOrderModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
