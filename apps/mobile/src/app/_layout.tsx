import "./global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "../providers/app-providers";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#14110d" },
          headerStyle: { backgroundColor: "#14110d" },
          headerTintColor: "#f5ead2",
          headerTitleStyle: { fontWeight: "800" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-in" options={{ title: "Sign In" }} />
        <Stack.Screen name="auth/sign-up" options={{ title: "Sign Up" }} />
        <Stack.Screen
          name="auth/my-accounts"
          options={{ title: "My Accounts" }}
        />
      </Stack>
      <StatusBar style="light" />
    </AppProviders>
  );
}
