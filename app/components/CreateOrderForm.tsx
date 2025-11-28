"use client";

import { useState } from "react";
import { Order } from "./OrderCard";
import { useParams } from "next/navigation";

interface CreateOrderFormProps {
  onOrderCreated: (order: Order) => void;
}

export function CreateOrderForm({ onOrderCreated }: CreateOrderFormProps) {
  const [orderId, setOrderId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [terminalId, setTerminalId] = useState("1");
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<{
    qr_base64: string;
    qr_url: string;
  } | null>(null);
  const params = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/${params.slug}/orders`, {
        method: "POST",
        body: JSON.stringify({
          order_id: orderId,
          customer_name: customerName,
          terminal_id: terminalId,
        }),
      });

      const newOrder = await response.json();
      console.log("New order created:", newOrder);
      onOrderCreated(newOrder);
      setQrData({ qr_base64: newOrder.qr_base64, qr_url: newOrder.qr_url });

      // Reset form
      setOrderId("");
      setCustomerName("");
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-zinc-900">Crear Pedido</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            ID Pedido
          </label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 border rounded border-zinc-300 focus:border-zinc-900 focus:outline-none"
            placeholder="A123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Cliente
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 border rounded border-zinc-300 focus:border-zinc-900 focus:outline-none"
            placeholder="Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Terminal
          </label>
          <select
            value={terminalId}
            onChange={(e) => setTerminalId(e.target.value)}
            className="w-full px-3 py-2 mt-1 border rounded border-zinc-300 focus:border-zinc-900 focus:outline-none"
          >
            <option value="1">Terminal 1</option>
            <option value="2">Terminal 2</option>
            <option value="3">Terminal 3</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 text-white rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear Pedido"}
        </button>
      </form>

      {qrData && (
        <div className="pt-6 mt-6 border-t">
          <h3 className="mb-2 font-medium text-zinc-900">QR Generado</h3>
          <div className="text-center">
            <img
              src={`data:image/png;base64,${qrData.qr_base64}`}
              alt="QR Code"
              className="w-32 h-32 mx-auto mb-2"
            />
            <p className="text-xs text-zinc-500">{qrData.qr_url}</p>
            <button
              onClick={() => setQrData(null)}
              className="mt-2 text-sm text-zinc-600 hover:text-zinc-900"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
