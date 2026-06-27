import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Screen } from "../../components/ui/screen";
import { Text } from "../../components/ui/text";
import { route } from "../../lib/routes";
import { useMockAuthStore } from "../../store/mock-auth.store";

export default function SignInScreen() {
  const viewAsLoggedInUser = useMockAuthStore(
    (state) => state.viewAsLoggedInUser,
  );

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 20,
          paddingVertical: 32,
        }}
      >
        <View className="gap-3">
          <Text className="text-al-card-light" variant="label">
            Adventurers&apos; Log User
          </Text>
          <Text variant="display">Sign in</Text>
          <Text variant="subtitle">
            Real Better Auth is not wired yet. Use the mock control to browse
            authenticated scaffold screens.
          </Text>
        </View>

        <Card className="gap-4">
          <Text variant="title">Scaffold sign in</Text>
          <Text variant="body">
            Signing in unlocks Goals, Friends, You, My Accounts, notifications,
            and social placeholders for this session only.
          </Text>
          <Button
            onPress={() => {
              viewAsLoggedInUser();
              router.replace(route("/you"));
            }}
          >
            View as logged in user
          </Button>
          <Button
            onPress={() => router.push(route("/auth/sign-up"))}
            variant="outline"
          >
            Need an account? Sign up
          </Button>
        </Card>
      </ScrollView>
    </Screen>
  );
}
