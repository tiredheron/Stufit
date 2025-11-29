// SubjectGroups.tsx

import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Text,
  View,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  useWindowDimensions,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

/* ============================================================= */
/* TYPES */
/* ============================================================= */

export type FileAttachment = {
  name: string;
  uri: string;
  mimeType: string;
};

export type Todo = {
  todo_id: string;
  title: string;
  content: string;
  accumulated_time: number;
  status_id: string;
  files?: FileAttachment[];
};

export type DailyPlan = {
  daily_id: string;
  title: string;
  todos: Todo[];
};

export type Plan = {
  plan_id: string;
  title: string;
  description: string;
  dailyPlans: DailyPlan[];
  totalTime?: number;
  percent?: number;
  color?: string;
};

interface SubjectGroupsProps {
  contentWidth: number;
  isTablet: boolean;
  mode: "learning" | "exam";
  plans: Plan[];
}

interface ProjectModalProps {
  visible: boolean;
  onClose: () => void;
  item: Plan | undefined;
  updateTodoFiles: (
    planId: string,
    todoId: string,
    newFile: FileAttachment
  ) => void;
  expandedDailyInModal: string | null;
  setExpandedDailyInModal: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  isTablet: boolean;
}

/* ============================================================= */
/* HELPERS */
/* ============================================================= */

const COLORS = ["#F478B8", "#9260F4", "#FF9142", "#00C4A6", "#5A71FF"];

