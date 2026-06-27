import { AuthRequired } from "../../../components/auth/auth-required";
import { ScaffoldScreen } from "../../../components/scaffold/scaffold-screens";

export default function YouScreen() {
  return (
    <AuthRequired featureName="You">
      <ScaffoldScreen
        actions={[
          { label: "My Accounts", href: "/you/my-accounts" },
          {
            label: "Linked Accounts",
            href: "/you/linked-accounts",
            variant: "outline",
          },
          {
            label: "Notifications",
            href: "/you/notifications",
            variant: "outline",
          },
          { label: "Settings", href: "/you/settings", variant: "outline" },
          { label: "About", href: "/you/about", variant: "ghost" },
        ]}
        cards={[
          {
            title: "Adventurers' Log User",
            body: "This hub represents the internal user profile. OSRS Account ownership is modeled separately as My Accounts.",
          },
        ]}
        description="Profile, settings, claimed accounts, and account-level preferences."
        eyebrow="Profile"
        title="You"
      />
    </AuthRequired>
  );
}
