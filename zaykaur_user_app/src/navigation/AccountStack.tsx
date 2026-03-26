import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AccountScreen } from "../screens/AccountScreen";
import { OrdersScreen } from "../screens/OrdersScreen";
import { AddressesScreen } from "../screens/AddressesScreen";

export type AccountStackParamList = {
  Account: undefined;
  Orders: undefined;
  Addresses: undefined;
};

const Stack = createNativeStackNavigator<AccountStackParamList>();

export function AccountStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
    </Stack.Navigator>
  );
}
