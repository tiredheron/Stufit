import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface TodayProgressCardProps {
  contentWidth: number;
  studyTime: number; // 부모로부터 받는 총 합산 시간 (초 단위)
  overallRank?: number;
  majorRank?: number;
  onPressOverall?: () => void;
  onPressMajor?: () => void;
}

export default function TodayProgressCard({
  contentWidth,
  studyTime = 0,
  overallRank = 12,
  majorRank = 5,
  onPressOverall,
  onPressMajor,
}: TodayProgressCardProps) {
  /* 시간 포맷 (HHh MMm SSs) */
  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    // 초 단위까지 보여주면 생동감이 있습니다. 원치 않으면 s 부분 제거 가능
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <View style={[styles.card, { width: contentWidth }]}>
      {/* LEFT: 시간 표시 영역 */}
      <View style={styles.leftBox}>
        <Text style={styles.label}>Total Study Time</Text>
        <Text style={styles.time}>{formatTime(studyTime)}</Text>
        <Text style={styles.sub}>Keep pushing forward! 🔥</Text>
      </View>

      {/* RIGHT: 랭킹 버튼 영역 */}
      <View style={styles.rightBox}>
        <RankButton
          icon="🏆"
          label="전체 랭킹"
          rank={overallRank}
          onPress={onPressOverall}
        />
        <RankButton
          icon="🎓"
          label="학과 랭킹"
          rank={majorRank}
          onPress={onPressMajor}
          style={{ marginTop: 10 }}
        />
      </View>
    </View>
  );
}

function RankButton({ icon, label, rank, onPress, style }: any) {
  return (
    <Pressable onPress={onPress} style={[styles.rankBtn, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.rankText}>
        {label}: {rank}등
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#5F33E1",
    borderRadius: 24,
    padding: 22,
    minHeight: 150, // 버튼이 빠져서 높이를 살짝 줄임
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#5F33E1",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  leftBox: { flex: 1, justifyContent: "center" },
  label: { color: "#EEE9FF", fontSize: 14, fontWeight: "500" },
  time: {
    fontSize: 36, // 숫자를 더 강조
    color: "#fff",
    fontWeight: "800",
    marginTop: 8,
    fontVariant: ["tabular-nums"], // 숫자가 바뀔 때 너비 고정
  },
  sub: { color: "#B8A3FF", fontSize: 13, marginTop: 6, fontWeight: "500" },
  
  rightBox: { width: 140, justifyContent: "center" },
  rankBtn: {
    backgroundColor: "#EEE9FF",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  icon: { fontSize: 16 },
  rankText: {
    color: "#5F33E1",
    fontWeight: "700",
    fontSize: 14,
  },
});