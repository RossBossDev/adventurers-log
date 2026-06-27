import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Screen } from "../../components/ui/screen";
import { Text } from "../../components/ui/text";
import { route } from "../../lib/routes";
import { useMockAuthStore } from "../../store/mock-auth.store";

export default function SignUpScreen() {
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
          <Text variant="display">Sign up</Text>
          <Text variant="subtitle">
            Create-user flows are placeholder-only. OSRS Accounts can be
            followed without signup, but social features require a User.
          </Text>
        </View>

        <Card className="gap-4">
          <Text variant="title">Scaffold sign up</Text>
          <Text variant="body">
            Use mock auth to continue as an Adventurers&apos; Log User and
            explore claimed-account and social navigation.
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
            onPress={() => router.push(route("/auth/sign-in"))}
            variant="outline"
          >
            Already have an account? Sign in
          </Button>
          <Button
            onPress={() => router.push(route("/auth/my-accounts"))}
            variant="ghost"
          >
            Add My Account after signup
          </Button>
        </Card>
      </ScrollView>
    </Screen>
  );
}
