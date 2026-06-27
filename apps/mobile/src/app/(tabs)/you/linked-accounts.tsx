import { AuthRequired } from "../../../components/auth/auth-required";
import { ScaffoldScreen } from "../../../components/scaffold/scaffold-screens";

export default function LinkedAccountsScreen() {
  return (
    <AuthRequired featureName="Linked Accounts">
      <ScaffoldScreen
        cards={[
          {
            title: "Future auth providers",
            body: "Provider links and identity management will live here once real auth is wired.",
          },
        ]}
        description="Placeholder for Adventurers' Log User login identities."
        eyebrow="You"
        title="Linked Accounts"
      />
    </AuthRequired>
  );
}
