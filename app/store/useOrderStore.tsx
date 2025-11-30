// Store for managing orders
import { create } from "zustand";
import { Order } from "../components/OrderCard";

interface OrderStore {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  getActiveOrders: () => Order[];
  getCompletedOrders: () => Order[];
  addOrder: (order: Order) => void;
  removeOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  addOrder: (order) =>
    set((state) => ({
      orders: [...state.orders, order],
    })),
  getActiveOrders: () =>
    get().orders.filter((order) => order.status !== "RETRIEVED"),
  getCompletedOrders: () =>
    get().orders.filter((order) => order.status === "RETRIEVED"),

  removeOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.filter((order) => order.order_id !== orderId),
    })),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.order_id === orderId ? { ...order, status } : order
      ),
    })),

  getOrderById: (orderId) => {
    const state = get();
    return state.orders.find((order) => order.order_id === orderId);
  },
}));
