import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ShopScreen } from "../screens/ShopScreen";
import { ProductDetailScreen } from "../screens/ProductDetailScreen";

export type ShopStackParamList = {
  Shop: undefined;
  ProductDetail: { slug: string };
};

const Stack = createNativeStackNavigator<ShopStackParamList>();

export function ShopStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
