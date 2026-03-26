import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { ProductDisplay } from "../../lib/productHelpers";
import { useAuthStore } from "../../store/authStore";
import { formatPrice } from "../../lib/formatPrice";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { shadows } from "../../theme/shadows";
import { api } from "../../lib/api";
import { emitCartUpdated } from "../../lib/events";

interface ProductCardProps {
  product: ProductDisplay;
  onPress: () => void;
  cardWidth?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function ProductCardComponent({ product, onPress, cardWidth }: ProductCardProps) {
  const { width } = useWindowDimensions();
  const { token } = useAuthStore();
  const scale = useSharedValue(1);

  const resolvedWidth = cardWidth ?? Math.max(158, Math.min(220, (width - 52) / 2));

  const {
    name,
    price,
    mrp,
    discount,
    images,
    categoryName,
    stock,
    rating = 4.2,
    variantId,
    id,
  } = product;

  const imageSrc = images?.[0] || "https://via.placeholder.com/300";

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleAddToCart = async () => {
    if (stock === 0) return;

    if (!token) {
      Alert.alert("Sign in required", "Please sign in to add to cart");
      return;
    }

    const res = await api.post<unknown>("/customer/cart", {
      productId: id,
      variantId,
      quantity: 1,
    });

    if (res.success) {
      emitCartUpdated();
      Alert.alert("Added", "Product added to cart");
    } else {
      Alert.alert("Error", res.message || "Failed to add to cart");
    }
  };

  return (
    <AnimatedTouchable
      entering={FadeInDown.duration(280)}
      activeOpacity={1}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      style={[styles.card, { width: resolvedWidth }, animatedStyle]}
    >
      <View style={[styles.imageWrap, { height: resolvedWidth * 1.05 }]}> 
        <Image source={{ uri: imageSrc }} style={styles.image} contentFit="cover" />

        <TouchableOpacity style={styles.wishlistBtn} activeOpacity={0.8}>
          <Ionicons name="heart-outline" size={16} color={colors.text} />
        </TouchableOpacity>

        {discount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>-{discount}%</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.category} numberOfLines={1}>
          {categoryName || "Trending"}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={11} color={colors.accent} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.stockText}>{stock > 0 ? "In stock" : "Out of stock"}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(price)}</Text>
          {mrp != null && mrp > price && <Text style={styles.mrp}>{formatPrice(mrp)}</Text>}
        </View>

        <Text style={styles.deliveryText}>Free delivery • 2-4 days</Text>

        <TouchableOpacity
          style={[styles.addBtn, stock === 0 && styles.addBtnDisabled]}
          onPress={handleAddToCart}
          disabled={stock === 0}
          activeOpacity={0.85}
        >
          <Ionicons name="bag-add-outline" size={14} color={colors.textOnPrimary} />
          <Text style={styles.addBtnText}>{stock === 0 ? "Unavailable" : "Add to cart"}</Text>
        </TouchableOpacity>
      </View>
    </AnimatedTouchable>
  );
}

export const ProductCard = memo(ProductCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    marginBottom: 16,
    overflow: "hidden",
    ...shadows.card,
  },
  imageWrap: {
    position: "relative",
    backgroundColor: colors.surfaceMuted,
  },
  image: { width: "100%", height: "100%" },
  wishlistBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 0,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 6,
  },
  category: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  name: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
    minHeight: 36,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.accentLight,
  },
  ratingText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "700",
  },
  stockText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  price: {
    ...typography.body,
    color: colors.text,
    fontWeight: "800",
  },
  mrp: {
    ...typography.caption,
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  deliveryText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: "600",
  },
  addBtn: {
    marginTop: 4,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: colors.primary,
  },
  addBtnDisabled: {
    backgroundColor: colors.textMuted,
  },
  addBtnText: {
    ...typography.caption,
    color: colors.textOnPrimary,
    fontWeight: "700",
  },
});
