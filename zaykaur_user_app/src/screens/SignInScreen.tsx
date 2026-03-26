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
import { useAuthStore } from "../store/authStore";
import { api } from "../lib/api";
import { colors, gradients } from "../theme/colors";
import { typography } from "../theme/typography";
import type { AuthStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<AuthStackParamList, "SignIn">;

export function SignInScreen({ navigation }: Props) {
  const { setToken, setUser, loadUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    setError("");
    setLoading(true);

    const res = await api.post<{
      token: string;
      user: { _id: string; id?: string; name: string; email: string; role: string };
    }>("/auth/login", { email: email.trim(), password });

    setLoading(false);

    if (res.success && res.data?.token) {
      setToken(res.data.token);
      setUser({
        id: res.data.user?.id ?? res.data.user?._id ?? "",
        name: res.data.user?.name ?? "",
        email: res.data.user?.email ?? "",
        role: res.data.user?.role ?? "customer",
      });
      loadUser();
      (navigation.getParent() as { goBack?: () => void })?.goBack?.();
    } else {
      setError(res.message || "Login failed");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={gradients.hero} style={styles.brandCard}>
          <Text style={styles.brandTitle}>Welcome back</Text>
          <Text style={styles.brandSubtitle}>Sign in to continue shopping smarter.</Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Sign In" onPress={handleSignIn} loading={loading} style={styles.btn} />
          <Button
            title="Forgot Password?"
            onPress={() => navigation.navigate("ForgotPassword")}
            variant="ghost"
            style={styles.secondaryBtn}
          />
          <Button
            title="Create account"
            onPress={() => navigation.navigate("SignUp")}
            variant="ghost"
            style={styles.secondaryBtn}
          />
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
});
