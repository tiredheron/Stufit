import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface TodayProgressCardProps {
  contentWidth: number;

  studyHourTime?: number;     // 내가 공부한 시간
  studyMinTime?: number;
  overallRank?: number;   // 전체 랭킹
  majorRank?: number;     // 학과 랭킹

  onPressOverall?: () => void; // 전체 랭킹 페이지 이동
  onPressMajor?: () => void;   // 학과 랭킹 페이지 이동
}

export default function TodayProgressCard({
  contentWidth,
  studyHourTime = 124,
  studyMinTime = 56,
  overallRank = 12,
  majorRank = 5,
  onPressOverall,
  onPressMajor,
}: TodayProgressCardProps) {
  return (
    <View style={[styles.card, { width: contentWidth }]}>
      {/* LEFT — 공부시간 */}
      <View style={styles.leftBox}>
        <Text style={styles.label}>You studied</Text>
        <Text style={styles.time}>{studyHourTime}h {studyMinTime}m</Text>
        <Text style={styles.sub}>Total Study Time</Text>
      </View>

      {/* RIGHT — 두 개 버튼 */}
      <View style={styles.rightBox}>
        <RankButton
          label="전체 랭킹"
          rank={overallRank}
          onPress={onPressOverall}
        />
        <RankButton
          label="학과 랭킹"
          rank={majorRank}
          onPress={onPressMajor}
          style={{ marginTop: 10 }}
        />
      </View>
    </View>
  );
}

/**********************************************************************
 * RankButton
 * 
 * Desktop(Web):
 *  - Hover 시 숫자 0 → rank 로 카운트 애니메이션
 *  - Hover 시 scale + shadow 강화
 *
 * Mobile:
 *  - 클릭하면 "전체 랭킹: X등" / "학과 랭킹: X등" 으로 토글
 **********************************************************************/
function RankButton({
  label,
  rank,
  onPress,
  style,
}: {
  label: string;
  rank: number;
  onPress?: () => void;
  style?: any;
}) {
  const [isHovered, setIsHovered] = useState(false);  // 웹 hover
  const [isOpened, setIsOpened] = useState(false);    // 클릭 toggle
  const [displayValue, setDisplayValue] = useState(0);

  /* ------------------- 웹 Hover 카운트 애니메이션 ------------------- */
  useEffect(() => {
    if (Platform.OS !== "web") return;

    let frameId: number | null = null;

    if (isHovered) {
      const duration = 600;
      const start = performance.now();

      const tick = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(elapsed / duration, 1);
        const value = Math.round(rank * t);
        setDisplayValue(value);

        if (t < 1) frameId = requestAnimationFrame(tick);
      };

      frameId = requestAnimationFrame(tick);
    } else {
      setDisplayValue(0);
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [isHovered, rank]);

  /* ------------------- 화면에 보일 텍스트 결정 ------------------- */
  let buttonLabel = label;

  // 1순위: 웹 hover 중이면 숫자 카운트 표시
  if (Platform.OS === "web" && isHovered && displayValue > 0) {
    buttonLabel = `${displayValue}위`;
  }
  // 2순위: 클릭해서 열린 상태면 라벨 + 등수
  else if (isOpened) {
    buttonLabel = `${label}: ${rank}등`;
  }

  return (
    <Pressable
      onPress={() => {
        setIsOpened(prev => !prev); // 웹/모바일 공통 토글
        onPress?.();               // 페이지 이동 콜백 (있다면)
      }}
      style={({ hovered }) => [
        styles.rankBtn,
        style,
        hovered && Platform.OS === "web" ? styles.rankBtnHover : null,
      ]}
      onHoverIn={() => Platform.OS === "web" && setIsHovered(true)}
      onHoverOut={() => Platform.OS === "web" && setIsHovered(false)}
    >
      <Text style={styles.rankText}>{buttonLabel}</Text>
    </Pressable>
  );
}

/**********************************************************************
 * Styles
 **********************************************************************/
const styles = StyleSheet.create({
  /* 전체 카드 */
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#5F33E1",
    borderRadius: 24,
    padding: 22,
    minHeight: 150,
    alignItems: "center",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 8px 18px rgba(0,0,0,0.08)" as any }
      : { elevation: 4 }),
  },

  /* 왼쪽 */
  leftBox: { flex: 1 },
  label: { color: "#EEE9FF", fontSize: 14 },
  time: { fontSize: 32, color: "#fff", fontWeight: "800", marginTop: 6 },
  sub: { color: "#E4DFFF", fontSize: 12, marginTop: 2 },

  /* 오른쪽 버튼 영역 */
  rightBox: {
    width: 130,
    justifyContent: "center",
  },

  rankBtn: {
    backgroundColor: "#EEE9FF",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  /* 웹 hover 스타일 */
  rankBtnHover: {
    transform: [{ scale: 1.05 }],
    boxShadow: "0px 4px 12px rgba(0,0,0,0.15)" as any,
  },

  rankText: {
    color: "#5F33E1",
    fontWeight: "700",
    fontSize: 14,
  },
});
