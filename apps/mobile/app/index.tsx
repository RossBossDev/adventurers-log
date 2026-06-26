import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
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
    <SafeAreaView style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={trackedPlayersQuery.data ?? []}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <View style={styles.titleStack}>
              <Text style={styles.eyebrow}>Adventurers&apos; Log</Text>
              <Text style={styles.title}>Track an OSRS player</Text>
              <Text style={styles.subtitle}>
                Enter a player name to validate it with the backend and keep it
                on this device.
              </Text>
              <Text>{process.env.EXPO_PUBLIC_API_BASE_URL}</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.fieldStack}>
                <Text style={styles.label}>Player name</Text>
                <Controller
                  control={form.control}
                  name="playerName"
                  render={({ field: { onBlur, onChange, value } }) => (
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!addPlayerMutation.isPending}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      onSubmitEditing={onSubmit}
                      placeholder="Zezima"
                      placeholderTextColor="#64748b"
                      returnKeyType="done"
                      style={styles.input}
                      value={value}
                    />
                  )}
                />
                {form.formState.errors.playerName ? (
                  <Text style={styles.errorText}>
                    {form.formState.errors.playerName.message}
                  </Text>
                ) : null}
                {addPlayerMutation.error ? (
                  <Text style={styles.errorText}>
                    {addPlayerMutation.error.message}
                  </Text>
                ) : null}
              </View>

              <Pressable
                disabled={addPlayerMutation.isPending}
                onPress={onSubmit}
                style={({ pressed }) => [
                  styles.primaryButton,
                  (pressed || addPlayerMutation.isPending) && styles.dimmed,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {addPlayerMutation.isPending ? "Tracking…" : "Track player"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Local tracked players</Text>
              {trackedPlayersQuery.isFetching ? (
                <ActivityIndicator color="#fbbf24" />
              ) : null}
            </View>

            {trackedPlayersQuery.error ? (
              <Text style={styles.errorBanner}>
                {trackedPlayersQuery.error.message}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          trackedPlayersQuery.isLoading ? (
            <Text style={styles.emptyCard}>Loading tracked players…</Text>
          ) : (
            <Text style={styles.emptyCard}>
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
    <View style={styles.playerCard}>
      <View style={styles.playerCardContent}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{player.normalizedUsername}</Text>
          <Text style={styles.playerMeta}>Added as {player.displayName}</Text>
          {isActive ? <Text style={styles.activeBadge}>Last added</Text> : null}
        </View>
        <Pressable
          disabled={isRemoving}
          onPress={onRemove}
          style={({ pressed }) => [
            styles.removeButton,
            (pressed || isRemoving) && styles.dimmed,
          ]}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },
  listContent: {
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  headerStack: {
    gap: 24,
  },
  titleStack: {
    gap: 12,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fbbf24",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#f8fafc",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#cbd5e1",
  },
  card: {
    gap: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 24,
    backgroundColor: "#0f172a",
    padding: 20,
  },
  fieldStack: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 16,
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#f8fafc",
  },
  errorText: {
    fontSize: 14,
    color: "#fca5a5",
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#fbbf24",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#020617",
  },
  dimmed: {
    opacity: 0.6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f8fafc",
  },
  errorBanner: {
    borderRadius: 16,
    backgroundColor: "#450a0a",
    padding: 16,
    color: "#fecaca",
  },
  emptyCard: {
    borderRadius: 16,
    backgroundColor: "#0f172a",
    padding: 20,
    color: "#cbd5e1",
  },
  playerCard: {
    gap: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 24,
    backgroundColor: "#0f172a",
    padding: 20,
  },
  playerCardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  playerInfo: {
    flex: 1,
    gap: 4,
  },
  playerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
  },
  playerMeta: {
    fontSize: 14,
    color: "#94a3b8",
  },
  activeBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fcd34d",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  removeButton: {
    borderWidth: 1,
    borderColor: "#f87171",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fca5a5",
  },
});
