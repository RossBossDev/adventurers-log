import { AuthRequired } from "../../../components/auth/auth-required";
import { ScaffoldScreen } from "../../../components/scaffold/scaffold-screens";

export default function SearchAccountsScreen() {
  return (
    <AuthRequired featureName="Search Accounts">
      <ScaffoldScreen
        cards={[
          {
            title: "Search account or user",
            body: "Later this can search OSRS Accounts for public tracking and Adventurers' Log Users for social relationships.",
          },
        ]}
        description="Placeholder search entry point for social discovery."
        eyebrow="Friends"
        title="Search Accounts"
      />
    </AuthRequired>
  );
}
