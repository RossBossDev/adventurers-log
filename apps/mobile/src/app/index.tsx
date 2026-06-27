import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, FlatList, View } from "react-native";
import { z } from "zod";

import { findOrCreateTrackedPlayer } from "../api/players";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Screen } from "../components/ui/screen";
import { Text } from "../components/ui/text";
import { TextField } from "../components/ui/text-field";
import {
  type LocalTrackedPlayer,
  listTrackedPlayers,
  removeTrackedPlayer,
  upsertTrackedPlayer,
} from "../db/tracked-players.repository";
import { useTrackedPlayerStore } from "../store/tracked-player.store";

const trackedPlayersQueryKey = ["tracked-players"] as const;

const addPlayerSchema = z.object({
  playerName: z
    .string()
    .trim()
    .min(1, "Enter a player name.")
    .max(12, "RuneScape names are 12 characters or fewer.")
    .regex(
      /^[A-Za-z0-9 _]+$/,
      "Use only letters, numbers, spaces, and underscores.",
    ),
});

type AddPlayerForm = z.input<typeof addPlayerSchema>;

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const activeTrackedPlayerId = useTrackedPlayerStore(
    (state) => state.activeTrackedPlayerId,
  );
  const setActiveTrackedPlayerId = useTrackedPlayerStore(
    (state) => state.setActiveTrackedPlayerId,
  );

  const form = useForm<AddPlayerForm>({
    resolver: zodResolver(addPlayerSchema),
    defaultValues: { playerName: "" },
  });

  const trackedPlayersQuery = useQuery({
    queryKey: trackedPlayersQueryKey,
    queryFn: listTrackedPlayers,
  });

  const addPlayerMutation = useMutation({
    mutationFn: async (values: AddPlayerForm) => {
      const playerName = values.playerName.trim();
      const backendPlayer = await findOrCreateTrackedPlayer(playerName);

      return upsertTrackedPlayer({
        backendId: backendPlayer.id,
        normalizedUsername: backendPlayer.normalized_username,
        displayName: playerName,
      });
    },
    onSuccess: async (localPlayer) => {
      setActiveTrackedPlayerId(localPlayer.id);
      form.reset({ playerName: "" });
      await queryClient.invalidateQueries({ queryKey: trackedPlayersQueryKey });
    },
  });

  const removePlayerMutation = useMutation({
    mutationFn: removeTrackedPlayer,
    onSuccess: async (_data, removedId) => {
      if (activeTrackedPlayerId === removedId) {
        setActiveTrackedPlayerId(null);
      }

      await queryClient.invalidateQueries({ queryKey: trackedPlayersQueryKey });
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    addPlayerMutation.mutate(values);
  });

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
        data={trackedPlayersQuery.data ?? []}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View className="gap-6">
            <View className="gap-3">
              <Text className="text-al-card-light" variant="label">
                Adventurers&apos; Log
              </Text>
              <Text variant="display">Track an OSRS player</Text>
              <Text variant="subtitle">
                Start a local logbook entry by validating an adventurer with the
                backend and saving it on this device.
              </Text>
            </View>

            <Card className="gap-4">
              <View className="gap-2">
                <Text variant="label">Player name</Text>
                <Controller
                  control={form.control}
                  name="playerName"
                  render={({ field: { onBlur, onChange, value } }) => (
                    <TextField
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!addPlayerMutation.isPending}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      onSubmitEditing={onSubmit}
                      placeholder="Zezima"
                      returnKeyType="done"
                      value={value}
                    />
                  )}
                />
                {form.formState.errors.playerName ? (
                  <Text variant="error">
                    {form.formState.errors.playerName.message}
                  </Text>
                ) : null}
                {addPlayerMutation.error ? (
                  <Text variant="error">{addPlayerMutation.error.message}</Text>
                ) : null}
              </View>

              <Button disabled={addPlayerMutation.isPending} onPress={onSubmit}>
                {addPlayerMutation.isPending ? "Tracking…" : "Track player"}
              </Button>
            </Card>

            <View className="flex-row items-center justify-between">
              <Text className="text-al-cream" variant="title">
                Local tracked players
              </Text>
              {trackedPlayersQuery.isFetching ? (
                <ActivityIndicator color="#d5c08f" />
              ) : null}
            </View>

            {trackedPlayersQuery.error ? (
              <Card className="border-al-error bg-al-error-bg" variant="cream">
                <Text variant="error">{trackedPlayersQuery.error.message}</Text>
              </Card>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          trackedPlayersQuery.isLoading ? (
            <Card variant="dark">
              <Text className="text-al-cream">Loading tracked players…</Text>
            </Card>
          ) : (
            <Card variant="dark">
              <Text className="text-al-cream">
                No adventurers tracked in this notebook yet.
              </Text>
            </Card>
          )
        }
        renderItem={({ item }) => (
          <TrackedPlayerCard
            isActive={item.id === activeTrackedPlayerId}
            isRemoving={removePlayerMutation.isPending}
            onRemove={() => removePlayerMutation.mutate(item.id)}
            player={item}
          />
        )}
      />
    </Screen>
  );
}

type TrackedPlayerCardProps = {
  player: LocalTrackedPlayer;
  isActive: boolean;
  isRemoving: boolean;
  onRemove: () => void;
};

function TrackedPlayerCard({
  player,
  isActive,
  isRemoving,
  onRemove,
}: TrackedPlayerCardProps) {
  return (
    <Card className="gap-3" variant="cream">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1.5">
          <Text className="text-lg font-extrabold" variant="body">
            {player.normalizedUsername}
          </Text>
          <Text variant="muted">Added as {player.displayName}</Text>
          {isActive ? <Badge>Last added</Badge> : null}
        </View>
        <Button
          className="px-3 py-2"
          disabled={isRemoving}
          onPress={onRemove}
          textClassName="text-sm"
          variant="danger"
        >
          Remove
        </Button>
      </View>
    </Card>
  );
}
