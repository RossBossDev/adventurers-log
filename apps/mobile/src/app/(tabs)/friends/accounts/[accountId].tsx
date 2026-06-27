import { useLocalSearchParams } from "expo-router";

import { AuthRequired } from "../../../../components/auth/auth-required";
import { ScaffoldScreen } from "../../../../components/scaffold/scaffold-screens";

export default function FriendAccountProfileScreen() {
  const { accountId } = useLocalSearchParams<{ accountId: string }>();

  return (
    <AuthRequired featureName="Friend Account Profile">
      <ScaffoldScreen
        cards={[
          {
            title: "Friend activity source",
            body: "This OSRS Account may appear through a friend's claimed accounts without being in your followed account list.",
          },
        ]}
        description={`Social account profile placeholder for ${accountId ?? "unknown"}.`}
        eyebrow="Friends"
        title="Account Profile"
      />
    </AuthRequired>
  );
}
