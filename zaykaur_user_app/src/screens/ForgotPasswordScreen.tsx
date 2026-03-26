import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import { colors, gradients } from "../theme/colors";
import { typography } from "../theme/typography";
import type { AuthStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setError("");
    setLoading(true);

    const res = await api.post("/auth/forgot-password", { email: email.trim() });

    setLoading(false);

    if (res.success) {
      setSent(true);
    } else {
      setError(res.message || "Something went wrong");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={gradients.hero} style={styles.brandCard}>
          <Text style={styles.brandTitle}>Reset Password</Text>
          <Text style={styles.brandSubtitle}>
            Enter your email and we'll send you a reset link.
          </Text>
        </LinearGradient>

        <View style={styles.formCard}>
          {sent ? (
            <View style={styles.sentContainer} accessibilityRole="alert">
              <Text style={styles.sentTitle}>Check your email</Text>
              <Text style={styles.sentText}>
                If an account exists for {email}, you'll receive a password reset link shortly.
              </Text>
              <Button
                title="Back to Sign In"
                onPress={() => navigation.navigate("SignIn")}
                style={styles.btn}
              />
            </View>
          ) : (
            <>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Email address"
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button
                title="Send Reset Link"
                onPress={handleSubmit}
                loading={loading}
                style={styles.btn}
              />
              <Button
                title="Back to Sign In"
                onPress={() => navigation.navigate("SignIn")}
                variant="ghost"
                style={styles.secondaryBtn}
              />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: 18, justifyContent: "center" },
  brandCard: {
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  brandTitle: { ...typography.h2, color: colors.white },
  brandSubtitle: {
    ...typography.bodySmall,
    color: "rgba(255,255,255,0.92)",
    marginTop: 4,
  },
  formCard: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  error: { ...typography.caption, color: colors.error, marginBottom: 8 },
  btn: { marginTop: 6 },
  secondaryBtn: { marginTop: 10 },
  sentContainer: { alignItems: "center", paddingVertical: 16 },
  sentTitle: { ...typography.h3, color: colors.text, marginBottom: 12 },
  sentText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
});
