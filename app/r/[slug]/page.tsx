"use client";

import { CreateOrderForm } from "@/app/components/CreateOrderForm";
import { OrderList } from "@/app/components/OrderList";
import type React from "react";
import { showSuccessToast, showErrorToast } from "@/app/components/Toast";
import { ToastContainer } from "react-toastify";

import { useEffect, useState } from "react";
import { Order } from "@/app/components/OrderCard";

interface Pedido {
  id: string;
  numeroPedido: string;
  nombreCliente: string;
  numeroCaja: string;
  estado: "pendiente" | "realizado";
  fecha: string;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const getOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orders");
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
  const onStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: newStatus }),
      });

      if (!response.ok) {
        showErrorToast("Error updating order status");
        throw new Error("Network response was not ok");
      }

      const updatedOrder = await response.json();
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId ? updatedOrder : order
        )
      );
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
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    showSuccessToast("Pedido creado exitosamente");
  };

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-zinc-50 to-zinc-100">
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
          orders={orders}
          loading={loading}
          onStatusUpdate={onStatusUpdate}
        />
      </div>
    </main>
  );
}
