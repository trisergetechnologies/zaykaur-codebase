import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { ProductCard } from "../components/product/ProductCard";
import { Skeleton } from "../components/ui/Skeleton";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import type { ShopStackParamList } from "../navigation/ShopStack";

type ShopNav = NativeStackNavigationProp<ShopStackParamList, "Shop">;

export function ShopScreen({ navigation }: { navigation: ShopNav }) {
  const { width } = useWindowDimensions();
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: products, loading, error, refetch } = useProducts({
    page: 1,
    limit: 36,
    category,
    search: debouncedSearch || undefined,
  });
  const { data: categories } = useCategories({ level: 0 });

  const categoryItems = useMemo(() => categories.slice(0, 16), [categories]);
  const filterItems = useMemo(
    () => [{ _id: "__all", name: "All" }, ...categoryItems.map((cat) => ({ _id: cat._id, name: cat.name }))],
    [categoryItems]
  );

  const columns = width >= 980 ? 4 : width >= 700 ? 3 : width < 350 ? 1 : 2;
  const sidePadding = width < 380 ? 12 : 18;
  const gridGap = width < 380 ? 10 : 12;
  const cardWidth = Math.max(148, (width - sidePadding * 2 - gridGap * (columns - 1)) / columns);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={[styles.header, { paddingHorizontal: sidePadding }]}>
        <View>
          <Text style={styles.title}>Zaykaur Store</Text>
          <Text style={styles.subtitle}>Curated fashion, lifestyle and essentials</Text>
        </View>
        <TouchableOpacity style={styles.filterIcon}>
          <Ionicons name="options-outline" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchWrap, { marginHorizontal: sidePadding }]}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products, brands..."
          placeholderTextColor={colors.textMuted}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.filterRow, { paddingHorizontal: sidePadding }]}
      >
        {filterItems.map((item) => {
          const isAll = item._id === "__all";
          const isActive = isAll ? !category : category === item._id;
          return (
            <TouchableOpacity
              key={item._id}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setCategory(isAll ? undefined : item._id)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retry}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          key={`cols-${columns}`}
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={columns}
          columnWrapperStyle={columns > 1 ? styles.row : undefined}
          contentContainerStyle={[styles.list, { paddingHorizontal: sidePadding }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading && products.length === 0}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            loading ? (
              <View style={[styles.skeletonGrid, { gap: gridGap }]}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <View key={i} style={{ width: cardWidth }}>
                    <Skeleton width={cardWidth} height={cardWidth * 1.05} borderRadius={16} />
                    <Skeleton width="70%" height={14} style={{ marginTop: 8 }} />
                    <Skeleton width="50%" height={12} style={{ marginTop: 6 }} />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.centered}>
                <Text style={styles.empty}>No products found</Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              cardWidth={cardWidth}
              onPress={() => navigation.navigate("ProductDetail", { slug: item.slug })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.textMuted, marginTop: 2 },
  filterIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchWrap: {
    marginHorizontal: 18,
    marginTop: 6,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.text,
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 14,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterChipTextActive: { color: colors.white },
  list: { paddingHorizontal: 18, paddingBottom: 96 },
  row: { justifyContent: "space-between" },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  centered: { paddingVertical: 50, alignItems: "center" },
  error: { ...typography.bodySmall, color: colors.error, marginBottom: 12 },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retry: { ...typography.caption, color: colors.white, fontWeight: "700" },
  empty: { ...typography.bodySmall, color: colors.textMuted },
});
