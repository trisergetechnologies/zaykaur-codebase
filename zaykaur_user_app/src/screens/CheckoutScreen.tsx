import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/authStore";
import { useCartApi } from "../hooks/useCartApi";
import { api } from "../lib/api";
import { formatPrice } from "../lib/formatPrice";
import { Button } from "../components/ui/Button";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import type { ApiAddress } from "../types/api";
import type { CartStackParamList } from "../navigation/CartStack";

type CheckoutNav = NativeStackNavigationProp<CartStackParamList, "Checkout">;

export function CheckoutScreen({ navigation }: { navigation: CheckoutNav }) {
  const { token, user, loadUser } = useAuthStore();
  const { cart, loading: cartLoading, refetch: refetchCart } = useCartApi();
  const [addressIndex, setAddressIndex] = useState(0);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (token) loadUser();
  }, [token, loadUser]);

  useEffect(() => {
    if (!token) {
      navigation.goBack();
    }
  }, [token, navigation]);

  if (!token) return null;

  const addresses = user?.addresses ?? [];
  const canPlaceOrder =
    cart && cart.items?.length > 0 && addresses.length > 0;

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder) return;
    setPlacing(true);
    const res = await api.post<{ _id: string; orderNumber: string }>(
      "/customer/order",
      { addressIndex, paymentMethod: "cod" }
    );
    setPlacing(false);
    if (res.success && res.data) {
      refetchCart();
      Alert.alert("Order placed", `Order ${res.data.orderNumber} placed successfully.`, [
        { text: "OK", onPress: () => navigation.navigate("Cart") },
      ]);
    } else {
      Alert.alert("Error", res.message || "Failed to place order");
    }
  };

  if (cartLoading || !cart) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading checkout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!cart.items?.length) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Button
            title="Back to Cart"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.subtitle}>
          Select delivery address and place order.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {addresses.length === 0 ? (
            <Text style={styles.muted}>
              No saved addresses. Add one in Account → Addresses.
            </Text>
          ) : (
            addresses.map((addr: ApiAddress & { isDefault?: boolean }, i: number) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.addressCard,
                  addressIndex === i && styles.addressCardActive,
                ]}
                onPress={() => setAddressIndex(i)}
              >
                <Text style={styles.addressName}>{addr.fullName}</Text>
                {addr.phone ? (
                  <Text style={styles.addressLine}>{addr.phone}</Text>
                ) : null}
                <Text style={styles.addressLine}>
                  {[addr.street, addr.city, addr.state, addr.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
                {addr.isDefault && (
                  <Text style={styles.defaultBadge}>Default</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Total</Text>
          <Text style={styles.grandTotal}>
            {formatPrice(cart.grandTotal ?? 0)}
          </Text>
        </View>

        <Button
          title="Place order (COD)"
          onPress={handlePlaceOrder}
          disabled={!canPlaceOrder}
          loading={placing}
          style={styles.placeBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  back: { padding: 16, paddingTop: 8 },
  backText: { ...typography.body, color: colors.primary, fontWeight: "600" },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { ...typography.h1, color: colors.text, marginBottom: 8 },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: 12 },
  addressCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 10,
  },
  addressCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  addressName: { ...typography.body, fontWeight: "600", color: colors.text },
  addressLine: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  defaultBadge: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 6,
    fontWeight: "600",
  },
  muted: { ...typography.bodySmall, color: colors.textMuted },
  grandTotal: { ...typography.h2, color: colors.primary },
  placeBtn: { marginTop: 24 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { ...typography.body, color: colors.textSecondary, marginTop: 12 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: 16 },
});
