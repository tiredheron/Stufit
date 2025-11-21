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

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("All");

  /** --------------------------
   *  이번 달 날짜 자동 생성
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
   *  시작 시 자동 스크롤
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

  const tasks = [
    { id: 1, category: "Grocery shopping app design", title: "Market Research", time: "10:00 AM", status: "Done" },
    { id: 2, category: "Grocery shopping app design", title: "Competitive Analysis", time: "12:00 PM", status: "In Progress" },
    { id: 3, category: "Uber Eats redesign challange", title: "Create Low-fidelity Wireframe", time: "07:00 PM", status: "To-do" },
    { id: 4, category: "About design sprint", title: "How to pitch a Design Sprint", time: "09:00 PM", status: "To-do" },
    { id: 5, category: "Grocery shopping app design", title: "Market Research", time: "10:00 AM", status: "Done" },
    { id: 6, category: "Grocery shopping app design", title: "Competitive Analysis", time: "12:00 PM", status: "In Progress" },
    { id: 7, category: "Uber Eats redesign challange", title: "Create Low-fidelity Wireframe", time: "07:00 PM", status: "To-do" },
    { id: 8, category: "About design sprint", title: "How to pitch a Design Sprint", time: "09:00 PM", status: "To-do" },
  ];

  return (
    <LinearGradient colors={["#f4f1ff", "#ffffff"]} style={styles.page}>
      <View style={styles.centerContainer}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Today's Tasks</Text>
          <Pressable><Text style={styles.bell}>🔔</Text></Pressable>
        </View>

        <View style={styles.dateRow}>
          {/* 왼쪽 화살표 */}
          {Platform.OS === "web" && (
            <Pressable onPress={handlePrev} style={styles.arrowWrapper}>
              <Text style={styles.arrow}>◀</Text>
            </Pressable>
          )}

          {/* 중앙의 날짜 FlatList */}
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

          {/* 오른쪽 화살표 */}
          {Platform.OS === "web" && (
            <Pressable onPress={handleNext} style={styles.arrowWrapper}>
              <Text style={styles.arrow}>▶</Text>
            </Pressable>
          )}
        </View>

        {/* Filters */}
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
          {tasks.map((item) => (
            <View key={item.id} style={styles.taskCard}>
              <Text style={styles.taskCategory}>{item.category}</Text>
              <Text style={styles.taskTitle}>{item.title}</Text>

              <View style={styles.taskBottom}>
                <Text style={styles.taskTime}>🕒 {item.time}</Text>

                <View
                  style={[
                    styles.statusTag,
                    item.status === "Done" && { backgroundColor: "#E5D4FF" },
                    item.status === "In Progress" && { backgroundColor: "#FFE2C8" },
                  ]}
                >
                  <Text>{item.status}</Text>
                </View>
              </View>
            </View>
          ))}
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

arrow: {
  fontSize: 26,
  color: "#555",
  userSelect: "none",
},

});
