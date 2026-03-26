import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { useAuthStore } from "../store/authStore";
import { ProductCard } from "../components/product/ProductCard";
import { Skeleton } from "../components/ui/Skeleton";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import type { HomeStackParamList } from "../navigation/HomeStack";
import { BannerCarousel } from "../components/home/BannerCarousel";

type HomeNav = NativeStackNavigationProp<HomeStackParamList, "Home">;

const CATEGORY_BG_COLORS = ["#EAF1FF", "#EAF9F4", "#FFF4E8", "#F2EEFF", "#FFEFF4", "#EAF6FF"];

function getCategoryIcon(name: string): keyof typeof Ionicons.glyphMap {
  const normalized = name.toLowerCase();

  if (
    normalized.includes("saree") ||
    normalized.includes("fashion") ||
    normalized.includes("women") ||
    normalized.includes("girls") ||
    normalized.includes("kurti")
  ) {
    return "shirt-outline";
  }
  if (normalized.includes("electronic") || normalized.includes("mobile") || normalized.includes("gadget")) {
    return "phone-portrait-outline";
  }
  if (normalized.includes("furniture") || normalized.includes("home") || normalized.includes("decor")) {
    return "bed-outline";
  }
  if (normalized.includes("beauty") || normalized.includes("makeup") || normalized.includes("care")) {
    return "sparkles-outline";
  }
  if (normalized.includes("kid") || normalized.includes("baby") || normalized.includes("toy")) {
    return "happy-outline";
  }
  if (normalized.includes("grocery") || normalized.includes("food")) {
    return "basket-outline";
  }

  return "grid-outline";
}

export function HomeScreen({ navigation }: { navigation: HomeNav }) {
  const { width } = useWindowDimensions();
  const { token, user } = useAuthStore();
  const { data: products, loading, refetch } = useProducts({ limit: 30 });
  const { data: categories, loading: catLoading } = useCategories({ level: 0 });

  const sidePadding = width < 380 ? 14 : 18;
  const columns = width >= 980 ? 4 : width >= 700 ? 3 : 2;
  const gridGap = 12;
  const gridCardWidth = (width - sidePadding * 2 - gridGap * (columns - 1)) / columns;
  const horizontalCardWidth = Math.max(158, Math.min(220, width * 0.45));

  const topProducts = useMemo(() => products.slice(0, 8), [products]);
  const recommendedProducts = useMemo(() => products.slice(0, columns * 4), [products, columns]);
  const visibleCategories = useMemo(() => categories.slice(0, 14), [categories]);

  const openSignIn = () => {
    (
      navigation.getParent() as {
        getParent?: () => { navigate: (name: string) => void };
      }
    )
      ?.getParent?.()
      ?.navigate?.("Auth");
  };

  const openShopTab = () => {
    (navigation.getParent() as { navigate?: (name: string) => void })?.navigate?.("ShopTab");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <View style={[styles.header, { paddingHorizontal: sidePadding }]}>
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoLetter}>Z</Text>
            </View>
            <View>
              <Text style={styles.brandName}>ZAYKAUR</Text>
              <Text style={styles.location}>Deliver to: {user?.name?.split(" ")[0] || "Guest"}</Text>
            </View>
          </View>

          {!token ? (
            <TouchableOpacity onPress={openSignIn} style={styles.signInBtn}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={openShopTab}
          style={[styles.searchBar, { marginHorizontal: sidePadding }]}
        >
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <Text style={styles.searchText}>Search for products, brands and more</Text>
        </TouchableOpacity>

        <BannerCarousel onPressBanner={openShopTab} />

        <View style={[styles.sectionHeader, { paddingHorizontal: sidePadding }]}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          <TouchableOpacity onPress={openShopTab}>
            <Text style={styles.sectionAction}>View all</Text>
          </TouchableOpacity>
        </View>

        {catLoading ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.categoryRow, { paddingHorizontal: sidePadding }]}
          >
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <View key={k} style={styles.categoryItem}>
                <Skeleton width={60} height={60} borderRadius={30} />
                <Skeleton width={52} height={10} style={{ marginTop: 8, borderRadius: 5 }} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.categoryRow, { paddingHorizontal: sidePadding }]}
          >
            {visibleCategories.map((cat, index) => (
              <TouchableOpacity
                key={cat._id}
                style={styles.categoryItem}
                onPress={openShopTab}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.categoryCircle,
                    { backgroundColor: CATEGORY_BG_COLORS[index % CATEGORY_BG_COLORS.length] },
                  ]}
                >
                  <Ionicons name={getCategoryIcon(cat.name)} size={24} color={colors.primary} />
                </View>
                <Text style={styles.categoryName} numberOfLines={2}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={[styles.sectionHeader, { paddingHorizontal: sidePadding }]}>
          <Text style={styles.sectionTitle}>Best Of The Day</Text>
          <TouchableOpacity onPress={openShopTab}>
            <Text style={styles.sectionAction}>Explore</Text>
          </TouchableOpacity>
        </View>

        {loading && topProducts.length === 0 ? (
          <View
            style={[
              styles.horizontalList,
              { paddingLeft: sidePadding, paddingRight: Math.max(6, sidePadding - 10) },
            ]}
          >
            {[1, 2].map((i) => (
              <View key={i} style={{ width: horizontalCardWidth, marginRight: 12 }}>
                <Skeleton width={horizontalCardWidth} height={horizontalCardWidth} borderRadius={16} />
                <Skeleton width="80%" height={14} style={{ marginTop: 8 }} />
                <Skeleton width="60%" height={12} style={{ marginTop: 6 }} />
              </View>
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.horizontalList,
              { paddingLeft: sidePadding, paddingRight: Math.max(6, sidePadding - 10) },
            ]}
          >
            {topProducts.map((product) => (
              <View key={product.id} style={{ marginRight: 12 }}>
                <ProductCard
                  product={product}
                  cardWidth={horizontalCardWidth}
                  onPress={() => navigation.navigate("ProductDetail", { slug: product.slug })}
                />
              </View>
            ))}
          </ScrollView>
        )}

        <Text style={[styles.sectionTitle, { marginHorizontal: sidePadding }]}>Recommended For You</Text>
        <View style={[styles.grid, { gap: gridGap, paddingHorizontal: sidePadding }]}>
          {recommendedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cardWidth={gridCardWidth}
              onPress={() => navigation.navigate("ProductDetail", { slug: product.slug })}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 96 },
  header: {
    paddingTop: 14,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    ...typography.h4,
    color: colors.white,
    fontWeight: "800",
  },
  brandName: {
    ...typography.h4,
    color: colors.text,
    letterSpacing: 0.5,
  },
  location: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
  signInBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  signInText: {
    ...typography.caption,
    color: colors.textOnPrimary,
    fontWeight: "700",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchBar: {
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchText: { ...typography.bodySmall, color: colors.textMuted },
  sectionHeader: {
    marginBottom: 8,
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 10,
  },
  sectionAction: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "700",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingBottom: 18,
    gap: 6,
  },
  categoryItem: {
    alignItems: "center",
    width: 72,
  },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 15,
  },
  horizontalList: {
    marginBottom: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
