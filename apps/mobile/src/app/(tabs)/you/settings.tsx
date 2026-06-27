import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { AuthRequired } from "../../../components/auth/auth-required";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Screen } from "../../../components/ui/screen";
import { Text } from "../../../components/ui/text";
import { route } from "../../../lib/routes";
import { useMockAuthStore } from "../../../store/mock-auth.store";

export default function SettingsScreen() {
  const signOut = useMockAuthStore((state) => state.signOut);

  return (
    <AuthRequired featureName="Settings">
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
              Mock auth
            </Text>
            <Text variant="display">Settings</Text>
            <Text variant="subtitle">
              Reset the scaffold auth state and return to anonymous navigation.
            </Text>
          </View>

          <Card className="gap-4">
            <Text variant="title">Signed in as a scaffold user</Text>
            <Text variant="body">
              This is not Better Auth. It only unlocks placeholder screens for
              manual navigation testing.
            </Text>
            <Button
              onPress={() => {
                signOut();
                router.replace(route("/feed"));
              }}
              variant="danger"
            >
              Sign out / return to anonymous
            </Button>
          </Card>
        </ScrollView>
      </Screen>
    </AuthRequired>
  );
}
