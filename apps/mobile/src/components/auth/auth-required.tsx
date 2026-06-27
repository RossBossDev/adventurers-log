import type { ReactNode } from "react";
import { Text as NativeText, ScrollView, View } from "react-native";

import { useAuthSessionStore } from "../../store/auth-session.store";
import { Card } from "../ui/card";
import { Screen } from "../ui/screen";
import { AuthForm } from "./auth-form";

type AuthRequiredProps = {
  children: ReactNode;
  featureName?: string;
};

export function AuthRequired({ children, featureName }: AuthRequiredProps) {
  const isAuthenticated = useAuthSessionStore((state) => state.isAuthenticated);
  const isLoading = useAuthSessionStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <Screen className="justify-center px-6">
        <View style={{ gap: 12 }}>
          <NativeText
            style={{
              color: "#f5ead2",
              fontSize: 36,
              fontWeight: "900",
              lineHeight: 42,
              textAlign: "center",
            }}
          >
            Adventurers&apos; Log
          </NativeText>
          <NativeText
            style={{ color: "#f5ead2", fontSize: 16, textAlign: "center" }}
          >
            Checking your session…
          </NativeText>
        </View>
      </Screen>
    );
  }

  if (isAuthenticated) {
    return children;
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          gap: 20,
          paddingHorizontal: 20,
          paddingTop: 40,
          paddingBottom: 32,
        }}
      >
        <View style={{ gap: 12 }}>
          <NativeText
            style={{
              color: "#d5c08f",
              fontSize: 12,
              fontWeight: "800",
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            {featureName ?? "Adventurers' Log"}
          </NativeText>
          <NativeText
            style={{
              color: "#f5ead2",
              fontSize: 36,
              fontWeight: "900",
              lineHeight: 42,
            }}
          >
            Sign in to continue
          </NativeText>
          <NativeText
            style={{ color: "#f5ead2", fontSize: 16, lineHeight: 24 }}
          >
            Goals, friends, My Accounts, notifications, and social features
            require an Adventurers&apos; Log User.
          </NativeText>
        </View>

        <Card className="gap-4" variant="parchment">
          <NativeText
            style={{ color: "#241c14", fontSize: 22, fontWeight: "800" }}
          >
            OSRS Accounts are still public
          </NativeText>
          <NativeText
            style={{ color: "#3b2f22", fontSize: 16, lineHeight: 24 }}
          >
            You can follow OSRS Accounts from the Feed without signing in.
            Internal social features belong to Adventurers&apos; Log Users.
          </NativeText>
        </Card>

        <AuthForm />
      </ScrollView>
    </Screen>
  );
}
