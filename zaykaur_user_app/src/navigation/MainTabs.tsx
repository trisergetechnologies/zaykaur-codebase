import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeStack } from "./HomeStack";
import { ShopStack } from "./ShopStack";
import { CartStack } from "./CartStack";
import { AccountStack } from "./AccountStack";
import { useCartApi } from "../hooks/useCartApi";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/colors";
import { subscribeCartUpdated } from "../lib/events";

export type MainTabParamList = {
  HomeTab: undefined;
  ShopTab: undefined;
  CartTab: undefined;
  AccountTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({
  icon,
  focused,
  badge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  badge?: number;
}) {
  return (
    <View style={styles.tabIconWrap}>
      <View style={[styles.iconBubble, focused && styles.iconBubbleActive]}>
        <Ionicons name={icon} size={20} color={focused ? colors.primary : colors.textMuted} />
      </View>
      {badge != null && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      )}
    </View>
  );
}

export function MainTabs() {
  const insets = useSafeAreaInsets();
  const { token } = useAuthStore();
  const { count, refetch } = useCartApi();

  useEffect(() => {
    const sub = subscribeCartUpdated(() => {
      refetch();
    });
    return () => sub.remove();
  }, [refetch]);

  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 64 + bottomInset,
            paddingBottom: bottomInset,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? "home" : "home-outline"} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ShopTab"
        component={ShopStack}
        options={{
          tabBarLabel: "Z Shop",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? "storefront" : "storefront-outline"} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStack}
        options={{
          tabBarLabel: "Cart",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={focused ? "cart" : "cart-outline"}
              focused={focused}
              badge={token ? count : 0}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountStack}
        options={{
          tabBarLabel: "Account",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? "person" : "person-outline"} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 8,
    paddingHorizontal: 8,
    elevation: 20,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 10,
  },
  tabBarLabel: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
  tabIconWrap: { position: "relative", minWidth: 28, alignItems: "center" },
  iconBubble: {
    width: 34,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconBubbleActive: {
    backgroundColor: colors.primaryLight,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: colors.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: "700" },
});
