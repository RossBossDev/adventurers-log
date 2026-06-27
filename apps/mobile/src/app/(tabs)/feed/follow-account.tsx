import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, FlatList, View } from "react-native";
import { z } from "zod";

import { findOrCreateTrackedPlayer } from "../../../api/players";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Screen } from "../../../components/ui/screen";
import { Text } from "../../../components/ui/text";
import { TextField } from "../../../components/ui/text-field";
import {
  type LocalTrackedPlayer,
  listTrackedPlayers,
  removeTrackedPlayer,
  upsertTrackedPlayer,
} from "../../../db/tracked-players.repository";
import { useTrackedPlayerStore } from "../../../store/tracked-player.store";
import { trackedAccountsQueryKey } from "./index";

const addAccountSchema = z.object({
  accountName: z
    .string()
    .trim()
    .min(1, "Enter an account name.")
    .max(12, "RuneScape names are 12 characters or fewer.")
    .regex(
      /^[A-Za-z0-9 _]+$/,
      "Use only letters, numbers, spaces, and underscores.",
    ),
});

type AddAccountForm = z.input<typeof addAccountSchema>;

export default function FollowAccountScreen() {
  const queryClient = useQueryClient();
  const activeTrackedPlayerId = useTrackedPlayerStore(
    (state) => state.activeTrackedPlayerId,
  );
  const setActiveTrackedPlayerId = useTrackedPlayerStore(
    (state) => state.setActiveTrackedPlayerId,
  );

  const form = useForm<AddAccountForm>({
    resolver: zodResolver(addAccountSchema),
    defaultValues: { accountName: "" },
  });

  const trackedAccountsQuery = useQuery({
    queryKey: trackedAccountsQueryKey,
    queryFn: listTrackedPlayers,
  });

  const addAccountMutation = useMutation({
    mutationFn: async (values: AddAccountForm) => {
      const accountName = values.accountName.trim();
      const backendPlayer = await findOrCreateTrackedPlayer(accountName);

      return upsertTrackedPlayer({
        backendId: backendPlayer.id,
        normalizedUsername: backendPlayer.normalized_username,
        displayName: accountName,
      });
    },
    onSuccess: async (localAccount) => {
      const hadNoAccounts = (trackedAccountsQuery.data ?? []).length === 0;
      setActiveTrackedPlayerId(localAccount.id);
      form.reset({ accountName: "" });
      await queryClient.invalidateQueries({
        queryKey: trackedAccountsQueryKey,
      });

      if (hadNoAccounts) {
        router.back();
      }
    },
  });

  const removeAccountMutation = useMutation({
    mutationFn: removeTrackedPlayer,
    onSuccess: async (_data, removedId) => {
      if (activeTrackedPlayerId === removedId) {
        setActiveTrackedPlayerId(null);
      }

      await queryClient.invalidateQueries({
        queryKey: trackedAccountsQueryKey,
      });
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    addAccountMutation.mutate(values);
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
        data={trackedAccountsQuery.data ?? []}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View className="gap-6">
            <View className="gap-3">
              <Text className="text-al-card-light" variant="label">
                Feed setup
              </Text>
              <Text variant="display">Follow an OSRS account</Text>
              <Text variant="subtitle">
                Validate an OSRS Account with the backend and save it locally on
                this device. This is separate from claiming My Accounts for an
                Adventurers&apos; Log User.
              </Text>
            </View>

            <Card className="gap-4">
              <View className="gap-2">
                <Text variant="label">OSRS account name</Text>
                <Controller
                  control={form.control}
                  name="accountName"
                  render={({ field: { onBlur, onChange, value } }) => (
                    <TextField
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!addAccountMutation.isPending}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      onSubmitEditing={onSubmit}
                      placeholder="Zezima"
                      returnKeyType="done"
                      value={value}
                    />
                  )}
                />
                {form.formState.errors.accountName ? (
                  <Text variant="error">
                    {form.formState.errors.accountName.message}
                  </Text>
                ) : null}
                {addAccountMutation.error ? (
                  <Text variant="error">
                    {addAccountMutation.error.message}
                  </Text>
                ) : null}
              </View>

              <Button
                disabled={addAccountMutation.isPending}
                onPress={onSubmit}
              >
                {addAccountMutation.isPending ? "Following…" : "Follow account"}
              </Button>
            </Card>

            <View className="flex-row items-center justify-between">
              <Text className="text-al-cream" variant="title">
                Followed OSRS accounts
              </Text>
              {trackedAccountsQuery.isFetching ? (
                <ActivityIndicator color="#d5c08f" />
              ) : null}
            </View>

            {trackedAccountsQuery.error ? (
              <Card className="border-al-error bg-al-error-bg" variant="cream">
                <Text variant="error">
                  {trackedAccountsQuery.error.message}
                </Text>
              </Card>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          trackedAccountsQuery.isLoading ? (
            <Card variant="dark">
              <Text className="text-al-cream">Loading followed accounts…</Text>
            </Card>
          ) : (
            <Card variant="dark">
              <Text className="text-al-cream">
                No OSRS accounts followed in this notebook yet.
              </Text>
            </Card>
          )
        }
        renderItem={({ item }) => (
          <TrackedAccountCard
            account={item}
            isActive={item.id === activeTrackedPlayerId}
            isRemoving={removeAccountMutation.isPending}
            onRemove={() => removeAccountMutation.mutate(item.id)}
          />
        )}
      />
    </Screen>
  );
}

type TrackedAccountCardProps = {
  account: LocalTrackedPlayer;
  isActive: boolean;
  isRemoving: boolean;
  onRemove: () => void;
};

function TrackedAccountCard({
  account,
  isActive,
  isRemoving,
  onRemove,
}: TrackedAccountCardProps) {
  return (
    <Card className="gap-3" variant="cream">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1.5">
          <Text className="text-lg font-extrabold" variant="body">
            {account.normalizedUsername}
          </Text>
          <Text variant="muted">Followed as {account.displayName}</Text>
          {isActive ? <Badge>Last followed</Badge> : null}
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
