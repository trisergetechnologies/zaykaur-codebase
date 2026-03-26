import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import type { ApiCartItem } from "../../types/api";
import { useCartApi } from "../../hooks/useCartApi";
import { formatPrice } from "../../lib/formatPrice";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

interface CartItemProps {
  item: ApiCartItem;
  onQuantityChange?: () => void;
}

export function CartItem({ item, onQuantityChange }: CartItemProps) {
  const { removeItem, addItem } = useCartApi(false);
  const [updating, setUpdating] = React.useState(false);
  const productId = typeof item.productId === "object" ? item.productId?._id : item.productId;
  const name = item.name || (typeof item.productId === "object" ? item.productId?.name : "") || "Product";
  const price = item.unitPrice ?? 0;
  const qty = item.quantity ?? 1;
  const subtotal = price * qty;
  const image = item.image || "https://via.placeholder.com/100";

  const handleRemove = () => {
    Alert.alert("Remove item", `Remove ${name} from cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          if (productId) {
            await removeItem(productId, item.variantId);
            onQuantityChange?.();
          }
        },
      },
    ]);
  };

  const handleIncrement = async () => {
    if (!productId || updating) return;
    setUpdating(true);
    await addItem(productId, { variantId: item.variantId, quantity: 1 });
    onQuantityChange?.();
    setUpdating(false);
  };

  const handleDecrement = async () => {
    if (!productId || updating) return;
    if (qty <= 1) {
      handleRemove();
      return;
    }
    setUpdating(true);
    await removeItem(productId, item.variantId);
    if (qty > 1) {
      await addItem(productId, { variantId: item.variantId, quantity: qty - 1 });
    }
    onQuantityChange?.();
    setUpdating(false);
  };

  return (
    <View style={styles.card} accessibilityLabel={`${name}, quantity ${qty}, ${formatPrice(subtotal)}`}>
      <Image source={{ uri: image }} style={styles.image} contentFit="cover" accessibilityLabel={name} />
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.price}>{formatPrice(price)}</Text>
          <Text style={styles.subtotal}>{formatPrice(subtotal)}</Text>
        </View>

        <View style={styles.qtyRow}>
          <TouchableOpacity
            onPress={handleDecrement}
            style={styles.qtyBtn}
            disabled={updating}
            accessibilityLabel="Decrease quantity"
            accessibilityRole="button"
          >
            <Ionicons name="remove" size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity
            onPress={handleIncrement}
            style={styles.qtyBtn}
            disabled={updating}
            accessibilityLabel="Increase quantity"
            accessibilityRole="button"
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <TouchableOpacity onPress={handleRemove} style={styles.remove} accessibilityLabel="Remove from cart" accessibilityRole="button">
            <Ionicons name="trash-outline" size={14} color={colors.error} />
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { width: 84, height: 84, borderRadius: 10, backgroundColor: colors.surfaceMuted },
  details: { flex: 1, marginLeft: 12, justifyContent: "space-between" },
  name: { ...typography.bodySmall, fontWeight: "600", color: colors.text },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { ...typography.caption, color: colors.textSecondary },
  subtotal: { ...typography.bodySmall, fontWeight: "700", color: colors.primary },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 2 },
  qtyBtn: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: colors.border, justifyContent: "center", alignItems: "center" },
  qtyText: { ...typography.bodySmall, fontWeight: "700", color: colors.text, minWidth: 28, textAlign: "center" },
  remove: { flexDirection: "row", alignItems: "center", gap: 4 },
  removeText: { ...typography.caption, color: colors.error, fontWeight: "600" },
});
