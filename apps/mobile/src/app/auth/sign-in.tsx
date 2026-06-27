import { ScrollView } from "react-native";

import { AuthForm } from "../../components/auth/auth-form";
import { Screen } from "../../components/ui/screen";

export default function SignInScreen() {
  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 20,
          paddingVertical: 20,
        }}
      >
        <AuthForm />
      </ScrollView>
    </Screen>
  );
}
