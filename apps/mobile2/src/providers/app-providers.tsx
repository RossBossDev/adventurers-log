import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { type ReactNode, useState } from "react";
import { Text, View } from "react-native";

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
      <View className="flex-1 justify-center bg-slate-950 px-6">
        <Text className="text-lg font-bold text-red-300">
          Could not prepare local data.
        </Text>
        <Text className="mt-2 text-base text-slate-300">{error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View className="flex-1 justify-center bg-slate-950 px-6">
        <Text className="text-lg font-semibold text-slate-100">
          Preparing Adventurers&apos; Log…
        </Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
