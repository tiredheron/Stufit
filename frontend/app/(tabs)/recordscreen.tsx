// 파일: recordscreen.tsx

import { router } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

// Dummy data
import { DUMMY_EXAM_PLANS } from "./examDummyPlans"; 

// 컴포넌트 import
import HeaderBar from "../../components/HeaderBar";
import ProjectProgressRow from "../../components/ProjectProgressRow";
import SubjectGroups, { Plan } from "../../components/SubjectGroups";
import TodayProgressCard from "../../components/TodayProgressCard";

// ---------------------------------------------------------
// 1. API 설정
// ---------------------------------------------------------
const host = Constants.expoConfig?.hostUri?.split(":")[0] || "localhost";
// ⭐ app.js 에서 app.use("/api/plans", planRoutes); 이므로 /api/plans 사용
const API_BASE = `http://${host}:4000`;

// 오늘 날짜 YYYY-MM-DD 반환
function getTodayDateStr() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function RecordScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const contentWidth = isTablet ? 700 : width;

  // ---------------------------------------------------------
  // 2. 상태 관리
  // ---------------------------------------------------------
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // 오늘 공부 시간(초 단위) + 랭킹
  const [todayTime, setTodayTime] = useState<number>(0);
  const [overallRank, setOverallRank] = useState<number>(0);
  const [majorRank, setMajorRank] = useState<number>(0);

  const [mode, setMode] = useState<"learning" | "exam">("learning");

  // ---------------------------------------------------------
  // 3. 서버 통신 로직
  // ---------------------------------------------------------

  /**
   * Plan(Subject) + Daily + Todo 트리 가져오기
   * - 나중에 백엔드에서 /api/plans/full-list 구현해서 연결할 예정
   *   (현재는 더미 또는 간단한 리스트에서 시작해도 됨)
   */
  const fetchPlans = async (currentUserId: string): Promise<void> => {
    // ⭐ 백엔드 planRoutes 에서 /full-list 라우트 만들 예정
    const apiUrl = `${API_BASE}/api/plans/full-list?user_id=${currentUserId}`;
    console.log(`[API] Fetching plans from: ${apiUrl}`);

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.warn("❌ /api/plans/full-list 실패:", response.status);
        return;
      }

      const data = await response.json();

      if (data.plans) {
        setPlans(data.plans as Plan[]);
        console.log(`[API] Successfully fetched ${data.plans.length} plans.`);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error("[API] Failed to fetch plans:", error);
      setPlans([]);
    }
  };

  const finalPlans =
  mode === "exam"
    ? DUMMY_EXAM_PLANS
    : plans; 

  /**
   * 오늘 공부 시간 + 랭킹 가져오기
   * - 오늘 날짜 기준 /todo/list 에서 accumulated_time 합산
   * - /ranking/personal, /ranking/department 로부터 랭킹 가져오기
   */
  const fetchSummary = async (currentUserId: string): Promise<void> => {
    const todayStr = getTodayDateStr();

    // 1) 오늘 공부 시간: /todo/list 에서 accumulated_time 합산
    try {
      const todoRes = await fetch(
        `${API_BASE}/todo/list?user_id=${currentUserId}&date=${todayStr}`
      );
      const todoData = await todoRes.json();

      if (todoRes.ok && Array.isArray(todoData.todos)) {
        const totalSec = todoData.todos.reduce(
          (sum: number, t: any) => sum + (t.accumulated_time || 0),
          0
        );
        setTodayTime(totalSec);
      } else {
        setTodayTime(0);
      }
    } catch (err) {
      console.error("❌ /todo/list 요약 실패:", err);
      setTodayTime(0);
    }

    // 2) 개인 랭킹: /ranking/personal
    try {
      const res = await fetch(
        `${API_BASE}/ranking/personal?user_id=${currentUserId}`
      );
      const data = await res.json();
      if (res.ok && typeof data.myRank === "number") {
        setOverallRank(data.myRank);
      } else {
        setOverallRank(0);
      }
    } catch (err) {
      console.error("❌ /ranking/personal 실패:", err);
      setOverallRank(0);
    }

    // 3) 학과 랭킹: /ranking/department
    try {
      const res = await fetch(
        `${API_BASE}/ranking/department?user_id=${currentUserId}`
      );
      const data = await res.json();
      if (res.ok && typeof data.myDepartmentRank === "number") {
        setMajorRank(data.myDepartmentRank);
      } else {
        setMajorRank(0);
      }
    } catch (err) {
      console.error("❌ /ranking/department 실패:", err);
      setMajorRank(0);
    }
  };

  /**
   * 초기 데이터 로드 (User ID 로드 + Plan + 요약 정보)
   */
  const loadInitialData = useCallback(async () => {
    // 1. 로그인 시 저장해 둔 user_id 로드
    //    (홈 화면에서 사용하는 것과 동일하게 auth_token 사용)
    const storedId = await AsyncStorage.getItem("auth_token");
    const idToUse = storedId || "test_user_1"; // 필요시 테스트용 기본값

    setUserId(idToUse);

    // 2. 플랜 + 투두 트리 로드
    await fetchPlans(idToUse);

    // 3. 오늘 공부 시간 + 랭킹 정보 로드
    await fetchSummary(idToUse);
  }, []);

  // ---------------------------------------------------------
  // 4. 생명 주기 연결 (탭에 들어올 때마다 새로 로드)
  // ---------------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [loadInitialData])
  );

  // ---------------------------------------------------------
  // 5. 모드 필터링 (지금은 아직 mode 컬럼이 없어서 전체 사용)
  // ---------------------------------------------------------
  const filteredPlans = plans.filter((p) => {
    // 나중에 Plan에 mode 필드가 생기면 여기서 분기
    // 예: return p.mode === mode;
    return true;
  });

  // ---------------------------------------------------------
  // 6. 렌더링
  // ---------------------------------------------------------
  return (
    <LinearGradient colors={["#f3f6fc", "#fff"]} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollArea}
      >
        <View style={{ width: contentWidth, alignSelf: "center" }}>
          {/* 1. 상단 헤더 */}
          <HeaderBar contentWidth={contentWidth} userId={userId ?? ""} />

          {/* 2. 오늘 공부 시간 & 랭킹 카드 */}
          <TodayProgressCard
            contentWidth={contentWidth}
            studyTime={todayTime}     // DB accumulated_time 합산값(초)
            overallRank={overallRank} // /ranking/personal myRank
            majorRank={majorRank}     // /ranking/department myDepartmentRank
            onPressOverall={() =>
              router.push("/(tabs)/metric?tab=department")
            }
            onPressMajor={() => router.push("/(tabs)/metric?tab=personal")}
          />

          {/* 3. 모드 선택 (Learning / Exam) */}
          <ProjectProgressRow
            contentWidth={contentWidth}
            isTablet={isTablet}
            selectedMode={mode}
            onModeChange={setMode}
          />

          {/* 4. 과목/플랜 리스트 */}
          <SubjectGroups
            contentWidth={contentWidth}
            isTablet={isTablet}
            mode={mode}
            plans={finalPlans}
          />

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 0 : 0,
  },
  scrollArea: {
    paddingBottom: 20,
  },
});
