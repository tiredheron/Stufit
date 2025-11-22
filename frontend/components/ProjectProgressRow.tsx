import { Platform, StyleSheet, Text, View } from "react-native";

interface ProjectProgressRowProps {
    contentWidth: number;
    isTablet:  boolean;
}

export default function ProjectProgressRow({ contentWidth, isTablet }: ProjectProgressRowProps) {
  return (
    <View style={[styles.container, { width: contentWidth }]}>
      <View style={styles.box}>
        <Text style={styles.label}>Office Project</Text>
        <Text style={styles.value}>70%</Text>
      </View>

      <View style={styles.box}>
        <Text style={styles.label}>Personal Project</Text>
        <Text style={styles.value}>52%</Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  box: {
    width: "48%",
    height: 110,
    backgroundColor: "#E7F4FF",
    borderRadius: 20,
    padding: 16,

    ...(Platform.OS === "web"
      ? { boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }
      : { elevation: 4 }),
  },
  label: { fontSize: 12, color: "#555" },
  value: { marginTop: 10, fontSize: 26, fontWeight: "700" },
});
