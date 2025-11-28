"use client";

import { OrderCard } from "./OrderCard";

interface Order {
  uuid: string;
  order_id: string;
  customer_name: string;
  terminal_id: string;
  status: string;
  created_at: string;
  first_viewed_at?: string;
}

interface OrderListProps {
  orders: Order[];
  loading: boolean;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
}

export function OrderList({ orders, loading, onStatusUpdate }: OrderListProps) {
  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded bg-zinc-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-zinc-900">
        Pedidos Activos
      </h2>

      {orders.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-zinc-500">No hay pedidos activos</p>
        </div>
      ) : (
        <div className="space-y-4 h-[70vh] overflow-y-auto ">
          {orders.map((order) => (
            <OrderCard
              key={order.uuid}
              order={order}
              onStatusUpdate={onStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
