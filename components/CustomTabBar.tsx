import { View, Pressable, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useSegments } from "expo-router";

export default function CustomTabBar() {
  const segments = useSegments();
  const current = segments[segments.length - 1] as string;

  return (
    <View style={styles.container}>

      {/* Home */}
      <Pressable
        style={styles.tabBtn}
        onPress={() => router.push("/(tabs)")}
      >
        <Ionicons
          name="home"
          size={26}
          color={current === "(tabs)" ? "#6C63FF" : "#777"}
        />
      </Pressable>

      {/* plan */}
      <Pressable
        style={styles.tabBtn}
        onPress={() => router.push("/(tabs)/plan")}
      >
        <Ionicons
          name="calendar"
          size={26}
          color={current === "plan" ? "#6C63FF" : "#777"}
        />
      </Pressable>
      
      {/* Chatbot */}
      <View style={styles.centerSlot}>
        <Pressable
          style={styles.floatingBtn}
          onPress={() => router.push("/(tabs)/chatbot")}
        >
          <Ionicons name="sparkles" size={32} color="#fff" />
        </Pressable>
      </View>

      {/* RecordScreen */}
      <Pressable
        style={styles.tabBtn}
        onPress={() => router.push("/(tabs)/recordscreen")}
      >
        <Ionicons
          name="document-text"
          size={26}
          color={current === "recordscreen" ? "#6C63FF" : "#777"}
        />
      </Pressable>

      {/* Profile */}
      <Pressable
        style={styles.tabBtn}
        onPress={() => router.push("/(tabs)/profile")}
      >
        <Ionicons
          name="people"
          size={26}
          color={current === "profile" ? "#6C63FF" : "#777"}
        />
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 35,

    flexDirection: "row",
    alignItems: "center",

    // ★ 이렇게 해야 centerSlot이 공간을 갖는다
    justifyContent: "space-between",
    paddingHorizontal: 22,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },

  tabBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  centerSlot: {
    width: 40,
    height: 60,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  floatingBtn: {
    position: "absolute",
    top: -28,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
  },
});
