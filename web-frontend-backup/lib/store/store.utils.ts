import { STORES } from "./store.config";

export function getStoreFromHost(host: string | null) {
  if (!host) return STORES.main;

  if (host.startsWith("fashion.")) return STORES.fashion;
  if (host.startsWith("electronics.")) return STORES.electronics;

  return STORES.main;
}