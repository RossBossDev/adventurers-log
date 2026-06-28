import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";

import { type FeedEvent, fetchFeedEvents } from "../../../api/feed";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Screen } from "../../../components/ui/screen";
import { Text } from "../../../components/ui/text";
import { listTrackedPlayers } from "../../../db/tracked-players.repository";
import { route } from "../../../lib/routes";

export const trackedAccountsQueryKey = ["tracked-players"] as const;

export default function FeedScreen() {
  const trackedAccountsQuery = useQuery({
    queryKey: trackedAccountsQueryKey,
    queryFn: listTrackedPlayers,
  });
  const trackedAccounts = trackedAccountsQuery.data ?? [];
  const trackedPlayerIds = trackedAccounts.map((account) => account.backendId);
  const hasTrackedAccounts = trackedAccounts.length > 0;

  const feedEventsQuery = useQuery({
    queryKey: ["feed-events", trackedPlayerIds],
    queryFn: () => fetchFeedEvents({ trackedPlayerIds }),
    enabled: hasTrackedAccounts,
  });
  const events = feedEventsQuery.data?.events ?? [];
  const isRefreshing =
    trackedAccountsQuery.isRefetching || feedEventsQuery.isRefetching;

  const refresh = async () => {
    await trackedAccountsQuery.refetch();

    if (hasTrackedAccounts) {
      await feedEventsQuery.refetch();
    }
  };

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
        data={events}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View className="gap-6">
            <View className="gap-3">
              <Text variant="display">Adventurers&apos; Activity</Text>
            </View>

            {trackedAccountsQuery.error ? (
              <Card className="border-al-error bg-al-error-bg" variant="cream">
                <Text variant="error">
                  {trackedAccountsQuery.error.message}
                </Text>
              </Card>
            ) : null}

            {feedEventsQuery.error ? (
              <Card className="border-al-error bg-al-error-bg" variant="cream">
                <Text variant="error">{feedEventsQuery.error.message}</Text>
              </Card>
            ) : null}

            <View className="flex-row items-center justify-between gap-4">
              <Button
                className="flex-1"
                onPress={() => router.push(route("/feed/followed-accounts"))}
              >
                {hasTrackedAccounts
                  ? "Manage followed accounts"
                  : "Follow an Account Now"}
              </Button>
              {trackedAccountsQuery.isFetching || feedEventsQuery.isFetching ? (
                <ActivityIndicator color="#d5c08f" />
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          trackedAccountsQuery.isLoading || feedEventsQuery.isLoading ? (
            <Card variant="dark">
              <Text className="text-al-cream">Loading activity…</Text>
            </Card>
          ) : (
            <Card variant="dark">
              <Text className="text-al-cream" variant="title">
                No Recent Events
              </Text>
            </Card>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            tintColor="#d5c08f"
            onRefresh={() => {
              void refresh();
            }}
          />
        }
        renderItem={({ item }) => <FeedEventCard event={item} />}
      />
    </Screen>
  );
}

type FeedEventCardProps = {
  event: FeedEvent;
};

function FeedEventCard({ event }: FeedEventCardProps) {
  return (
    <Card className="gap-3" variant="cream">
      <View className="flex-row items-start justify-between gap-3">
        <Text variant="label">{event.accountName}</Text>
        <Text variant="muted">{formatRelativeTime(event.occurredAt)}</Text>
      </View>
      <Text variant="title">{event.display.title}</Text>
      {event.display.body ? (
        <Text variant="body">{event.display.body}</Text>
      ) : null}
    </Card>
  );
}

function formatRelativeTime(value: string): string {
  const occurredAt = new Date(value).getTime();

  if (Number.isNaN(occurredAt)) {
    return "Recently";
  }

  const seconds = Math.max(0, Math.floor((Date.now() - occurredAt) / 1000));

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
}
