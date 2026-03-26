import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { api } from "../lib/api";
import type { ApiOrder } from "../types/api";
import { formatPrice } from "../lib/formatPrice";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import type { AccountStackParamList } from "../navigation/AccountStack";

type Props = NativeStackScreenProps<AccountStackParamList, "Orders">;

export function OrdersScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await api.get<{ items: ApiOrder[] }>("/customer/order");
    setLoading(false);
    if (res.success && res.data) {
      const list = Array.isArray((res.data as { items?: ApiOrder[] }).items)
        ? (res.data as { items: ApiOrder[] }).items
        : [];
      setOrders(list);
    } else {
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>My Orders</Text>
      {loading && orders.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchOrders}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No orders yet</Text>
              <Text style={styles.emptySub}>Your orders will appear here.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.status}>{item.orderStatus}</Text>
                <Text style={styles.total}>{formatPrice(item.grandTotal)}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  back: { padding: 16, paddingTop: 8 },
  backText: { ...typography.body, color: colors.primary, fontWeight: "600" },
  title: { ...typography.h1, color: colors.text, marginHorizontal: 20, marginBottom: 16 },
  list: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  orderNumber: { ...typography.body, fontWeight: "700", color: colors.text },
  date: { ...typography.bodySmall, color: colors.textSecondary },
  status: { ...typography.bodySmall, color: colors.primary, textTransform: "capitalize" },
  total: { ...typography.body, fontWeight: "600", color: colors.text },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { paddingVertical: 48, alignItems: "center" },
  emptyText: { ...typography.h3, color: colors.text, marginBottom: 8 },
  emptySub: { ...typography.bodySmall, color: colors.textMuted },
});
