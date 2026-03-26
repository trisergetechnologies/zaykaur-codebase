import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { useCartApi } from "../hooks/useCartApi";
import { CartItem } from "../components/cart/CartItem";
import { OrderSummary } from "../components/cart/OrderSummary";
import { Button } from "../components/ui/Button";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import type { CartStackParamList } from "../navigation/CartStack";

type CartNav = NativeStackNavigationProp<CartStackParamList, "Cart">;

export function CartScreen({ navigation }: { navigation: CartNav }) {
  const { token } = useAuthStore();
  const { cart, loading, refetch } = useCartApi();

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
          <View style={styles.iconCircle}>
            <Ionicons name="cart-outline" size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>Sign in to view your cart</Text>
          <Text style={styles.subtitle}>Items you add will be saved to your account.</Text>
          <Button title="Sign in" onPress={openSignIn} style={styles.btn} />
        </View>
      </SafeAreaView>
    );
  }

  const items = cart?.items ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        <Text style={styles.subtitle}>{items.length === 0 ? "No items" : `${items.length} item(s)`}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={loading && items.length === 0}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {items.length === 0 && !loading ? (
          <View style={styles.centered}>
            <View style={styles.iconCircle}>
              <Ionicons name="bag-handle-outline" size={28} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>Looks like you have not added products yet.</Text>
            <Button
              title="Start shopping"
              onPress={() => (navigation.getParent() as { navigate?: (name: string) => void })?.navigate?.("ShopTab")}
              style={styles.btn}
            />
          </View>
        ) : (
          <>
            {items.map((item) => {
              const productId =
                typeof item.productId === "object" ? item.productId?._id : item.productId;
              return <CartItem key={productId + (item.variantId ?? "")} item={item} />;
            })}
            {items.length > 0 && (
              <OrderSummary onCheckout={() => navigation.navigate("Checkout")} />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.textMuted, marginTop: 4 },
  scroll: { paddingHorizontal: 18, paddingBottom: 96 },
  centered: { alignItems: "center", paddingTop: 50, paddingHorizontal: 20 },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: 6 },
  emptySub: { ...typography.bodySmall, color: colors.textMuted, textAlign: "center" },
  btn: { marginTop: 18 },
});
