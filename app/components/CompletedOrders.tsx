import React from "react";
import { Order, OrderCard } from "./OrderCard";

const CompletedOrders = ({ orders }: { orders: Order[] | undefined }) => {
  return (
    <div className="grid max-w-6xl gap-6 mx-auto mt-6 lg:grid-cols-1">
      <div className="p-6 bg-white rounded-lg shadow-sm text-zinc-700 ">
        <h1 className="mb-4 text-xl font-semibold text-zinc-900">
          Ordenes completadas
        </h1>
        <div className="space-y-4 h-[70vh] overflow-y-auto">
          {orders?.map((order) => (
            <OrderCard
              order={order}
              onStatusUpdate={() => console.log("click")}
              key={order.order_id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompletedOrders;
