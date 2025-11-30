import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  useWindowDimensions
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const MAX_WIDTH = 820;

/* --------------  API HOST 자동 감지 -------------- */
function getApiHost() {
  if (Platform.OS === "android") return "10.0.2.2";
  if (Platform.OS === "ios") return "localhost";
  const uri = Constants.expoConfig?.hostUri;
  return uri ? uri.split(":")[0] : "localhost";
}

const API_BASE = `http://${getApiHost()}:4000`;

/* -------------------- 타입 ----------------------- */
type PlanProject = {
  plan_id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_ai_plan?: boolean;
};

/* ------------------ 메인 컴포넌트 ------------------ */

export default function TasksScreen() {
  const [projects, setProjects] = useState<PlanProject[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const [userId, setUserId] = useState<string | null>(null);

  const { width } = useWindowDimensions();

  /* ------------------- 로그인 후 프로젝트 로드 ------------------- */
  useEffect(() => {
    (async () => {
      const storedId = await AsyncStorage.getItem("auth_token");
      setUserId(storedId);

      if (storedId) loadProjects(storedId);
    })();
  }, []);
  

  // 화면 포커스될 때마다 최신화
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const userId = await AsyncStorage.getItem("auth_token");
        setUserId(userId);

        if (userId) loadProjects(userId);
      })();
    }, [])
  );

  /* ------------------- 프로젝트 불러오기 ------------------- */
  const loadProjects = async (uid: string) => {
    try {
      setLoadingList(true);
      const res = await fetch(`${API_BASE}/api/plans?user_id=${uid}`);
      const data = await res.json();

      if (Array.isArray(data.plans)) setProjects(data.plans);
      else setProjects([]);
    } catch (e) {
      console.log("⚠ 프로젝트 로드 실패:", e);
    } finally {
      setLoadingList(false);
    }
  };

  /* ------------------- 프로젝트 생성 ------------------- */
const createProject = async () => {
  if (!newTitle.trim()) return;
  if (!userId) return alert("로그인이 필요합니다.");

  try {
    setLoadingCreate(true);

    const res = await fetch(`${API_BASE}/api/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        title: newTitle,
        description: newCategory,
      }),
    });

    const data = await res.json();

    if (res.ok && data.plan_id) {
      await loadProjects(userId);
    }

  } catch (e) {
    console.log("⚠ 생성 실패:", e);
  } finally {
    setNewCategory("");
    setNewTitle("");
    setShowCreate(false);
    setLoadingCreate(false);
  }
};


  /* ------------------- 프로젝트 클릭 ------------------- */
  const openProject = (p: PlanProject) => {
    router.push({
      pathname: "/plan_ai",
      params: {
        projectId: p.plan_id,
        title: p.title,
        category: p.description || "",
      },
    });
  };

  /* ------------------- UI 렌더링 ------------------- */

  return (
    <View style={styles.root}>
      {/* 상단 */}
      <View style={styles.wrapper}>
      <View style={[styles.innerContainer, { width: width > MAX_WIDTH ? MAX_WIDTH : '90%' }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Make Plan</Text>

        <Pressable style={styles.bellButton}>
          <Text style={{ fontSize: 20 }}>🔔</Text>
        </Pressable>
      </View>

      {/* Add Project 버튼 */}
      <Pressable style={styles.addProjectButton} onPress={() => setShowCreate(true)}>
        <Text style={styles.addProjectText}>+ Add Project</Text>
        <Text style={styles.addProjectSubText}>새로운 프로젝트를 만들어 계획을 세우세요</Text>
      </Pressable>

      {/* 리스트 */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 로딩 */}
        {loadingList && (
          <ActivityIndicator size="small" style={{ marginVertical: 10 }} />
        )}

        {/* 생성 UI */}
        {showCreate && (
          <View style={[styles.card, styles.createCard]}>
            <Text style={styles.createTitle}>새 프로젝트 만들기</Text>

            <Text style={styles.inputLabel}>프로젝트 이름</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 1학기 1주차 Plan"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.inputLabel}>세부 사항</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 컴퓨터개론"
              value={newCategory}
              onChangeText={setNewCategory}
            />

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.btn, styles.cancelBtn]}
                onPress={() => setShowCreate(false)}
              >
                <Text style={styles.cancelBtnText}>취소</Text>
              </Pressable>

              <Pressable
                style={[styles.btn, styles.saveBtn]}
                onPress={createProject}
              >
                <Text style={styles.saveBtnText}>
                  {loadingCreate ? "생성 중..." : "생성"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* 프로젝트 리스트 */}
        {projects.map((p) => (
          <Pressable
            key={p.plan_id}
            style={styles.card}
            onPress={() => openProject(p)}
          >
            <Text style={styles.categoryText}>{p.description || "No description"}</Text>
            <Text style={styles.cardTitle}>{p.title}</Text>
          </Pressable>
        ))}

        {/* 비어 있을 때 */}
        {!loadingList && projects.length === 0 && !showCreate && (
          <Text style={styles.emptyText}>
            아직 생성된 프로젝트가 없어요. "Add Project"를 눌러서 시작해보세요!
          </Text>
        )}
      </ScrollView>
      </View>
      </View>
    </View>
  );
}

/* --------------------- 스타일 ---------------------- */
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },

  innerContainer: {
    flex: 1,
  },
  root: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#f6f6ff",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
  },

  bellButton: {
    padding: 6,
    backgroundColor: "white",
    borderRadius: 100,
  },

  addProjectButton: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#7c5cff",
    marginBottom: 18,
  },

  addProjectText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },

  addProjectSubText: {
    fontSize: 13,
    color: "#e8ddff",
    marginTop: 2,
  },

  card: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginBottom: 14,
    elevation: 3,
  },

  categoryText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
  },

  /* ----- 생성 카드 ----- */
  createCard: {
    borderWidth: 1,
    borderColor: "#ece5ff",
  },

  createTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },

  inputLabel: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fafafa",
    marginBottom: 10,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },

  btn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    marginLeft: 8,
  },

  cancelBtn: {
    backgroundColor: "#e9e9ff",
  },

  saveBtn: {
    backgroundColor: "#7c5cff",
  },

  cancelBtnText: {
    color: "#444",
  },

  saveBtnText: {
    color: "white",
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
});
