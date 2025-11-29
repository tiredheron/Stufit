import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface ProjectProgressRowProps {
  contentWidth: number;
  isTablet: boolean;

  onModeChange?: (mode: "learning" | "exam") => void;
  selectedMode?: "learning" | "exam";
}

export default function ProjectProgressRow({
  contentWidth,
  isTablet,
  onModeChange,
  selectedMode = "learning",
}: ProjectProgressRowProps) {
  return (
    <View style={[styles.container, { width: contentWidth }]}>
      
      {/* ⭐ Learning Mode */}
      <Pressable
        onPress={() => onModeChange?.("learning")}
        style={[
          styles.box,
          selectedMode === "learning" ? styles.boxActive : null,
        ]}
      >
        <Text
          style={[
            styles.label,
            selectedMode === "learning" ? styles.labelActive : null,
          ]}
        >
          Learning Mode
        </Text>

        <Text
          style={[
            styles.subText,
            selectedMode === "learning" ? styles.subTextActive : null,
          ]}
        >
          Continue your study
        </Text>
      </Pressable>

      {/* ⭐ Exam Mode */}
      <Pressable
        onPress={() => onModeChange?.("exam")}
        style={[
          styles.box,
          selectedMode === "exam" ? styles.boxActive : null,
        ]}
      >
        <Text
          style={[
            styles.label,
            selectedMode === "exam" ? styles.labelActive : null,
          ]}
        >
          Exam Mode
        </Text>

        <Text
          style={[
            styles.subText,
            selectedMode === "exam" ? styles.subTextActive : null,
          ]}
        >
          Prepare for upcoming exams
        </Text>
      </Pressable>

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
    justifyContent: "center",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }
      : { elevation: 4 }),
  },

  boxActive: {
    backgroundColor: "#5F7FE1",
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#444",
  },
  labelActive: { color: "#fff" },

  subText: {
    marginTop: 8,
    fontSize: 13,
    color: "#666",
  },
  subTextActive: {
    color: "#EBEEFF",
  },
});
