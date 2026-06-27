import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { AuthRequired } from "../../../components/auth/auth-required";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Screen } from "../../../components/ui/screen";
import { Text } from "../../../components/ui/text";
import { route } from "../../../lib/routes";
import { useAuthSessionStore } from "../../../store/auth-session.store";

export default function SettingsScreen() {
  const user = useAuthSessionStore((state) => state.user);
  const isWorking = useAuthSessionStore((state) => state.isWorking);
  const signOut = useAuthSessionStore((state) => state.signOut);

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
              Account
            </Text>
            <Text variant="display">Settings</Text>
            <Text variant="subtitle">
              Manage your Adventurers&apos; Log user session.
            </Text>
          </View>

          <Card className="gap-4">
            <Text variant="title">Signed in</Text>
            <View className="gap-1">
              <Text variant="body">{user?.name || user?.email}</Text>
              {user?.email ? <Text variant="muted">{user.email}</Text> : null}
            </View>
            <Button
              disabled={isWorking}
              onPress={() => {
                void signOut().finally(() => router.replace(route("/feed")));
              }}
              variant="danger"
            >
              Sign out
            </Button>
          </Card>
        </ScrollView>
      </Screen>
    </AuthRequired>
  );
}
