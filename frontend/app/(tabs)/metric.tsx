import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function RankingScreen() {
  const params = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState<"personal" | "department">("personal");

  // URL 파라미터로 초기 탭 설정
  useEffect(() => {
    if (params.tab === "department") {
      setSelectedTab("department");
    } else if (params.tab === "personal") {
      setSelectedTab("personal");
    }
  }, [params.tab]);

  // 학과 내 개인 순위 더미 데이터
  const personalRankings = [
    { id: 1, rank: 1, name: "이재성", department: "컴퓨터공학과", studyTime: "48h 32m", weeklyIncrease: "+5h" },
    { id: 2, rank: 2, name: "문상균", department: "컴퓨터공학과", studyTime: "45h 18m", weeklyIncrease: "+3h" },
    { id: 3, rank: 3, name: "이지원", department: "컴퓨터공학과", studyTime: "42h 50m", weeklyIncrease: "+7h" },
    { id: 4, rank: 4, name: "이승혜", department: "컴퓨터공학과", studyTime: "38h 25m", weeklyIncrease: "+4h", isMe: true },
    { id: 5, rank: 5, name: "오민정", department: "컴퓨터공학과", studyTime: "36h 12m", weeklyIncrease: "+2h" },
    { id: 6, rank: 6, name: "송준표", department: "컴퓨터공학과", studyTime: "33h 47m", weeklyIncrease: "+6h" },
    { id: 7, rank: 7, name: "우도경", department: "컴퓨터공학과", studyTime: "31h 20m", weeklyIncrease: "+3h" },
    { id: 8, rank: 8, name: "박민철", department: "컴퓨터공학과", studyTime: "28h 55m", weeklyIncrease: "+5h" },
    { id: 9, rank: 9, name: "안진수", department: "컴퓨터공학과", studyTime: "28h 55m", weeklyIncrease: "+5h" },
    { id: 10, rank: 10, name: "황태웅", department: "컴퓨터공학과", studyTime: "28h 55m", weeklyIncrease: "+5h" },
    { id: 11, rank: 11, name: "김태수", department: "컴퓨터공학과", studyTime: "28h 55m", weeklyIncrease: "+5h" },
  ];

  // 학교 내 학과별 순위 더미 데이터
  const departmentRankings = [
    { id: 1, rank: 1, department: "컴퓨터공학과", totalStudyTime: "2,847h", avgPerStudent: "42h 15m", studentCount: 67, isMyDepartment: true },
    { id: 2, rank: 2, department: "유아교육과", totalStudyTime: "2,634h", avgPerStudent: "39h 45m", studentCount: 66 },
    { id: 3, rank: 3, department: "스마트제조ICT학과", totalStudyTime: "2,512h", avgPerStudent: "38h 20m", studentCount: 65 },
    { id: 4, rank: 4, department: "전자공학과", totalStudyTime: "2,398h", avgPerStudent: "36h 50m", studentCount: 65 },
    { id: 5, rank: 5, department: "경영학과", totalStudyTime: "2,156h", avgPerStudent: "33h 12m", studentCount: 65 },
    { id: 6, rank: 6, department: "심리학과", totalStudyTime: "1,987h", avgPerStudent: "31h 40m", studentCount: 62 },
    { id: 7, rank: 7, department: "화학과", totalStudyTime: "1,843h", avgPerStudent: "29h 25m", studentCount: 62 },
    { id: 8, rank: 8, department: "영어영문학과", totalStudyTime: "1,725h", avgPerStudent: "27h 10m", studentCount: 63 },
  ];

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <LinearGradient colors={["#f4f1ff", "#ffffff"]} style={styles.page}>
      <View style={styles.centerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Learning Ranking</Text>
          <Pressable>
            <Text style={styles.bell}>🏆</Text>
          </Pressable>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[
              styles.tabBtn,
              selectedTab === "personal" && styles.tabBtnActive,
            ]}
            onPress={() => setSelectedTab("personal")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "personal" && styles.tabTextActive,
              ]}
            >
              학과 내 순위
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.tabBtn,
              selectedTab === "department" && styles.tabBtnActive,
            ]}
            onPress={() => setSelectedTab("department")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "department" && styles.tabTextActive,
              ]}
            >
              학과별 순위
            </Text>
          </Pressable>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          {selectedTab === "personal" ? (
            <>
              <Text style={styles.summaryLabel}>내 순위</Text>
              <Text style={styles.summaryRank}>4위</Text>
              <Text style={styles.summaryDetail}>컴퓨터공학과 65명 중</Text>
              <Text style={styles.summaryTime}>이번 주 학습시간: 38h 25m</Text>
            </>
          ) : (
            <>
              <Text style={styles.summaryLabel}>우리 학과 순위</Text>
              <Text style={styles.summaryRank}>3위</Text>
              <Text style={styles.summaryDetail}>전체 학과 중</Text>
              <Text style={styles.summaryTime}>총 학습시간: 2,512h</Text>
            </>
          )}
        </View>

        {/* Ranking List */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          {selectedTab === "personal" ? (
            // 개인 순위 목록
            personalRankings.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.rankCard,
                  item.isMe && styles.rankCardHighlight,
                ]}
              >
                <View style={styles.rankLeft}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankNumber}>
                      {getRankBadge(item.rank)}
                    </Text>
                  </View>
                  <View style={styles.rankInfo}>
                    <Text style={[styles.rankName, item.isMe && styles.myName]}>
                      {item.name}
                      {item.isMe && <Text style={styles.meTag}> (나)</Text>}
                    </Text>
                    <Text style={styles.rankDepartment}>{item.department}</Text>
                  </View>
                </View>

                <View style={styles.rankRight}>
                  <Text style={styles.studyTime}>{item.studyTime}</Text>
                  <Text style={styles.weeklyIncrease}>{item.weeklyIncrease}</Text>
                </View>
              </View>
            ))
          ) : (
            // 학과별 순위 목록
            departmentRankings.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.rankCard,
                  item.isMyDepartment && styles.rankCardHighlight,
                ]}
              >
                <View style={styles.rankLeft}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankNumber}>
                      {getRankBadge(item.rank)}
                    </Text>
                  </View>
                  <View style={styles.rankInfo}>
                    <Text
                      style={[
                        styles.rankName,
                        item.isMyDepartment && styles.myName,
                      ]}
                    >
                      {item.department}
                      {item.isMyDepartment && (
                        <Text style={styles.meTag}> (우리 학과)</Text>
                      )}
                    </Text>
                    <Text style={styles.rankDepartment}>
                      {item.studentCount}명 참여
                    </Text>
                  </View>
                </View>

                <View style={styles.rankRight}>
                  <Text style={styles.studyTime}>{item.totalStudyTime}</Text>
                  <Text style={styles.avgTime}>평균 {item.avgPerStudent}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },

  centerContainer: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 800 : 430,
    alignSelf: "center",
    paddingBottom: Platform.OS === "web" ? 20 : 90,
  },

  header: {
    marginTop: 60,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
  },

  bell: {
    fontSize: 24,
  },

  tabContainer: {
    flexDirection: "row",
    marginTop: 24,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }
      : { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8 }),
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },

  tabBtnActive: {
    backgroundColor: "#6C63FF",
  },

  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#888",
  },

  tabTextActive: {
    color: "#fff",
  },

  summaryCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#6C63FF",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 6px 16px rgba(108,99,255,0.25)" }
      : { shadowColor: "#6C63FF", shadowOpacity: 0.3, shadowRadius: 12 }),
  },

  summaryLabel: {
    fontSize: 14,
    color: "#E0DEFF",
    marginBottom: 8,
  },

  summaryRank: {
    fontSize: 48,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },

  summaryDetail: {
    fontSize: 16,
    color: "#E0DEFF",
    marginBottom: 12,
  },

  summaryTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  scrollView: {
    marginTop: 16,
  },

  rankCard: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }
      : { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8 }),
  },

  rankCardHighlight: {
    backgroundColor: "#F5F3FF",
    borderWidth: 2,
    borderColor: "#6C63FF",
  },

  rankLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  rankNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6C63FF",
  },

  rankInfo: {
    flex: 1,
  },

  rankName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },

  myName: {
    color: "#6C63FF",
    fontWeight: "700",
  },

  meTag: {
    fontSize: 14,
    color: "#6C63FF",
  },

  rankDepartment: {
    fontSize: 13,
    color: "#888",
  },

  rankRight: {
    alignItems: "flex-end",
  },

  studyTime: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },

  weeklyIncrease: {
    fontSize: 13,
    color: "#6C63FF",
    fontWeight: "600",
  },

  avgTime: {
    fontSize: 13,
    color: "#888",
  },
});