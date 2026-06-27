import { AuthStackLayout } from "../../../components/auth/auth-stack-layout";

export default function YouLayout() {
  return (
    <AuthStackLayout
      featureName="You"
      routes={[
        "index",
        "settings",
        "my-accounts",
        "linked-accounts",
        "notifications",
        "about",
      ]}
    />
  );
}
