import { Pressable, StyleSheet, Text, View } from "react-native";

interface HeaderBarProps {
  contentWidth: number;
  userId?: string | null;   // ⭐ 추가
}

export default function HeaderBar({ contentWidth, userId }: HeaderBarProps) {
  return (
    <View style={[styles.header, { width: contentWidth, marginBottom: 20 }]}>
      <View style={styles.avatar} />

      <View>
        <Text style={styles.hello}>Hello!</Text>

        {/* ⭐ userId 표시, 없으면 "User" */}
        <Text style={styles.name}>{userId || "User"}</Text>
      </View>

      <Pressable style={styles.notification}>
        <Text style={{ fontSize: 20 }}>🔔</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 46,
    height: 46,
    backgroundColor: "#D9D9D9",
    borderRadius: 23,
    marginRight: 14,
  },
  hello: {
    fontSize: 14,
    color: "#24252C",
    opacity: 0.7,
  },
  name: {
    fontSize: 19,
    fontWeight: "600",
    color: "#24252C",
  },
  notification: {
    marginLeft: "auto",
  },
});
