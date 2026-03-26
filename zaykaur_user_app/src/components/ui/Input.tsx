import React from "react";
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.background,
  },
  inputError: { borderColor: colors.error },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
  },
});
