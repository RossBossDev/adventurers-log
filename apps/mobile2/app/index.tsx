import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { findOrCreateTrackedPlayer } from "../src/api/players";
import {
  type LocalTrackedPlayer,
  listTrackedPlayers,
  removeTrackedPlayer,
  upsertTrackedPlayer,
} from "../src/db/tracked-players.repository";
import { useTrackedPlayerStore } from "../src/store/tracked-player.store";

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
    <SafeAreaView className="flex-1 bg-slate-950">
      <FlatList
        contentContainerClassName="gap-4 px-5 py-8"
        data={trackedPlayersQuery.data ?? []}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View className="gap-6">
            <View className="gap-3">
              <Text className="text-sm font-bold uppercase tracking-widest text-amber-400">
                Adventurers&apos; Log
              </Text>
              <Text className="text-4xl font-extrabold text-slate-50">
                Track an OSRS player
              </Text>
              <Text className="text-base leading-6 text-slate-300">
                Enter a player name to validate it with the backend and keep it
                on this device.
              </Text>
            </View>

            <View className="gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-5">
              <View className="gap-2">
                <Text className="text-sm font-semibold text-slate-200">
                  Player name
                </Text>
                <Controller
                  control={form.control}
                  name="playerName"
                  render={({ field: { onBlur, onChange, value } }) => (
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-slate-50"
                      editable={!addPlayerMutation.isPending}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      onSubmitEditing={onSubmit}
                      placeholder="Zezima"
                      placeholderTextColor="#64748b"
                      returnKeyType="done"
                      value={value}
                    />
                  )}
                />
                {form.formState.errors.playerName ? (
                  <Text className="text-sm text-red-300">
                    {form.formState.errors.playerName.message}
                  </Text>
                ) : null}
                {addPlayerMutation.error ? (
                  <Text className="text-sm text-red-300">
                    {addPlayerMutation.error.message}
                  </Text>
                ) : null}
              </View>

              <Pressable
                className="items-center rounded-2xl bg-amber-400 px-4 py-3 disabled:opacity-60"
                disabled={addPlayerMutation.isPending}
                onPress={onSubmit}
              >
                <Text className="text-base font-bold text-slate-950">
                  {addPlayerMutation.isPending ? "Tracking…" : "Track player"}
                </Text>
              </Pressable>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-slate-50">
                Local tracked players
              </Text>
              {trackedPlayersQuery.isFetching ? (
                <ActivityIndicator color="#fbbf24" />
              ) : null}
            </View>

            {trackedPlayersQuery.error ? (
              <Text className="rounded-2xl bg-red-950 p-4 text-red-200">
                {trackedPlayersQuery.error.message}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          trackedPlayersQuery.isLoading ? (
            <Text className="rounded-2xl bg-slate-900 p-5 text-slate-300">
              Loading tracked players…
            </Text>
          ) : (
            <Text className="rounded-2xl bg-slate-900 p-5 text-slate-300">
              No players tracked locally yet.
            </Text>
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
    </SafeAreaView>
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
    <View className="gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-lg font-bold text-slate-50">
            {player.normalizedUsername}
          </Text>
          <Text className="text-sm text-slate-400">
            Added as {player.displayName}
          </Text>
          {isActive ? (
            <Text className="text-xs font-bold uppercase tracking-widest text-amber-300">
              Last added
            </Text>
          ) : null}
        </View>
        <Pressable
          className="rounded-xl border border-red-400 px-3 py-2 disabled:opacity-60"
          disabled={isRemoving}
          onPress={onRemove}
        >
          <Text className="text-sm font-bold text-red-300">Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}
