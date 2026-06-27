import { useLocalSearchParams } from "expo-router";

import { ScaffoldScreen } from "../../../../components/scaffold/scaffold-screens";

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  return (
    <ScaffoldScreen
      cards={[
        {
          title: "Event source",
          body: "Real progress, quest, collection-log, or goal events will be wired later. This scaffold only proves navigation from Feed cards.",
        },
      ]}
      description={`Placeholder detail for feed event ${eventId ?? "unknown"}.`}
      eyebrow="Feed"
      title="Event Detail"
    />
  );
}
