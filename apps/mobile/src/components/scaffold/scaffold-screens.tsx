import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { route } from "../../lib/routes";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Screen } from "../ui/screen";
import { Text } from "../ui/text";

type Action = {
  label: string;
  href: string;
  variant?: "primary" | "outline" | "ghost";
};

type ScaffoldScreenProps = {
  eyebrow?: string;
  title: string;
  description: string;
  cards?: Array<{ title: string; body: string }>;
  actions?: Action[];
};

export function ScaffoldScreen({
  actions = [],
  cards = [],
  description,
  eyebrow = "Scaffold",
  title,
}: ScaffoldScreenProps) {
  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 20,
          paddingVertical: 32,
        }}
      >
        <View className="gap-3">
          <Text className="text-al-card-light" variant="label">
            {eyebrow}
          </Text>
          <Text variant="display">{title}</Text>
          <Text variant="subtitle">{description}</Text>
        </View>

        {actions.length > 0 ? (
          <View className="gap-3">
            {actions.map((action) => (
              <Button
                key={action.label}
                onPress={() => router.push(route(action.href))}
                variant={action.variant}
              >
                {action.label}
              </Button>
            ))}
          </View>
        ) : null}

        {cards.map((card) => (
          <Card className="gap-2" key={card.title}>
            <Text variant="title">{card.title}</Text>
            <Text variant="body">{card.body}</Text>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
