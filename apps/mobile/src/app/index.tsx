import { Redirect } from "expo-router";

import { route } from "../lib/routes";

export default function IndexRoute() {
  return <Redirect href={route("/feed")} />;
}
