import { AuthRequired } from "../../../components/auth/auth-required";
import { ScaffoldScreen } from "../../../components/scaffold/scaffold-screens";

export default function NotificationsScreen() {
  return (
    <AuthRequired featureName="Notifications">
      <ScaffoldScreen
        cards={[
          {
            title: "No notification settings yet",
            body: "Goal, friend, and account activity notification preferences will appear here later.",
          },
        ]}
        description="Placeholder notification center and settings."
        eyebrow="You"
        title="Notifications"
      />
    </AuthRequired>
  );
}
