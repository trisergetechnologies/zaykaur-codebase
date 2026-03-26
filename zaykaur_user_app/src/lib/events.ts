import { DeviceEventEmitter, EmitterSubscription } from "react-native";

export const CART_UPDATED_EVENT = "cart-updated";

export function emitCartUpdated() {
  DeviceEventEmitter.emit(CART_UPDATED_EVENT);
}

export function subscribeCartUpdated(listener: () => void): EmitterSubscription {
  return DeviceEventEmitter.addListener(CART_UPDATED_EVENT, listener);
}
