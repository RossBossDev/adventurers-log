import { ScaffoldScreen } from "../../components/scaffold/scaffold-screens";

export default function AuthMyAccountsScreen() {
  return (
    <ScaffoldScreen
      actions={[
        { label: "Go to My Accounts", href: "/you/my-accounts" },
        { label: "Back to Feed", href: "/feed", variant: "outline" },
      ]}
      cards={[
        {
          title: "Claimed account setup",
          body: "My Accounts are unverified OSRS Accounts attached to an Adventurers' Log User. This is distinct from public followed accounts in the Feed.",
        },
        {
          title: "Sign in first",
          body: "If you arrive here anonymously, use Sign In or Sign Up to create or resume your Adventurers' Log User before claiming accounts.",
        },
      ]}
      description="Placeholder route for adding a claimed OSRS Account during auth onboarding."
      eyebrow="Auth"
      title="Add My Account"
    />
  );
}
