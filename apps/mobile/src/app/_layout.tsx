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
          headerShown: false,
        }}
      />
      <StatusBar style="light" />
    </AppProviders>
  );
}
