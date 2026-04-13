import { Store } from "./store.types";

export const STORES: Record<string, Store> = {
  main: {
    key: "main",
    name: "Zakur",
    logo: "/logos/main.png",
    primaryColor: "#000000",
    currency: "INR",
  },
  fashion: {
    key: "fashion",
    name: "Zakur Fashion",
    logo: "/logos/fashion.png",
    primaryColor: "#db2777",
    currency: "INR",
  },
  electronics: {
    key: "electronics",
    name: "Zakur Electronics",
    logo: "/logos/electronics.png",
    primaryColor: "#2563eb",
    currency: "INR",
  },
};