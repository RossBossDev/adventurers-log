import { AuthRequired } from "../../../components/auth/auth-required";
import { ScaffoldScreen } from "../../../components/scaffold/scaffold-screens";

export default function MyAccountsScreen() {
  return (
    <AuthRequired featureName="My Accounts">
      <ScaffoldScreen
        cards={[
          {
            title: "Claimed Account",
            body: "My Accounts are OSRS Accounts an authenticated Adventurers' Log User says are theirs. They are unverified in this scaffold.",
          },
          {
            title: "Not the same as followed accounts",
            body: "Following an account builds a public feed locally. Claiming an account belongs to an internal user profile and requires sign-in.",
          },
        ]}
        description="Placeholder for claimed OSRS Accounts connected to your Adventurers' Log User."
        eyebrow="You"
        title="My Accounts"
      />
    </AuthRequired>
  );
}
