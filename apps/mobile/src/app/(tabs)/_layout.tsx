import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const tabIconNames = {
  feed: "newspaper-outline",
  goals: "flag-outline",
  friends: "people-outline",
  you: "person-circle-outline",
} as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: "#14110d" },
        tabBarActiveTintColor: "#d5c08f",
        tabBarInactiveTintColor: "#9b8a6b",
        tabBarStyle: {
          backgroundColor: "#1f2a1e",
          borderTopColor: "#4d6b3c",
        },
        tabBarIcon: ({ color, size }) => {
          const name = tabIconNames[route.name as keyof typeof tabIconNames];
          return name ? (
            <Ionicons color={color} name={name} size={size} />
          ) : null;
        },
      })}
    >
      <Tabs.Screen name="feed" options={{ title: "Feed" }} />
      <Tabs.Screen name="goals" options={{ title: "Goals" }} />
      <Tabs.Screen name="friends" options={{ title: "Friends" }} />
      <Tabs.Screen name="you" options={{ title: "You" }} />
    </Tabs>
  );
}
