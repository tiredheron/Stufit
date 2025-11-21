import React, { useRef } from "react";
import {
    Animated,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const groups = [
  { title: "Computer Architecture", subject: "23 Tasks", percent: 70, color: "#F478B8" },
  { title: "Operating Systems", subject: "30 Tasks", percent: 52, color: "#9260F4" },
  { title: "System Software", subject: "30 Tasks", percent: 87, color: "#FF9142" },
  { title: "Data Structure", subject: "3 Tasks", percent: 87, color: "#FFD12E" },
  { title: "Linear Algebra", subject: "16 Tasks", percent: 34, color: "#A3D12E" },
];

interface SubjectGroupsProps {
  contentWidth: number;
  isTablet: boolean;
  onPressCard?: (title: string) => void;
}

export default function SubjectGroups({ contentWidth, onPressCard }: SubjectGroupsProps) {
  return (
    <View style={{ width: contentWidth }}>
      <Text style={styles.section}>Subjects</Text>

      {groups.map((g, index) => (
        <AnimatedCard key={index} item={g} onPressCard={onPressCard} />
      ))}
    </View>
  );
}

function AnimatedCard({ item, onPressCard }: any) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPressIn={Platform.OS !== "web" ? animateIn : undefined}
      onPressOut={Platform.OS !== "web" ? animateOut : undefined}
      onPress={() => onPressCard?.(item.title)}
      style={({ hovered }) => [
        styles.card,
        hovered && Platform.OS === "web" ? styles.webHover : null,
      ]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {/* 카드 내용 */}
        <View style={styles.innerRow}>
          <View style={[styles.iconBox, { backgroundColor: item.color }]} />

          <View style={styles.textGroup}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>{item.subject}</Text>

            {/* Progress Bar */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${item.percent}%`, backgroundColor: item.color },
                ]}
              />
            </View>
          </View>

          <View style={styles.percentPill}>
            <Text style={styles.percentText}>{item.percent}%</Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 30,
    marginBottom: 14,
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  /*************************
   * CARD
   *************************/
  card: {
    marginBottom: 16,
    padding: 0,

    backgroundColor: "#FFFFFF",
    borderRadius: 20,

    // platform-specific shadow
    ...(Platform.OS === "web"
      ? {
          transition: "all 0.2s ease",
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        }
      : {
          elevation: 2,
          shadowColor: "#000",
          shadowOpacity: 0.07,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 6,
        }),
  },

  // hover 스타일 (web only)
  webHover: {
    transform: "translateY(-3px)",
    boxShadow: "0 6px 12px rgba(0,0,0,0.10)",
  },

  innerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },

  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginRight: 16,
  },

  textGroup: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1E21",
  },
  sub: {
    fontSize: 12,
    marginTop: 2,
    color: "#777",
  },

  /*************************
   * PROGRESS BAR
   *************************/
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 10,
    backgroundColor: "#F1F1F3",
    marginTop: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
  },

  /*************************
   * Percent Pill
   *************************/
  percentPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 50,
    backgroundColor: "#F4F5F7",
    marginLeft: 12,
  },
  percentText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },
});
