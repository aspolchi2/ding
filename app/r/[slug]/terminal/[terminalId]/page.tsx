"use client";
import {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPush,
} from "@/app/utils/notifications";
import React, { use, useEffect, useState } from "react";
import { useOrderWebSocket } from "@/app/hooks/useOrderWebSocket";

interface PageProps {
  params: {
    slug: string;
    terminalId: string;
  };
}
interface order {
  id: number;
  uuid: string;
  order_id: string;
  customer_name: string;
  terminal_id: string;
  status: string;
  created_at: string;
  first_viewed_at: string;
  last_viewed_at: null;
  restaurant_user: number;
}

const Page = ({ params }: PageProps) => {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showOrderInput, setShowOrderInput] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<order>();
  //@ts-expect-error params used in use()
  const { slug, terminalId } = use(params);

  useEffect(() => {
    const initNotifications = async () => {
      const registration = await registerServiceWorker();
      const hasPermission = await requestNotificationPermission();

      if (registration && hasPermission) {
        const subscription = await subscribeToPush(registration);
        // Envía subscription al backend
      }
    };

    initNotifications();
  }, []);

  const getOrder = async () => {
    const body = JSON.stringify({
      terminal_id: terminalId,
      restaurant_uuid: slug,
    });
    try {
      const response = await fetch(`/api/${slug}/terminal_qr/${terminalId}`, {
        method: "post",
        body: body,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener el pedido");
      }

      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // WebSocket para actualizaciones en tiempo real
  const wsOrder = useOrderWebSocket(slug, terminalId, order?.order_id);

  useEffect(() => {
    if (wsOrder) {
      //@ts-expect-error some
      setOrder(wsOrder);
    }
  }, [wsOrder]);

  useEffect(() => {
    getOrder();
  }, []);

  const estado = {
    READY: "Listo",
    PENDING: "En proceso",
    RETRIEVED: "Retirado",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsappNumber.trim()) {
      setSubmitted(true);
      // Aquí se enviaría el número a tu backend
      console.log("WhatsApp number:", whatsappNumber);
    }
  };

  const newOrderNumber = async () => {
    const body = JSON.stringify({
      terminal_id: terminalId,
      restaurant_uuid: slug,
      order_number: orderNumber,
    });
    try {
      const response = await fetch(`/api/${slug}/terminal_qr/${terminalId}`, {
        method: "post",
        body: body,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener el pedido");
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Tu Pedido</h1>
          <div className="p-4 rounded-lg bg-blue-50">
            <p className="text-sm text-gray-600">Número de orden</p>
            <p className="text-xl font-semibold text-blue-600">
              #{order?.order_id || "0000"} 
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600">Nombre</p>
            <p className="text-lg font-medium text-zinc-700">
              {order?.customer_name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Estado del pedido</p>
            <div className="flex items-center">
              <div
                className={`w-3 h-3 mr-2  rounded-full ${
                  order?.status === "PENDING" ? "bg-yellow-400" : "bg-green-400"
                }`}
              ></div>
              <p
                className={`text-lg font-medium  ${
                  order?.status === "PENDING "
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {order && estado[order?.status as "PENDING" | "READY"]}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t">
          {/* {!submitted ? (
            <form onSubmit={handleSubmit}>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Si querés recibir información por WhatsApp dejanos tu número
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+54 9 11 1234-5678"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Enviar
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 text-center rounded-lg bg-green-50">
              <p className="font-medium text-green-600">
                ¡Gracias! Te notificaremos por WhatsApp
              </p>
            </div>
          )} */}
          {!showOrderInput ? (
            <button
              onClick={() => setShowOrderInput(true)}
              className="w-full text-sm text-center text-gray-500 hover:text-gray-700"
            >
              ¿Este no es tu pedido?
            </button>
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Ingresa tu número de pedido
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.trim())}
                  placeholder="Número de pedido"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700"
                />
                <button
                  onClick={() => newOrderNumber}
                  className="px-4 py-2 text-white bg-black rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Buscar
                </button>
              </div>
              <button
                onClick={() => setShowOrderInput(false)}
                className="w-full text-sm text-center text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
