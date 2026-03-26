import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useCartApi } from "../../hooks/useCartApi";
import { formatPrice } from "../../lib/formatPrice";
import { Button } from "../ui/Button";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

interface OrderSummaryProps {
  onCheckout: () => void;
}

export function OrderSummary({ onCheckout }: OrderSummaryProps) {
  const { cart, loading } = useCartApi();

  if (loading || !cart) return null;

  const itemsTotal = cart.itemsTotal ?? 0;
  const taxTotal = cart.taxTotal ?? 0;
  const shipping = cart.shippingEstimate ?? 0;
  const total = cart.grandTotal ?? 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Price Details</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>{formatPrice(itemsTotal)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Shipping</Text>
        <Text style={[styles.value, shipping === 0 && styles.freeText]}>
          {shipping === 0 ? "Free" : formatPrice(shipping)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Tax</Text>
        <Text style={styles.value}>{formatPrice(taxTotal)}</Text>
      </View>

      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>{formatPrice(total)}</Text>
      </View>

      <Button title="Proceed to Checkout" onPress={onCheckout} style={styles.btn} />
      <Text style={styles.note}>Secure checkout • Fast delivery</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { ...typography.h4, color: colors.text, marginBottom: 14 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { ...typography.bodySmall, color: colors.textSecondary },
  value: { ...typography.bodySmall, fontWeight: "700", color: colors.text },
  freeText: { color: colors.success },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { ...typography.h4, color: colors.text },
  totalValue: { ...typography.h4, color: colors.primary },
  btn: { marginTop: 14 },
  note: { ...typography.caption, color: colors.textMuted, textAlign: "center", marginTop: 8 },
});
