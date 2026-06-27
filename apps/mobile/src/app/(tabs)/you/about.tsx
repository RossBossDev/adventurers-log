import { AuthRequired } from "../../../components/auth/auth-required";
import { ScaffoldScreen } from "../../../components/scaffold/scaffold-screens";

export default function AboutScreen() {
  return (
    <AuthRequired featureName="About">
      <ScaffoldScreen
        cards={[
          {
            title: "Scaffold build",
            body: "This mobile navigation layer is intentionally local and mock-backed while the real auth and social APIs are designed.",
          },
        ]}
        description="About Adventurers' Log mobile."
        eyebrow="You"
        title="About"
      />
    </AuthRequired>
  );
}
