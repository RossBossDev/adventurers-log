import { Stack } from "expo-router";

import { AuthRequired } from "./auth-required";

type AuthStackLayoutProps = {
  featureName: string;
  routes: string[];
};

export function AuthStackLayout({ featureName, routes }: AuthStackLayoutProps) {
  return (
    <AuthRequired featureName={featureName}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#14110d" },
          headerShown: false,
        }}
      >
        {routes.map((name) => (
          <Stack.Screen key={name} name={name} />
        ))}
      </Stack>
    </AuthRequired>
  );
}
