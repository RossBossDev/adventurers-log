import { AuthRequired } from "../../../components/auth/auth-required";
import { ScaffoldScreen } from "../../../components/scaffold/scaffold-screens";

export default function FriendRequestsScreen() {
  return (
    <AuthRequired featureName="Friend Requests">
      <ScaffoldScreen
        cards={[
          {
            title: "No requests yet",
            body: "Incoming and outgoing Adventurers' Log User friend requests will appear here once social APIs exist.",
          },
        ]}
        description="Placeholder friend request inbox."
        eyebrow="Friends"
        title="Friend Requests"
      />
    </AuthRequired>
  );
}
