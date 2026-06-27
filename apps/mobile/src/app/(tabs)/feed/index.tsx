import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, View } from "react-native";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Screen } from "../../../components/ui/screen";
import { Text } from "../../../components/ui/text";
import { listTrackedPlayers } from "../../../db/tracked-players.repository";
import { route } from "../../../lib/routes";
import { useMockAuthStore } from "../../../store/mock-auth.store";

export const trackedAccountsQueryKey = ["tracked-players"] as const;

export default function FeedScreen() {
  const trackedAccountsQuery = useQuery({
    queryKey: trackedAccountsQueryKey,
    queryFn: listTrackedPlayers,
  });
  const trackedAccounts = trackedAccountsQuery.data ?? [];
  const isAuthenticated = useMockAuthStore((state) => state.isAuthenticated);
  const signOut = useMockAuthStore((state) => state.signOut);
  const viewAsLoggedInUser = useMockAuthStore(
    (state) => state.viewAsLoggedInUser,
  );

  return (
    <Screen>
      <FlatList
        contentContainerStyle={{
          backgroundColor: "#14110d",
          flexGrow: 1,
          gap: 16,
          paddingHorizontal: 20,
          paddingVertical: 32,
        }}
        data={trackedAccounts}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View className="gap-6">
            <View className="gap-3">
              <Text className="text-al-card-light" variant="label">
                Public activity feed
              </Text>
              <Text variant="display">Adventurers&apos; Log</Text>
              <Text variant="subtitle">
                Follow OSRS Accounts locally to build a public activity feed on
                this device. No Adventurers&apos; Log User account is required.
              </Text>
            </View>

            <Card className="gap-3" variant="dark">
              <Text className="text-al-cream" variant="title">
                Scaffold auth
              </Text>
              <Text className="text-al-cream/85" variant="body">
                Current state: {isAuthenticated ? "logged in" : "anonymous"}.
                Toggle this to browse gated Goals, Friends, and You screens.
              </Text>
              <Button
                onPress={isAuthenticated ? signOut : viewAsLoggedInUser}
                variant={isAuthenticated ? "danger" : "outline"}
              >
                {isAuthenticated
                  ? "View as anonymous"
                  : "View as logged in user"}
              </Button>
            </Card>

            {trackedAccountsQuery.error ? (
              <Card className="border-al-error bg-al-error-bg" variant="cream">
                <Text variant="error">
                  {trackedAccountsQuery.error.message}
                </Text>
              </Card>
            ) : null}

            {trackedAccounts.length > 0 ? (
              <Button
                onPress={() => router.push(route("/feed/follow-account"))}
              >
                Follow more OSRS accounts
              </Button>
            ) : null}

            <View className="flex-row items-center justify-between">
              <Text className="text-al-cream" variant="title">
                Feed
              </Text>
              {trackedAccountsQuery.isFetching ? (
                <ActivityIndicator color="#d5c08f" />
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          trackedAccountsQuery.isLoading ? (
            <Card variant="dark">
              <Text className="text-al-cream">Loading followed accounts…</Text>
            </Card>
          ) : (
            <Card className="gap-4" variant="dark">
              <Text className="text-al-cream" variant="title">
                Follow an OSRS account to begin.
              </Text>
              <Text className="text-al-cream/85" variant="body">
                Adventurers&apos; Log will show scaffold activity here, such as
                when you start following an account and while the app waits for
                new activity.
              </Text>
              <Button
                onPress={() => router.push(route("/feed/follow-account"))}
              >
                Follow an OSRS account
              </Button>
            </Card>
          )
        }
        renderItem={({ item }) => (
          <Card className="gap-3" variant="cream">
            <Text variant="label">OSRS Account</Text>
            <Text variant="title">{item.normalizedUsername}</Text>
            <Text variant="body">
              You started following {item.displayName}.
            </Text>
            <Text variant="muted">
              Waiting for new activity from {item.normalizedUsername}.
            </Text>
            <View className="flex-row gap-3">
              <Button
                className="flex-1 px-3 py-2"
                onPress={() =>
                  router.push(route(`/feed/accounts/${item.id.toString()}`))
                }
                textClassName="text-sm"
                variant="outline"
              >
                Account Profile
              </Button>
              <Button
                className="flex-1 px-3 py-2"
                onPress={() =>
                  router.push(
                    route(`/feed/events/follow-${item.id.toString()}`),
                  )
                }
                textClassName="text-sm"
                variant="ghost"
              >
                Event Detail
              </Button>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}
