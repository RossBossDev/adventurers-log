import { useLocalSearchParams } from "expo-router";

import { AuthRequired } from "../../../components/auth/auth-required";
import { ScaffoldScreen } from "../../../components/scaffold/scaffold-screens";

export default function GoalDetailScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  return (
    <AuthRequired featureName="Goal Detail">
      <ScaffoldScreen
        cards={[
          {
            title: "Placeholder progress",
            body: "Real goal progress will be calculated from account/activity data later.",
          },
        ]}
        description={`Placeholder detail for goal ${goalId ?? "unknown"}.`}
        eyebrow="Goals"
        title="Goal Detail"
      />
    </AuthRequired>
  );
}