const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}:${
    s < 10 ? "0" + s : s
  }`;
};

const getFileIcon = (fileName: string) => {
  if (!fileName) return "📄";
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "📃";
    case "ppt":
    case "pptx":
      return "📊";
    case "doc":
    case "docx":
      return "📝";
    case "png":
    case "jpg":
    case "jpeg":
      return "🖼️";
    case "zip":
    case "rar":
      return "📦";
    default:
      return "📎";
  }
};

const handleFileView = async (uri: string, name: string) => {
  if (Platform.OS === "web") {
    window.open(uri, "_blank");
    return;
  }

  try {
    const supported = await Linking.canOpenURL(uri);
    if (supported) {
      await Linking.openURL(uri);
    } else {
      Alert.alert("오류", `"${name}" 파일을 열 수 있는 앱이 없습니다.`);
    }
  } catch (e) {
    console.error("파일 열기 에러:", e);
    Alert.alert("오류", "파일을 여는 중 오류가 발생했습니다.");
  }
};

const useFileUpload = (
  updateTodoFiles: (planId: string, todoId: string, newFile: FileAttachment) => void,
  planId: string
) => {
  return async (todoId: string, todoTitle: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "image/*",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const file: FileAttachment = {
          name: asset.name,
          uri: asset.uri,
          mimeType: asset.mimeType || "application/octet-stream",
        };
        updateTodoFiles(planId, todoId, file);
      }
    } catch (e) {
      console.error("문서 선택 에러:", e);
    }
  };
};

/* ============================================================= */
/* MAIN COMPONENT */
/* ============================================================= */

export default function SubjectGroups({
  contentWidth,
  isTablet,
  mode,
  plans,
}: SubjectGroupsProps) {
  const [localPlans, setLocalPlans] = useState<Plan[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [expandedDailyInModal, setExpandedDailyInModal] = useState<
    string | null
  >(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  // plans → localPlans + 색 & totalTime 계산
  useEffect(() => {
    const mapped = plans.map((p, idx) => ({
      ...p,
      color: COLORS[idx % COLORS.length],
      totalTime: p.dailyPlans.reduce(
        (acc, d) =>
          acc +
          d.todos.reduce(
            (tAcc, t) => tAcc + (t.accumulated_time || 0),
            0
          ),
        0
      ),
    }));
    setLocalPlans(mapped);
  }, [plans]);

  // 간단한 페이드 인 애니메이션
  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(20);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [mode, opacity, translateY]);

  const openModal = (planId: string) => {
    setSelectedPlanId(planId);
    setExpandedDailyInModal(null);
    setModalVisible(true);
  };

  const activePlan = localPlans.find((p) => p.plan_id === selectedPlanId);

  const updateTodoFiles = (
    planId: string,
    todoId: string,
    newFile: FileAttachment
  ) => {
    setLocalPlans((prev) =>
      prev.map((p) => {
        if (p.plan_id !== planId) return p;
        return {
          ...p,
          dailyPlans: p.dailyPlans.map((d) => ({
            ...d,
            todos: d.todos.map((t) =>
              t.todo_id === todoId
                ? { ...t, files: [...(t.files || []), newFile] }
                : t
            ),
          })),
        };
      })
    );
  };

  return (
    <>
      <Animated.View
        style={{
          width: contentWidth,
          opacity,
          transform: [{ translateY }],
        }}
      >
        <Text
          style={[
            styles.section,
            isTablet && styles.sectionTablet,
          ]}
        >
          Plans
        </Text>

        {localPlans.map((item) => (
          <Pressable
            key={item.plan_id}
            style={styles.card}
            onPress={() => openModal(item.plan_id)}
          >
            <View style={styles.innerRow}>
              {/* 왼쪽 동그라미 아이콘 (이제 타이머 X, 단순 아이콘) */}
              <View
                style={[
                  styles.playBtnCircle,
                  { backgroundColor: item.color + "20" },
                ]}
              >
                <Text style={[styles.playBtnIcon, { color: item.color }]}>
                  📚
                </Text>
              </View>

              <View style={styles.textGroup}>
                <View style={styles.headerRow}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.timerText}>
                    {formatTime(item.totalTime || 0)}
                  </Text>
                </View>
                <Text style={styles.sub}>
                  {item.description || "No description"}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </Animated.View>

      <ProjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        item={activePlan}
        updateTodoFiles={updateTodoFiles}
        expandedDailyInModal={expandedDailyInModal}
        setExpandedDailyInModal={setExpandedDailyInModal}
        isTablet={isTablet}
      />
    </>
  );
}

/* ============================================================= */
/* SUB COMPONENTS */
/* ============================================================= */

function AttachedFileRow({ file }: { file: FileAttachment }) {
  return (
    <Pressable
      onPress={() => handleFileView(file.uri, file.name)}
      style={modalStyles.attachedFileRow}
    >
      <Text style={modalStyles.fileIcon}>{getFileIcon(file.name)}</Text>
      <View style={modalStyles.fileInfo}>
        <Text style={modalStyles.fileMeta}>{file.name}</Text>
        <Text
          style={[modalStyles.fileMeta, { color: "#5F7FE1" }]}
          numberOfLines={1}
        >
          {file.mimeType}
        </Text>
      </View>
    </Pressable>
  );
}

function TodoFileRow({
  todo,
  onFileUpload,
}: {
  todo: Todo;
  onFileUpload: (todoId: string, todoTitle: string) => void;
}) {
  const files = todo.files || [];
  return (
    <View key={todo.todo_id} style={modalStyles.fileRow}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={modalStyles.fileName}>{todo.title}</Text>
        {todo.content ? (
          <Text style={modalStyles.fileMeta}>{todo.content}</Text>
        ) : null}

        <View style={modalStyles.attachedFilesList}>
          {files.map((f, idx) => (
            <AttachedFileRow key={idx} file={f} />
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onFileUpload(todo.todo_id, todo.title)}
        style={modalStyles.fileAddButton}
        hitSlop={10}
      >
        <Text style={modalStyles.fileAddIcon}>+</Text>
      </TouchableOpacity>

      <Text
        style={
          todo.status_id === "DONE"
            ? modalStyles.statusDone
            : modalStyles.statusPending
        }
      >
        {todo.status_id === "DONE" ? "✅" : "⏳"}
      </Text>
    </View>
  );
}

function ProjectModal({
  visible,
  onClose,
  item,
  updateTodoFiles,
  expandedDailyInModal,
  setExpandedDailyInModal,
  isTablet,
}: ProjectModalProps) {
  if (!item) return null;

  const { width } = useWindowDimensions();
  const modalWidth =
    Platform.OS === "web" && width > 768 ? 600 : "100%";

  const handleFileUpload = useFileUpload(updateTodoFiles, item.plan_id);

  const getFilteredTodos = (daily: DailyPlan) => {
    if (expandedDailyInModal === daily.daily_id) return daily.todos;
    return [];
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={modalStyles.overlay}>
        <Pressable style={modalStyles.backdrop} onPress={handleClose} />
        <View
          style={[
            modalStyles.modalContainer,
            isTablet && modalStyles.modalContainerTablet,
            { width: modalWidth },
          ]}
        >
          {/* Header */}
          <View style={modalStyles.header}>
            <View style={modalStyles.headerContent}>
              <Text style={modalStyles.folderIcon}>📁</Text>
              <Text style={modalStyles.headerTitle}>{item.title}</Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={modalStyles.closeButton}
            >
              <Text style={modalStyles.closeText}>✖</Text>
            </TouchableOpacity>
          </View>

          {/* 총 시간 */}
          <View style={modalStyles.timerContainerClean}>
            <Text style={modalStyles.timerLabel}>
              Project Total Focus Time
            </Text>
            <Text style={modalStyles.timerBigTextClean}>
              {formatTime(item.totalTime || 0)}
            </Text>
          </View>

          {/* Body */}
          <ScrollView
            style={modalStyles.body}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <Text style={modalStyles.listTitle}>Tasks by Day</Text>

            {item.dailyPlans && item.dailyPlans.length > 0 ? (
              item.dailyPlans.map((daily) => (
                <View
                  key={daily.daily_id}
                  style={modalStyles.sectionBlock}
                >
                  <Pressable
                    onPress={() =>
                      setExpandedDailyInModal((prev) =>
                        prev === daily.daily_id ? null : daily.daily_id
                      )
                    }
                    style={modalStyles.dailyPlanHeader}
                  >
                    <Text style={modalStyles.sectionTitle}>
                      {expandedDailyInModal === daily.daily_id
                        ? "🔽"
                        : "▶️"}{" "}
                      📅 {daily.title}
                    </Text>
                    <Text style={modalStyles.todoCount}>
                      ({daily.todos.length})
                    </Text>
                  </Pressable>
                  <View style={modalStyles.divider} />

                  {getFilteredTodos(daily).map((todo) => (
                    <TodoFileRow
                      key={todo.todo_id}
                      todo={todo}
                      onFileUpload={handleFileUpload}
                    />
                  ))}
                </View>
              ))
            ) : (
              <View style={modalStyles.emptyState}>
                <Text style={modalStyles.emptyIcon}>📭</Text>
                <Text style={modalStyles.emptyText}>
                  No tasks yet in this plan.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================= */
/* STYLES */
/* ============================================================= */

const styles = StyleSheet.create({
  section: {
    marginTop: 30,
    marginBottom: 14,
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },
  sectionTablet: {
    fontSize: 24,
  },
  card: {
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  innerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  playBtnCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  playBtnIcon: {
    fontSize: 20,
  },
  textGroup: {
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1E21",
  },
  timerText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontVariant: ["tabular-nums"],
  },
  sub: {
    fontSize: 13,
    color: "#888",
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    ...Platform.select({
      web: { justifyContent: "center", alignItems: "center" },
    }),
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: "#F9FAFB",
    height: "85%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    width: "100%",
  },
  modalContainerTablet: {
    height: "auto",
    maxHeight: "90%",
    borderRadius: 24,
    marginBottom: 0,
    ...Platform.select({
      web: {
        height: "85%",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerContent: { flexDirection: "row", alignItems: "center" },
  folderIcon: { fontSize: 22, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  closeButton: {
    padding: 8,
    backgroundColor: "#F1F1F3",
    borderRadius: 20,
  },
  closeText: { fontSize: 14, fontWeight: "800", color: "#999" },

  timerContainerClean: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  timerLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 6,
    fontWeight: "600",
  },
  timerBigTextClean: {
    fontSize: 36,
    fontWeight: "600",
    color: "#222",
    fontVariant: ["tabular-nums"],
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },

  body: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  listTitle: { fontSize: 14, fontWeight: "700", color: "#555", marginBottom: 12 },

  sectionBlock: { marginBottom: 20 },

  dailyPlanHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  todoCount: {
    fontSize: 14,
    color: "#999",
    marginLeft: 8,
    fontWeight: "600",
  },

  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#444" },

  divider: {
    height: 1,
    backgroundColor: "#EDEDED",
    marginVertical: 4,
    marginLeft: 8,
    marginRight: 8,
  },

  fileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },

  fileIcon: { fontSize: 20, marginRight: 10 },
  fileInfo: { flex: 1, justifyContent: "center" },
  fileName: { fontSize: 15, fontWeight: "600", color: "#333" },
  fileMeta: { fontSize: 12, marginTop: 2, color: "#555" },

  statusDone: { fontSize: 18, marginLeft: 10, color: "#00C4A6" },
  statusPending: { fontSize: 18, marginLeft: 10, color: "#FF9142" },

  attachedFilesList: {
    marginTop: 8,
    marginBottom: 4,
  },
  attachedFileRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#eee",
  },

  fileAddButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  fileAddIcon: {
    fontSize: 20,
    color: "#5F7FE1",
    lineHeight: 28,
    fontWeight: "bold",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14, color: "#aaa" },
});
