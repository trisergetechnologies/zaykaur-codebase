import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: { backgroundColor: colors.primary },
      text: { color: colors.white },
    },
    secondary: {
      container: { backgroundColor: colors.backgroundSecondary },
      text: { color: colors.text },
    },
    outline: {
      container: { backgroundColor: "transparent", borderWidth: 2, borderColor: colors.primary },
      text: { color: colors.primary },
    },
    ghost: {
      container: { backgroundColor: "transparent" },
      text: { color: colors.primary },
    },
  };

  const v = variantStyles[variant];

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
      style={[styles.base, v.container, disabled && styles.disabled, style, animatedStyle]}
    >
      {loading ? (
        <ActivityIndicator color={v.text.color} size="small" />
      ) : (
        <Text style={[styles.text, v.text, textStyle]}>{title}</Text>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  disabled: { opacity: 0.6 },
  text: {
    ...typography.button,
  },
});
