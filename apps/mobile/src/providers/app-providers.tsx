import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { type ReactNode, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { db } from "../db/client";
import migrations from "../db/migrations";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={styles.centeredScreen}>
        <Text style={styles.errorTitle}>Could not prepare local data.</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={styles.centeredScreen}>
        <Text style={styles.loadingTitle}>
          Preparing Adventurers&apos; Log…
        </Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  centeredScreen: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#020617",
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fca5a5",
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 16,
    color: "#cbd5e1",
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f1f5f9",
  },
});
