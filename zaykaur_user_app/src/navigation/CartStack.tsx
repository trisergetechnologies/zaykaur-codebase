import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CartScreen } from "../screens/CartScreen";
import { CheckoutScreen } from "../screens/CheckoutScreen";

export type CartStackParamList = {
  Cart: undefined;
  Checkout: undefined;
};

const Stack = createNativeStackNavigator<CartStackParamList>();

export function CartStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}
