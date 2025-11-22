import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { router } from "expo-router";

const host = Constants.expoConfig?.hostUri?.split(":")[0] || "localhost";
const API_BASE = `http://${host}:4000`;

type TodoItem = {
  todo_id: string;
  content: string;
  title: string;
  end_time: string | null;
  status_name: string;
  status_id: string;
};

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [tasks, setTasks] = useState<TodoItem[]>([]);

  const statusMap: Record<string, string[]> = {
    "All": ["NOT_STARTED", "IN_PROGRESS", "DONE"],
    "To do": ["NOT_STARTED"],
    "In Progress": ["IN_PROGRESS"],
    "Completed": ["DONE"],
  };

  /** --------------------------
   *  초기 실행 → 로그인 체크 + today's tasks load
   ---------------------------*/
  useEffect(() => {
    (async () => {
      const userId = await AsyncStorage.getItem("auth_token");

      if (!userId) {
        alert("로그인이 필요합니다.");
        router.replace("/(auth)/sign-in");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/todo/list?user_id=${userId}`);
        const data = await res.json();

        if (res.ok) setTasks(data.todos);
        else console.log(data);
      } catch (err) {
        console.log("Todo fetch error:", err);
      }
    })();
  }, []);

  // 날짜 안에 진행 전 중 완료에 대한 필터링
  const filteredTasks = tasks.filter((t) =>
    statusMap[selectedFilter].includes(t.status_id)
  );

  /** --------------------------
   *  날짜 자동 생성
   ---------------------------*/
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();

  const dates = Array.from({ length: lastDay }, (_, i) => {
    const d = new Date(year, month, i + 1);
    return {
      id: i,
      day: (i + 1).toString(),
      weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    };
  });

  const todayIndex = today.getDate() - 1;
  const dateListRef = useRef<FlatList<any>>(null);

  /** --------------------------
   *  앱 시작 시 오늘 날짜로 자동 스크롤
   ---------------------------*/
  useEffect(() => {
    setSelectedDate(todayIndex);

    setTimeout(() => {
      dateListRef.current?.scrollToIndex({
        index: todayIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }, 200);
  }, []);

  /** --------------------------
   *   날짜 선택 시 Todo 불러오기
   ---------------------------*/
  useEffect(() => {
    if (selectedDate === null) return;

    const fetchTasks = async () => {
      try {
        const day = selectedDate + 1;

        const dateStr = `${year}-${String(month + 1).padStart(
          2,
          "0"
        )}-${String(day).padStart(2, "0")}`;

        const userId = await AsyncStorage.getItem("auth_token");
        if (!userId) return;

        console.log("Request URL:", `${API_BASE}/todo/list?user_id=${userId}&date=${dateStr}`);

        const res = await fetch(
          `${API_BASE}/todo/list?user_id=${userId}&date=${dateStr}`
        );
        const data = await res.json();

        console.log("Response:", data);

        if (res.ok) {
          setTasks(data.todos || []);
        } else {
          setTasks([]);
        }
      } catch (err) {
        console.log("Todo fetch error:", err);
      }
    };

    fetchTasks();
  }, [selectedDate]);

  /** --------------------------
   *  좌우 이동 버튼
   ---------------------------*/
  const handlePrev = () => {
    if (selectedDate === null) return;
    const newIndex = Math.max(selectedDate - 1, 0);
    setSelectedDate(newIndex);

    dateListRef.current?.scrollToIndex({
      index: newIndex,
      animated: true,
      viewPosition: 0.5,
    });
  };

  const handleNext = () => {
    if (selectedDate === null) return;
    const newIndex = Math.min(selectedDate + 1, dates.length - 1);
    setSelectedDate(newIndex);

    dateListRef.current?.scrollToIndex({
      index: newIndex,
      animated: true,
      viewPosition: 0.5,
    });
  };

  const filters = ["All", "To do", "In Progress", "Completed"];

  function formatDateTime(isoString: string | null) {
    if (!isoString) return "미완료";

    const date = new Date(isoString);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");

    return `${yyyy}/${mm}/${dd} | ${hh}:${mi}:${ss}`;
  }


  return (
    <LinearGradient colors={["#f4f1ff", "#ffffff"]} style={styles.page}>
      <View style={styles.centerContainer}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Today's Tasks</Text>
          <Pressable><Text style={styles.bell}>🔔</Text></Pressable>
        </View>

        {/* 날짜 선택 */}
        <View style={styles.dateRow}>
          {Platform.OS === "web" && (
            <Pressable onPress={handlePrev} style={styles.arrowWrapper}>
              <Text style={styles.arrow}>◀</Text>
            </Pressable>
          )}

          <FlatList
            ref={dateListRef}
            data={dates}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
            getItemLayout={(data, index) => ({
              length: 84,
              offset: 84 * index,
              index,
            })}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setSelectedDate(item.id);
                  dateListRef.current?.scrollToIndex({
                    index: item.id,
                    animated: true,
                    viewPosition: 0.5,
                  });
                }}
              >
                <View
                  style={[
                    styles.dateBox,
                    selectedDate === item.id && styles.dateBoxActive,
                  ]}
                >
                  <Text style={styles.dateMonth}>{item.month}</Text>
                  <Text
                    style={[
                      styles.dateDay,
                      selectedDate === item.id && { color: "#fff" },
                    ]}
                  >
                    {item.day}
                  </Text>
                  <Text
                    style={[
                      styles.dateWeekday,
                      selectedDate === item.id && { color: "#fff" },
                    ]}
                  >
                    {item.weekday}
                  </Text>
                </View>
              </Pressable>
            )}
          />

          {Platform.OS === "web" && (
            <Pressable onPress={handleNext} style={styles.arrowWrapper}>
              <Text style={styles.arrow}>▶</Text>
            </Pressable>
          )}
        </View>

        {/* 필터 */}
        <View style={styles.filterRow}>
          {filters.map((f) => (
            <Pressable
              key={f}
              onPress={() => setSelectedFilter(f)}
              style={[
                styles.filterBtn,
                selectedFilter === f && styles.filterBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === f && { color: "#fff" },
                ]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Task list */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredTasks.map((item) => (
            <View key={item.todo_id} style={styles.taskCard}>
              <Text style={styles.taskCategory}>{item.content}</Text>
              <Text style={styles.taskTitle}>{item.title}</Text>

              <View style={styles.taskBottom}>
                <Text style={styles.taskTime}>
                  🕒 {formatDateTime(item.end_time)}
                </Text>

                <View
                  style={[
                    styles.statusTag,
                    (item.status_name === "완료" || item.status_name === "DONE") && {
                      backgroundColor: "#E5D4FF",
                    },
                    (item.status_name === "진행중" || item.status_name === "IN_PROGRESS") && {
                      backgroundColor: "#FFE2C8",
                    },
                  ]}
                >
                  <Text>{item.status_name}</Text>
                </View>
              </View>
            </View>
          ))}

          {filteredTasks.length === 0 && (
            <Text style={{ textAlign: "center", color: "#888", marginTop: 40 }}>
              할 일이 없습니다.
            </Text>
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },

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
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#333" },
  bell: { fontSize: 24 },

  dateBox: {
    width: 70,
    height: 95,
    borderRadius: 18,
    backgroundColor: "#fff",
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }
      : { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8 }),
  },
  dateBoxActive: { backgroundColor: "#6C63FF" },
  dateMonth: { color: "#888", fontSize: 12 },
  dateDay: { fontSize: 24, fontWeight: "700" },
  dateWeekday: { color: "#aaa", fontSize: 12 },

  filterRow: {
    flexDirection: "row",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: "#eee",
    borderRadius: 18,
    marginRight: 10,
  },
  filterBtnActive: { backgroundColor: "#6C63FF" },
  filterText: { color: "#444", fontSize: 14 },

  taskCard: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 20,
    marginTop: 12,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 6px 14px rgba(0,0,0,0.10)" }
      : { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8 }),
  },
  taskCategory: { fontSize: 13, color: "#888" },
  taskTitle: { fontSize: 18, fontWeight: "700", marginTop: 3, color: "#222" },
  taskBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  taskTime: { color: "#6C63FF", fontWeight: "600" },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 10,
  },

  arrowWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    cursor: "pointer",
  },

  arrow: { fontSize: 26, color: "#555", userSelect: "none" },
});
