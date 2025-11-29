import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type TodoItem = {
  todo_id: string;
  content: string;
  title: string;
  end_time: string | null;
  status_name: string;
  status_id: string;
};

type TaskModalProps = {
  visible: boolean;
  task: TodoItem | null;
  onClose: () => void;
};

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

export default function TaskModal({ visible, task, onClose }: TaskModalProps) {
  if (!task) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{task.title}</Text>

            <Pressable onPress={onClose}>
              <Ionicons name="close" size={28} color="#444" />
            </Pressable>
          </View>

          <Text style={styles.section}>내용</Text>
          <Text style={styles.text}>{task.content}</Text>

          <Text style={styles.section}>상태</Text>
          <Text style={styles.text}>{task.status_name}</Text>

          <Text style={styles.section}>마감 시간</Text>
          <Text style={styles.text}>{formatDateTime(task.end_time) || "미완료"}</Text>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>닫기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }
      : {
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 12,
        }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: { fontSize: 20, fontWeight: "700" },
  section: { marginTop: 15, fontSize: 13, fontWeight: "700", color: "#555" },
  text: { fontSize: 16, color: "#333", marginTop: 4 },
  closeBtn: {
    marginTop: 20,
    backgroundColor: "#6C63FF",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  closeBtnText: { color: "#fff", fontWeight: "700" },
});
