import { Redirect } from "expo-router";

import { route } from "../../lib/routes";

export default function SignUpScreen() {
  return <Redirect href={route("/auth/sign-in")} />;
}
