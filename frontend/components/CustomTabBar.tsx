import { View, Pressable, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useSegments } from "expo-router";

export default function CustomTabBar() {
  const segments = useSegments();
  const raw = segments[segments.length - 1] as string;

  let current: string;

  if (raw === "plan_ai") {
    current = "plan";
  } else if (raw === "recordscreen" || raw === "metric") {
    current = "recordscreen";
  } else {
    current = raw;
  }

  const { width } = useWindowDimensions();
  const MAX_WIDTH = 820; // 리스트 영역과 동일한 폭

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            width: width > MAX_WIDTH ? MAX_WIDTH : "90%", // 웹에서는 좁게, 모바일은 90%
          },
        ]}
      >

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
            name="clipboard"
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
            <Ionicons name="search" size={32} color="#fff" />
          </Pressable>
        </View>

        {/* RecordScreen */}
        <Pressable
          style={styles.tabBtn}
          onPress={() => router.push("/(tabs)/recordscreen")}
        >
          <Ionicons
            name="trophy"
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
  },

  container: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },

  tabBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
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
