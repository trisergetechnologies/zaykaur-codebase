import { create } from "zustand";

type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type Address = {
  name: string;
  phone: string;
  address: string;
};

type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  address: Address;
  status: "placed" | "cancelled" | "delivered";
  createdAt: string;
};

type OrderStore = {
  orders: Order[];
  placeOrder: (order: Order) => void;
  cancelOrder: (id: string) => void;
};

const useOrderStore = create<OrderStore>((set) => ({
  orders: [],

  placeOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
    })),

  cancelOrder: (id) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, status: "cancelled" } : o
      ),
    })),
}));

export default useOrderStore;