import { Stack } from "expo-router";

export default function FeedLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#14110d" },
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="follow-account" />
      <Stack.Screen name="events/[eventId]" />
      <Stack.Screen name="accounts/[accountId]" />
    </Stack>
  );
}
