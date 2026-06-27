import { useLocalSearchParams } from "expo-router";

import { ScaffoldScreen } from "../../../../components/scaffold/scaffold-screens";

export default function AccountProfileScreen() {
  const { accountId } = useLocalSearchParams<{ accountId: string }>();

  return (
    <ScaffoldScreen
      cards={[
        {
          title: "Tracked Account",
          body: "A tracked account is any OSRS Account followed for public activity. It does not imply ownership or an Adventurers' Log User relationship.",
        },
      ]}
      description={`Placeholder profile for followed OSRS Account ${accountId ?? "unknown"}.`}
      eyebrow="OSRS Account"
      title="Account Profile"
    />
  );
}
