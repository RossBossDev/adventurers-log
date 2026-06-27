import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { type ReactNode, useState } from "react";
import { View } from "react-native";

import { Card } from "../components/ui/card";
import { Screen } from "../components/ui/screen";
import { Text } from "../components/ui/text";
import { db } from "../db/client";
import migrations from "../db/migrations";
import { useAppFonts } from "../theme/fonts";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  const { success, error: migrationError } = useMigrations(db, migrations);
  const [fontsLoaded, fontError] = useAppFonts();
  const setupError = migrationError ?? fontError;

  if (setupError) {
    return (
      <Screen className="justify-center px-6">
        <Card className="gap-3" variant="cream">
          <Text variant="title">Could not prepare your logbook.</Text>
          <Text variant="error">{setupError.message}</Text>
        </Card>
      </Screen>
    );
  }

  if (!success || !fontsLoaded) {
    return (
      <Screen className="justify-center px-6">
        <View className="gap-3">
          <Text className="text-center" variant="display">
            Adventurers&apos; Log
          </Text>
          <Text className="text-center" variant="subtitle">
            Preparing your notebook…
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
