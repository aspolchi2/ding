"use client";

import { CreateOrderForm } from "@/app/components/CreateOrderForm";
import { OrderList } from "@/app/components/OrderList";
import { showSuccessToast, showErrorToast } from "@/app/components/Toast";
import { ToastContainer } from "react-toastify";

import { useEffect, useState } from "react";
import { Order, status } from "@/app/components/OrderCard";
import { useParams } from "next/navigation";
import CompletedOrders from "@/app/components/CompletedOrders";
import { useOrderStore } from "@/app/store/useOrderStore";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const {
    orders,
    setOrders,
    getCompletedOrders,
    getActiveOrders,
    updateOrderStatus,
  } = useOrderStore((state) => state);

  const activeOrders = getActiveOrders();
  const completedOrders = getCompletedOrders();

  const getOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/${params.slug}/orders`);
      if (!response.ok) {
        showErrorToast("Error fetching orders");
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showErrorToast("Error fetching orders");
    }
  };
  const onStatusUpdate = async (orderId: string, newStatus: status) => {
    try {
      const response = await fetch(`/api/${params.slug}/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        showErrorToast("Error updating order status");
        throw new Error("Network response was not ok");
      }

      const updatedOrder = await response.json();
      updateOrderStatus(orderId, newStatus);
      showSuccessToast("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      showErrorToast("Error updating order status");
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const successCallback = (newOrder: Order) => {
    showSuccessToast("Pedido creado exitosamente");
  };
  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-zinc-50 to-zinc-100">
      <ToastContainer />
      {/* Header */}
      <header className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 text-lg font-bold text-white rounded-full bg-zinc-900">
          D
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">
          Ding - Gestión de Pedidos
        </h1>
      </header>

      {/* Main Content - Two Columns */}
      <div className="grid max-w-6xl gap-6 mx-auto lg:grid-cols-2">
        {/* Left Section - Formulario de Nuevo Pedido */}
        <CreateOrderForm onOrderCreated={successCallback} />
        {/* Right Section - Lista de Pedidos */}
        <OrderList
          orders={activeOrders}
          loading={loading}
          onStatusUpdate={onStatusUpdate}
        />
      </div>
      <div className="">
        <CompletedOrders orders={completedOrders} />
      </div>
    </main>
  );
}
