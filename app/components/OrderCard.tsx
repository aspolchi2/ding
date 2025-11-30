"use client";

import { Check, CheckCheck, Trash2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export interface Order {
  uuid: string;
  order_id: string;
  customer_name: string;
  terminal_id: string;
  status: status;
  created_at: string;
  first_viewed_at?: string;
}
export type status = "PENDING" | "READY" | "RETRIEVED" | "DELETED";

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: status) => void;
}

export function OrderCard({ order, onStatusUpdate }: OrderCardProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 border rounded-lg border-zinc-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-zinc-900">
              #{order.order_id}
            </h3>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-zinc-600">{order.customer_name}</p>
          <div className="flex gap-4 mt-1 text-xs text-zinc-500">
            <span>Terminal: {order.terminal_id}</span>
            <span>Creado: {formatTime(order.created_at)}</span>
            {order.first_viewed_at && (
              <span>Visto: {formatTime(order.first_viewed_at)}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-4">
          <button
            className="p-2 border rounded cursor-pointer text-zinc-500 hover:text-zinc-700 border-zinc-200"
            onClick={() => onStatusUpdate(order.order_id, "READY")}
          >
            <Check />
          </button>
          <button
            className="p-2 border rounded cursor-pointer text-zinc-500 hover:text-zinc-700 border-zinc-200"
            onClick={() => onStatusUpdate(order.order_id, "RETRIEVED")}
          >
            <CheckCheck />
          </button>
          <button
            className="p-2 border rounded cursor-pointer text-zinc-500 hover:text-zinc-700 border-zinc-200"
            onClick={() => onStatusUpdate(order.order_id, "DELETED")}
          >
            <Trash2 />
          </button>
        </div>
      </div>
    </div>
  );
}
