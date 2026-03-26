import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  imageUrl: string;
}

interface BannerCarouselProps {
  onPressBanner?: () => void;
  height?: number;
}

const BANNERS: BannerItem[] = [
  {
    id: "sale-1",
    title: "Big Fashion Festival",
    subtitle: "Style-first picks with up to 70% off",
    cta: "Shop fashion",
    imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80",
  },
  {
    id: "sale-2",
    title: "Electronics Bonanza",
    subtitle: "Top gadgets at unbeatable prices",
    cta: "Explore deals",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
  },
  {
    id: "sale-3",
    title: "Beauty & Lifestyle",
    subtitle: "Premium brands, curated for Zaykaur",
    cta: "View collection",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80",
  },
];

export function BannerCarousel({ onPressBanner, height = 176 }: BannerCarouselProps) {
  const { width } = useWindowDimensions();
  const pageWidth = width;
  const cardWidth = Math.max(280, Math.min(860, width - 36));
  const listRef = useRef<FlatList<BannerItem>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const data = useMemo(() => BANNERS, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % data.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [data.length]);

  useEffect(() => {
    listRef.current?.scrollToOffset({
      offset: activeIndex * pageWidth,
      animated: true,
    });
  }, [activeIndex, pageWidth]);

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    if (index >= 0 && index < data.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View>
      <FlatList
        ref={listRef}
        data={data}
        horizontal
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, index) => ({
          length: pageWidth,
          offset: pageWidth * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={[styles.page, { width: pageWidth }]}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onPressBanner}
              style={[styles.card, { width: cardWidth, height }]}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
              <LinearGradient
                colors={["rgba(16,24,40,0.06)", "rgba(16,24,40,0.78)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
                <View style={styles.ctaPill}>
                  <Text style={styles.ctaText}>{item.cta}</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.dotsRow}>
        {data.map((dot, index) => (
          <View
            key={dot.id}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    alignItems: "center",
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
  },
  title: {
    ...typography.h3,
    color: colors.white,
  },
  subtitle: {
    ...typography.bodySmall,
    color: "rgba(255,255,255,0.94)",
    marginTop: 4,
  },
  ctaPill: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  ctaText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "700",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    marginBottom: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 16,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
});
