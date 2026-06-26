import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Adventurers&apos; Log</Text>
        <Text style={styles.title}>Track the journey, not just the drops.</Text>
        <Text style={styles.body}>
          Mobile foundation is ready. OSRS logging features come next.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#0f172a",
    padding: 24,
  },
  card: {
    gap: 16,
    borderRadius: 24,
    backgroundColor: "#111827",
    padding: 24,
  },
  eyebrow: {
    color: "#f59e0b",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  title: {
    color: "#f8fafc",
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
  },
  body: {
    color: "#cbd5e1",
    fontSize: 18,
    lineHeight: 26,
  },
});
