import { useEffect, useRef, useState } from 'react';

interface Order {
  id: number;
  uuid: string;
  order_id: string;
  customer_name: string;
  terminal_id: string;
  status: string;
  created_at: string;
  first_viewed_at: string | null;
  last_viewed_at: string | null;
  restaurant_user: number;
}

export const useOrderWebSocket = (slug: string, terminalId: string, orderId?: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `wss://ding-6hg3.onrender.com/ws/${slug}/${terminalId}/${orderId}/`
      : `ws://localhost:8000/ws/${slug}/${terminalId}/${orderId}/`;
    ws.current = new WebSocket(wsUrl);
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOrder(data);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.current?.close();
    };
  }, [slug, terminalId, orderId]);

  return order;
};