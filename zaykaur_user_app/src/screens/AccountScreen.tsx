import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import type { AccountStackParamList } from "../navigation/AccountStack";
import { api } from "../lib/api";

type AccountNav = NativeStackNavigationProp<AccountStackParamList, "Account">;

interface CountResponse<T> {
  items?: T[];
  pagination?: { total?: number };
}

interface MenuItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
}

export function AccountScreen({ navigation }: { navigation: AccountNav }) {
  const { token, user, logout } = useAuthStore();
  const [loadingStats, setLoadingStats] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const [addressesCount, setAddressesCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      if (!token) return;
      setLoadingStats(true);

      const [ordersRes, addressesRes] = await Promise.all([
        api.get<CountResponse<unknown>>("/customer/order"),
        api.get<CountResponse<unknown>>("/customer/address"),
      ]);

      if (!mounted) return;

      if (ordersRes.success && ordersRes.data) {
        const data = ordersRes.data as CountResponse<unknown>;
        const itemsTotal = data.pagination?.total;
        setOrdersCount(typeof itemsTotal === "number" ? itemsTotal : data.items?.length || 0);
      }

      if (addressesRes.success && addressesRes.data) {
        const data = addressesRes.data as CountResponse<unknown>;
        const itemsTotal = data.pagination?.total;
        setAddressesCount(typeof itemsTotal === "number" ? itemsTotal : data.items?.length || 0);
      }

      setLoadingStats(false);
    }

    fetchStats();
    return () => {
      mounted = false;
    };
  }, [token]);

  const showComingSoon = (feature: string) => {
    Alert.alert("Coming soon", `${feature} is coming in the next update.`);
  };

  const initials = (user?.name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const primaryMenu = useMemo<MenuItem[]>(
    () => [
      {
        key: "orders",
        icon: "bag-handle-outline",
        label: "My Orders",
        value: ordersCount > 0 ? String(ordersCount) : undefined,
        onPress: () => navigation.navigate("Orders"),
      },
      {
        key: "addresses",
        icon: "location-outline",
        label: "Manage Addresses",
        value: addressesCount > 0 ? String(addressesCount) : undefined,
        onPress: () => navigation.navigate("Addresses"),
      },
      {
        key: "wishlist",
        icon: "heart-outline",
        label: "Wishlist",
        onPress: () => showComingSoon("Wishlist"),
      },
      {
        key: "payments",
        icon: "card-outline",
        label: "Saved Payment Methods",
        onPress: () => showComingSoon("Saved Payment Methods"),
      },
    ],
    [addressesCount, navigation, ordersCount]
  );

  const supportMenu = useMemo<MenuItem[]>(
    () => [
      {
        key: "notifications",
        icon: "notifications-outline",
        label: "Notification Preferences",
        onPress: () => showComingSoon("Notification Preferences"),
      },
      {
        key: "help",
        icon: "help-circle-outline",
        label: "Help Center",
        onPress: () => showComingSoon("Help Center"),
      },
      {
        key: "privacy",
        icon: "shield-checkmark-outline",
        label: "Terms & Privacy",
        onPress: () => showComingSoon("Terms & Privacy"),
      },
    ],
    []
  );

  if (!token) {
    const openSignIn = () => {
      (
        navigation.getParent() as {
          getParent?: () => { navigate: (name: string) => void };
        }
      )
        ?.getParent?.()
        ?.navigate?.("Auth");
    };

    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person-outline" size={36} color={colors.primary} />
          </View>
          <Text style={styles.title}>Your Account</Text>
          <Text style={styles.subtitle}>Sign in to track orders, save addresses and get personalized offers.</Text>
          <Button title="Sign in" onPress={openSignIn} style={styles.btn} />
        </View>
      </SafeAreaView>
    );
  }

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: logout },
    ]);
  };

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity key={item.key} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.85}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIconWrap}>
          <Ionicons name={item.icon} size={17} color={colors.primary} />
        </View>
        <Text style={styles.menuLabel}>{item.label}</Text>
      </View>

      <View style={styles.menuRight}>
        {item.value ? <Text style={styles.menuValue}>{item.value}</Text> : null}
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Zaykaur Account</Text>

        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user?.name ?? "User"}</Text>
              <Text style={styles.email}>{user?.email ?? ""}</Text>
              <Text style={styles.memberTag}>Zaykaur Premium Member</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{loadingStats ? "..." : ordersCount}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{loadingStats ? "..." : addressesCount}</Text>
              <Text style={styles.statLabel}>Addresses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>24/7</Text>
              <Text style={styles.statLabel}>Support</Text>
            </View>
          </View>

          {loadingStats ? <ActivityIndicator color={colors.primary} style={{ marginTop: 8 }} /> : null}
        </View>

        <Text style={styles.sectionTitle}>Account & Orders</Text>
        {primaryMenu.map(renderMenuItem)}

        <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Support & Preferences</Text>
        {supportMenu.map(renderMenuItem)}

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <View style={styles.menuLeft}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="log-out-outline" size={17} color={colors.error} />
            </View>
            <Text style={styles.logoutText}>Sign out</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 18, paddingBottom: 100 },
  pageTitle: { ...typography.h2, color: colors.text, marginBottom: 12 },
  title: { ...typography.h2, color: colors.text },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: "center",
    maxWidth: 320,
  },
  btn: { marginTop: 22 },
  centered: { flex: 1, paddingHorizontal: 24, alignItems: "center", justifyContent: "center" },
  avatarLarge: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14,
  },
  profileTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...typography.h4, color: colors.white, fontWeight: "800" },
  name: { ...typography.h4, color: colors.text },
  email: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  memberTag: { ...typography.caption, color: colors.primary, marginTop: 4, fontWeight: "700" },

  statsRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  statCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statValue: { ...typography.h4, color: colors.text },
  statLabel: { ...typography.caption, color: colors.textMuted, marginTop: 2 },

  sectionTitle: { ...typography.label, color: colors.text, marginBottom: 8 },
  menuItem: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  menuIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { ...typography.bodySmall, color: colors.text, fontWeight: "600" },
  menuValue: { ...typography.caption, color: colors.primary, fontWeight: "700" },
  logoutItem: { marginTop: 12 },
  logoutText: { ...typography.bodySmall, color: colors.error, fontWeight: "700" },
});
