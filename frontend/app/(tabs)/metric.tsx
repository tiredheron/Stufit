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
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const host = Constants.expoConfig?.hostUri?.split(":")[0] || "localhost";
const API_BASE = `http://${host}:4000`;

type PersonalRanking = {
  rank: number;
  user_id: string;
  department: string;
  studyTime: string;
  weeklyIncrease: string;
  isMe: boolean;
};

type DepartmentRanking = {
  rank: number;
  department: string;
  totalStudyTime: string;
  avgPerStudent: string;
  studentCount: number;
  isMyDepartment: boolean;
};

export default function RankingScreen() {
  const params = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState<"personal" | "department">("personal");
  const [personalRankings, setPersonalRankings] = useState<PersonalRanking[]>([]);
  const [departmentRankings, setDepartmentRankings] = useState<DepartmentRanking[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myDeptRank, setMyDeptRank] = useState<number | null>(null);
  const [myStudyTime, setMyStudyTime] = useState<string>("0h 0m");
  const [myDeptTotalTime, setMyDeptTotalTime] = useState<string>("0h 0m");
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [myDepartment, setMyDepartment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // URL 파라미터로 초기 탭 설정
  useEffect(() => {
    if (params.tab === "department") {
      setSelectedTab("department");
    } else if (params.tab === "personal") {
      setSelectedTab("personal");
    }
  }, [params.tab]);

  // 개인 순위 데이터 가져오기
  const fetchPersonalRanking = async () => {
    try {
      const userId = await AsyncStorage.getItem("auth_token");
      if (!userId) return;

      console.log("개인 순위 요청:", `${API_BASE}/ranking/personal?user_id=${userId}`);
      
      const res = await fetch(`${API_BASE}/ranking/personal?user_id=${userId}`);
      const data = await res.json();

      console.log("개인 순위 응답:", data);

      if (res.ok) {
        setPersonalRankings(data.rankings || []);
        setMyRank(data.myRank);
        setTotalStudents(data.totalStudents);
        setMyStudyTime(data.myStudyTime);
        setMyDepartment(data.department);
      }
    } catch (err) {
      console.error("개인 순위 로드 에러:", err);
    }
  };

  // 학과별 순위 데이터 가져오기
  const fetchDepartmentRanking = async () => {
    try {
      const userId = await AsyncStorage.getItem("auth_token");
      if (!userId) return;

      console.log("학과별 순위 요청:", `${API_BASE}/ranking/department?user_id=${userId}`);
      
      const res = await fetch(`${API_BASE}/ranking/department?user_id=${userId}`);
      const data = await res.json();

      console.log("학과별 순위 응답:", data);

      if (res.ok) {
        setDepartmentRankings(data.rankings || []);
        setMyDeptRank(data.myDepartmentRank);
        setMyDeptTotalTime(data.myDepartmentTotalTime);
        setMyDepartment(data.myDepartment);
      }
    } catch (err) {
      console.error("학과별 순위 로드 에러:", err);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchPersonalRanking(), fetchDepartmentRanking()]);
      setLoading(false);
    })();
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  if (loading) {
    return (
      <LinearGradient colors={["#f4f1ff", "#ffffff"]} style={styles.page}>
        <View style={styles.centerContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Learning Ranking</Text>
          </View>
          <Text style={{ textAlign: "center", marginTop: 100, color: "#888" }}>
            로딩 중...
          </Text>
        </View>
      </LinearGradient>
    );
  }

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
              <Text style={styles.summaryRank}>
                {myRank ? `${myRank}위` : "-"}
              </Text>
              <Text style={styles.summaryDetail}>
                {myDepartment} {totalStudents}명 중
              </Text>
              <Text style={styles.summaryTime}>
                이번 주 학습시간: {myStudyTime}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.summaryLabel}>우리 학과 순위</Text>
              <Text style={styles.summaryRank}>
                {myDeptRank ? `${myDeptRank}위` : "-"}
              </Text>
              <Text style={styles.summaryDetail}>전체 학과 중</Text>
              <Text style={styles.summaryTime}>
                총 학습시간: {myDeptTotalTime}
              </Text>
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
            personalRankings.length > 0 ? (
              personalRankings.map((item) => (
                <View
                  key={item.user_id}
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
                        {item.user_id}
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
              <Text style={{ textAlign: "center", color: "#888", marginTop: 40 }}>
                학습 기록이 없습니다.
              </Text>
            )
          ) : (
            // 학과별 순위 목록
            departmentRankings.length > 0 ? (
              departmentRankings.map((item) => (
                <View
                  key={item.department}
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
            ) : (
              <Text style={{ textAlign: "center", color: "#888", marginTop: 40 }}>
                학습 기록이 없습니다.
              </Text>
            )
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