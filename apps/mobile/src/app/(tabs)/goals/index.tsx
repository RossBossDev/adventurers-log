import { AuthRequired } from "../../../components/auth/auth-required";
import { ScaffoldScreen } from "../../../components/scaffold/scaffold-screens";

export default function GoalsScreen() {
  return (
    <AuthRequired featureName="Goals">
      <ScaffoldScreen
        actions={[
          { label: "Create Goal", href: "/goals/create" },
          {
            label: "Open sample goal",
            href: "/goals/sample-goal",
            variant: "outline",
          },
        ]}
        cards={[
          {
            title: "Account targets",
            body: "Goals can target one of My Accounts or any followed/searched OSRS Account. Persistence will come later.",
          },
          {
            title: "User feature",
            body: "Goals belong to an Adventurers' Log User, not directly to an unclaimed OSRS Account.",
          },
        ]}
        description="Plan and review account progress goals once real auth and goal APIs exist."
        eyebrow="Adventurers' Log User"
        title="Goals"
      />
    </AuthRequired>
  );
}
