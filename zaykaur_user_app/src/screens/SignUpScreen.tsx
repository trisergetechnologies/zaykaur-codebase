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

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: Props) {
  const { setToken, setUser, loadUser } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError("Name, email and password are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setLoading(true);

    const res = await api.post<{
      token: string;
      user: { _id: string; id?: string; name: string; email: string; role: string };
    }>("/auth/register", {
      name: name.trim(),
      email: email.trim(),
      password,
    });

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
      setError(res.message || "Registration failed");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={gradients.hero} style={styles.brandCard}>
          <Text style={styles.brandTitle}>Create your account</Text>
          <Text style={styles.brandSubtitle}>Get personalized deals and faster checkout.</Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <Input label="Name" value={name} onChangeText={setName} placeholder="Your name" />
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
            placeholder="At least 6 characters"
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Sign Up" onPress={handleSignUp} loading={loading} style={styles.btn} />
          <Button
            title="Already have an account? Sign In"
            onPress={() => navigation.navigate("SignIn")}
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
