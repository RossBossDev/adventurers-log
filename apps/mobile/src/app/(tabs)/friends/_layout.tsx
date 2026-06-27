import { AuthStackLayout } from "../../../components/auth/auth-stack-layout";

export default function FriendsLayout() {
  return (
    <AuthStackLayout
      featureName="Friends"
      routes={["index", "search-accounts", "requests", "accounts/[accountId]"]}
    />
  );
}
