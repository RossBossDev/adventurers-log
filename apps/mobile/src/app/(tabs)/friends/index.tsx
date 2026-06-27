import { AuthRequired } from "../../../components/auth/auth-required";
import { ScaffoldScreen } from "../../../components/scaffold/scaffold-screens";

export default function FriendsScreen() {
  return (
    <AuthRequired featureName="Friends">
      <ScaffoldScreen
        actions={[
          { label: "Search accounts", href: "/friends/search-accounts" },
          {
            label: "Friend requests",
            href: "/friends/requests",
            variant: "outline",
          },
        ]}
        cards={[
          {
            title: "Adventurers' Log Users",
            body: "Friends are relationships between internal Users, not OSRS Accounts.",
          },
          {
            title: "Friend feed",
            body: "A friend feed may include events from a friend's claimed accounts, even if you did not manually follow those accounts.",
          },
        ]}
        description="Social discovery and friend activity placeholders for authenticated users."
        eyebrow="Social"
        title="Friends"
      />
    </AuthRequired>
  );
}
