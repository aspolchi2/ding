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
  //@ts-expect-error params used in use()
  const { slug, terminalId } = use(params);

  const getOrder = async () => {
    try {
      const response = await fetch(`/api/${slug}/terminal_qr/${terminalId}`, {
        method: "GET",
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Tu Pedido</h1>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Número de orden</p>
            <p className="text-xl font-semibold text-blue-600">#{terminalId}</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Nombre</p>
            <p className="text-lg font-medium">Juan Pérez</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Estado del pedido</p>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              <p className="text-lg font-medium text-yellow-600">
                En preparación
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Enviar
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-green-600 font-medium">
                ¡Gracias! Te notificaremos por WhatsApp
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
