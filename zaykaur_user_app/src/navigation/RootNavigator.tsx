import React, { useEffect, useState } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  Theme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useAuthStore } from "../store/authStore";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

// Guest browsing: Main is initial; Auth is pushed when user taps Sign in (Cart/Account/Home).

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const appNavTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

function SplashScreen() {
  return (
    <View style={styles.splashWrap}>
      <View style={styles.brandCircle}>
        <Text style={styles.brandLetter}>Z</Text>
      </View>
      <Text style={styles.brandText}>Zaykaur</Text>
      <ActivityIndicator color={colors.primary} style={{ marginTop: 10 }} />
    </View>
  );
}

export function RootNavigator() {
  const { loadUser } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadUser().finally(() => setHydrated(true));
  }, [loadUser]);

  if (!hydrated) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={appNavTheme}>
      <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Auth" component={AuthStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  brandCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  brandLetter: {
    ...typography.h2,
    color: colors.white,
    fontWeight: "800",
  },
  brandText: {
    ...typography.h2,
    color: colors.text,
  },
});
