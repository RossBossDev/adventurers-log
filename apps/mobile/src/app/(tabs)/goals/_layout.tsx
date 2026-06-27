import { AuthStackLayout } from "../../../components/auth/auth-stack-layout";

export default function GoalsLayout() {
  return (
    <AuthStackLayout
      featureName="Goals"
      routes={["index", "create", "[goalId]"]}
    />
  );
}
