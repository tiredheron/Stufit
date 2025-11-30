import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";

type TaskModalProps = {
  visible: boolean;
  onClose: () => void;
  todo: any;
  API_BASE: string;
  onRefresh: () => void;
};

export default function TaskModal({ visible, onClose, todo, API_BASE, onRefresh }: TaskModalProps) {
  const safeTodo = todo ?? {
    todo_id: "",
    title: "",
    content: "",
    accumulated_time: 0,
    status_id: "NOT_STARTED",
  };


  const [status, setStatus] = useState(safeTodo.status_id);
  const [seconds, setSeconds] = useState(safeTodo.accumulated_time || 0);
  const [running, setRunning] = useState(false);

  // setTodo가 업데이트될 때마다 갱신
  useEffect(() => {
    setStatus(safeTodo.status_id);
    setSeconds(safeTodo.accumulated_time || 0);
  }, [safeTodo]);

  const [startSeconds, setStartSeconds] = useState(0);

  // 모달이 열릴 때, 지금 accumulated_time을 기준점으로 저장
  useEffect(() => {
    if (visible) {
      setStartSeconds(safeTodo.accumulated_time || 0);
      setSeconds(safeTodo.accumulated_time || 0);
      setStatus(safeTodo.status_id);
    }
  }, [visible]);


  // 타이머 작동
  useEffect(() => {
    let timer: any;

    if (running) {
      timer = setInterval(() => {
        setSeconds((prev: number) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [running]);

  // 10초마다 서버로 저장
  useEffect(() => {
    if (seconds > 0 && seconds % 10 === 0) {
      saveTime(10);
      setStartSeconds((prev) => prev + 10); // 기준점도 업데이트!
    }
  }, [seconds]);

  const saveTime = async (sec: number) => {
    await fetch(`${API_BASE}/todo/time`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        todo_id: safeTodo.todo_id,
        seconds: sec,
      }),
    });

    onRefresh();
  };

  // 상태 변경 저장
  const changeStatus = async (newStatus: string) => {
    await fetch(`${API_BASE}/todo/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        todo_id: safeTodo.todo_id,
        status_id: newStatus,
      }),
    });

    if (newStatus === "DONE") {
      setRunning(false);
    }

    setStatus(newStatus);

    onRefresh();
  };

  // 상태 순환 함수
  const cycleStatus = () => {
    if (status === "DONE") return; // 완료면 더 이상 변경 불가

    const next =
      status === "NOT_STARTED"
        ? "IN_PROGRESS"
        : status === "IN_PROGRESS"
        ? "DONE"
        : "DONE";

    changeStatus(next);
  };

  // 초 → 시:분:초
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;

    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  };

  const closeModal = async () => {
    // 1) 타이머 즉시 중단
    setRunning(false);

    // 2) running 상태 변화(비동기) 반영을 위해 다음 이벤트 루프로 넘김
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 3) 증가분 계산
    const delta = seconds - startSeconds;

    // 4) 증가분이 있을 때만 서버에 저장
    if (delta > 0) {
      await fetch(`${API_BASE}/todo/time`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          todo_id: safeTodo.todo_id,
          seconds: delta,
        }),
      });
    }

    // 5) 리스트 새로고침
    onRefresh();

    // 6) 모달 닫기
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 제목 */}
          <Text style={styles.title}>{safeTodo.title}</Text>

          {/* 내용 */}
          <Text style={styles.content}>{safeTodo.content}</Text>

          {/* 상태 표시 */}
          <Text style={styles.label}>
            현재 상태:{" "}
            {status === "NOT_STARTED"
              ? "진행전"
              : status === "IN_PROGRESS"
              ? "진행중"
              : "완료"}
          </Text>

          {/* 상태 변경 버튼 하나 */}
          <TouchableOpacity
            style={[
              styles.statusCycleBtn,
              status === "DONE" && { backgroundColor: "#bbb" },
            ]}
            onPress={cycleStatus}
            disabled={status === "DONE"}
          >
            <Text style={styles.btnText}>
              {status === "NOT_STARTED"
                ? "진행중으로 변경"
                : status === "IN_PROGRESS"
                ? "완료로 변경"
                : "완료됨"}
            </Text>
          </TouchableOpacity>

          {/* 공부 시간: 진행중 또는 완료일 때는 시간 표시 */}
          {(status === "IN_PROGRESS" || status === "DONE") && (
            <>
              <Text style={styles.label}>공부 시간</Text>
              <Text style={styles.timer}>{formatTime(seconds)}</Text>

              {/* 진행중(IN_PROGRESS)일 때만 버튼 표시 */}
              {status === "IN_PROGRESS" && (
                <View style={styles.timerButtons}>
                  {!running ? (
                    <TouchableOpacity
                      style={styles.startBtn}
                      onPress={() => setRunning(true)}
                    >
                      <Text style={styles.btnText}>타이머 시작</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.stopBtn}
                      onPress={() => setRunning(false)}
                    >
                      <Text style={styles.btnText}>타이머 정지</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
)}


          {/* 닫기 */}
          <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
            <Text style={styles.btnText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContainer: {
    width: "90%",              // 화면 기준 90%
    maxWidth: 820,             // 너가 원하는 최대 폭
    alignSelf: "center",       // 중앙 정렬
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    marginBottom: 20,
    color: "#555",
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "bold",
  },
  statusCycleBtn: {
    marginTop: 10,
    paddingVertical: 6,        // 더 얇게
    paddingHorizontal: 12,     // 가로도 조금 줄임
    backgroundColor: "#6C63FF",
    borderRadius: 6,
    alignSelf: "flex-start",   // 왼쪽으로 붙이기
    justifyContent: "center",
  },
  timer: {
    marginTop: 5,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  timerButtons: {
    marginTop: 10,
    alignItems: "center",
  },
  startBtn: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#4caf50",
  },
  stopBtn: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#e75454",
  },
  closeBtn: {
    marginTop: 20,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#6C63FF",
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
