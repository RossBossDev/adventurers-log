import { AuthRequired } from "../../../components/auth/auth-required";
import { ScaffoldScreen } from "../../../components/scaffold/scaffold-screens";

export default function CreateGoalScreen() {
  return (
    <AuthRequired featureName="Create Goal">
      <ScaffoldScreen
        cards={[
          {
            title: "Choose an account target",
            body: "A future goal can target a claimed My Account, a followed OSRS Account, or an account found through search.",
          },
          {
            title: "No persistence yet",
            body: "This screen intentionally does not create backend records or local goal data.",
          },
        ]}
        description="Scaffold form copy for creating goals without committing to real goal models yet."
        eyebrow="Goals"
        title="Create Goal"
      />
    </AuthRequired>
  );
}
