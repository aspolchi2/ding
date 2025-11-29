"use client";
import React, { use, useEffect, useState } from "react";

interface PageProps {
  params: {
    slug: string;
    terminalId: string;
  };
}

const Page = ({ params }: PageProps) => {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showOrderInput, setShowOrderInput] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  //@ts-expect-error params used in use()
  const { slug, terminalId } = use(params);

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
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    getOrder();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsappNumber.trim()) {
      setSubmitted(true);
      // Aquí se enviaría el número a tu backend
      console.log("WhatsApp number:", whatsappNumber);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Tu Pedido</h1>
          <div className="p-4 rounded-lg bg-blue-50">
            <p className="text-sm text-gray-600">Número de orden</p>
            <p className="text-xl font-semibold text-blue-600">#{terminalId}</p>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600">Nombre</p>
            <p className="text-lg font-medium">Juan Pérez</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Estado del pedido</p>
            <div className="flex items-center">
              <div className="w-3 h-3 mr-2 bg-yellow-400 rounded-full"></div>
              <p className="text-lg font-medium text-yellow-600">
                En preparación
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
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Número de pedido"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    if (orderNumber.trim()) {
                      console.log("Nuevo número de pedido:", orderNumber);
                      // Aquí puedes agregar la lógica para buscar el pedido
                    }
                  }}
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
