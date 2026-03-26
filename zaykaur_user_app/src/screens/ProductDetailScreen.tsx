import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../lib/api";
import type { ApiProduct, ApiProductVariant } from "../types/api";
import { useAuthStore } from "../store/authStore";
import { useCartApi } from "../hooks/useCartApi";
import { Button } from "../components/ui/Button";
import { formatPrice } from "../lib/formatPrice";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

type NavProps = NativeStackScreenProps<
  { ProductDetail: { slug: string } },
  "ProductDetail"
>;

function findVariantByAttributes(
  variants: ApiProductVariant[],
  attrs: Record<string, string>
): ApiProductVariant | null {
  if (!variants?.length || Object.keys(attrs).length === 0) return variants?.[0] ?? null;
  return (
    variants.find((variant) => {
      const variantAttrs = variant.attributes || {};
      return Object.entries(attrs).every(([key, value]) => variantAttrs[key] === value);
    }) ?? null
  );
}

export function ProductDetailScreen({ route, navigation }: NavProps) {
  const { slug } = route.params;
  const { width } = useWindowDimensions();
  const { token } = useAuthStore();
  const { addItem, refetch } = useCartApi();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchProduct = async () => {
      const res = await api.get<ApiProduct>(`/public/products/slug/${slug}`);
      if (cancelled) return;

      if (res.success && res.data) {
        const p = res.data as ApiProduct;
        setProduct(p);
        if (p.variantSelectors?.length) {
          const initial: Record<string, string> = {};
          p.variantSelectors.forEach((selector) => {
            const inStock = selector.options.find((o) => o.inStock);
            if (inStock) initial[selector.key] = inStock.value;
          });
          setSelectedAttributes(initial);
        }
      }
      setLoading(false);
    };

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const useSelectors = !!product?.variantSelectors?.length;
  const selectedVariant =
    useSelectors && product
      ? findVariantByAttributes(product.variants, selectedAttributes)
      : product?.variants?.[0] ?? null;

  const price = selectedVariant?.price ?? 0;
  const mrp = selectedVariant?.mrp ?? price;
  const stock = selectedVariant?.stock ?? 0;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const imageSrc =
    selectedVariant?.images?.[0]?.url ||
    product?.variants?.[0]?.images?.[0]?.url ||
    "https://via.placeholder.com/500";
  const horizontalInset = width >= 900 ? 44 : width >= 640 ? 24 : 14;
  const maxContentWidth = width >= 1040 ? 780 : width;
  const imageHeight = Math.max(240, Math.min(420, (width - horizontalInset * 2) * 1.02));

  const handleAddToCart = async () => {
    if (!selectedVariant || !product || stock < 1) return;
    if (!token) {
      Alert.alert("Sign in required", "Please sign in to add to cart.");
      return;
    }

    setAdding(true);
    const res = await addItem(product._id, {
      quantity: 1,
      ...(useSelectors && Object.keys(selectedAttributes).length > 0
        ? { variantAttributes: selectedAttributes }
        : { variantId: selectedVariant._id }),
    });
    setAdding(false);

    if (res.success) {
      refetch();
      Alert.alert("Added to cart", "Item has been added successfully.");
    } else {
      Alert.alert("Error", res.message || "Failed to add item");
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    (navigation.getParent() as { navigate?: (name: string) => void })?.navigate?.("CartTab");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingState}>
          <Text style={styles.errorText}>Product not found</Text>
          <Button title="Go back" onPress={() => navigation.goBack()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBarShell}>
        <View style={[styles.topBar, { paddingHorizontal: horizontalInset, maxWidth: maxContentWidth }]}>
          <TouchableOpacity style={styles.topIcon} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topIcon}>
            <Ionicons name="share-social-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.contentFrame, { paddingHorizontal: horizontalInset, maxWidth: maxContentWidth }]}>
          <View style={styles.imageWrap}>
            <Image source={{ uri: imageSrc }} style={[styles.image, { height: imageHeight }]} contentFit="cover" />
            {discount > 0 && (
              <View style={styles.discountTag}>
                <Text style={styles.discountText}>{discount}% OFF</Text>
              </View>
            )}
          </View>

          <View style={styles.content}>
            <Text style={styles.name}>{product.name}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(price)}</Text>
              {mrp > price && <Text style={styles.mrp}>{formatPrice(mrp)}</Text>}
              {discount > 0 && <Text style={styles.save}>You save {discount}%</Text>}
            </View>

            <View style={styles.assuranceRow}>
              <Text style={styles.assuranceItem}>✓ Assured quality</Text>
              <Text style={styles.assuranceItem}>✓ Easy returns</Text>
              <Text style={styles.assuranceItem}>✓ Fast delivery</Text>
            </View>

            {product.description ? <Text style={styles.description}>{product.description}</Text> : null}

            {product.variantSelectors?.map((selector) => (
              <View key={selector.key} style={styles.selectorBlock}>
                <Text style={styles.selectorLabel}>{selector.label}</Text>
                <View style={styles.optionsWrap}>
                  {selector.options.map((option) => {
                    const isActive = selectedAttributes[selector.key] === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.optionPill,
                          isActive && styles.optionPillActive,
                          !option.inStock && styles.optionPillDisabled,
                        ]}
                        onPress={() =>
                          option.inStock &&
                          setSelectedAttributes((prev) => ({ ...prev, [selector.key]: option.value }))
                        }
                        disabled={!option.inStock}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isActive && styles.optionTextActive,
                            !option.inStock && styles.optionTextDisabled,
                          ]}
                        >
                          {option.value}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBarShell}>
        <View style={[styles.bottomBarInner, { paddingHorizontal: horizontalInset, maxWidth: maxContentWidth }]}>
          <Button
            title="Add to cart"
            onPress={handleAddToCart}
            disabled={stock < 1}
            loading={adding}
            variant="outline"
            style={styles.bottomButton}
          />
          <Button
            title={stock < 1 ? "Out of stock" : "Buy now"}
            onPress={handleBuyNow}
            disabled={stock < 1}
            loading={adding}
            style={styles.bottomButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  topBarShell: {
    width: "100%",
    alignItems: "center",
  },
  topBar: {
    paddingTop: 8,
    paddingBottom: 6,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { ...typography.bodySmall, color: colors.textMuted },
  errorText: { ...typography.body, color: colors.error, marginBottom: 10 },

  scroll: { paddingBottom: 110 },
  contentFrame: {
    width: "100%",
    alignSelf: "center",
  },
  imageWrap: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { width: "100%" },
  discountTag: {
    position: "absolute",
    top: 14,
    left: 0,
    backgroundColor: colors.accent,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  discountText: { ...typography.caption, color: colors.white, fontWeight: "700" },

  content: { paddingHorizontal: 2, paddingTop: 14 },
  name: { ...typography.h2, color: colors.text, marginBottom: 8 },
  priceRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  price: { ...typography.h3, color: colors.primary },
  mrp: { ...typography.bodySmall, color: colors.textMuted, textDecorationLine: "line-through" },
  save: { ...typography.caption, color: colors.success, fontWeight: "700" },

  assuranceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 8,
    marginTop: 14,
    marginBottom: 10,
  },
  assuranceItem: { ...typography.caption, color: colors.textSecondary, fontWeight: "600" },

  description: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: 16, lineHeight: 20 },

  selectorBlock: { marginBottom: 16 },
  selectorLabel: { ...typography.label, color: colors.text, marginBottom: 8 },
  optionsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionPill: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionPillDisabled: { opacity: 0.5 },
  optionText: { ...typography.bodySmall, color: colors.text, fontWeight: "600" },
  optionTextActive: { color: colors.primary },
  optionTextDisabled: { color: colors.textMuted },

  bottomBarShell: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: "center",
  },
  bottomBarInner: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  bottomButton: { flex: 1 },
});
