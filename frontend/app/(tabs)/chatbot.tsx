import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";

function getApiHost() {
  if (Platform.OS === "android") return "10.0.2.2";
  if (Platform.OS === "ios") return "localhost";
  const uri = Constants.expoConfig?.hostUri;
  return uri ? uri.split(":")[0] : "localhost";
}

const API_BASE = `http://${getApiHost()}:8000`;


export default function ChatbotPage() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const { width } = useWindowDimensions();
  const MAX_WIDTH = 820;

  const TABBAR_HEIGHT = 70;
  const FLOATING_BTN_HEIGHT = 70;

  const ORIGINAL_BOTTOM =
    TABBAR_HEIGHT + FLOATING_BTN_HEIGHT * 0.4 + insets.bottom;

  // Android 전용: 입력창 bottom 관리
  const [inputBottom, setInputBottom] = useState(ORIGINAL_BOTTOM);

  // 현재 TextInput이 포커스 상태인지
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    // 키보드 올라올 때
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      if (!focused) return;

      const keyboardHeight = e.endCoordinates.height;

      if (keyboardHeight > 0) {
        // 진짜 키보드 뜸 → 올려줌
        setInputBottom(keyboardHeight + 12);
      } else {
        // toolbar만 뜸 → 그대로 유지
        setInputBottom(ORIGINAL_BOTTOM);
      }
    });

    // 키보드 내려갈 때
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setInputBottom(ORIGINAL_BOTTOM);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [focused]);

  const [messages, setMessages] = useState([
    { id: "init", from: "bot", text: "안녕하세요! 무엇을 도와드릴까요? 😊" },
  ]);

  const [input, setInput] = useState("");

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput("");

    const userMsg = {
      id: Date.now().toString(),
      from: "user",
      text: userText,
    };

    // 1) 유저 메시지 추가
    setMessages((prev) => [...prev, userMsg]);

    // 2) 로딩 메시지 추가
    const loadingId = "loading-" + Date.now();
    setMessages((prev) => [
      ...prev,
      { id: loadingId, from: "bot", text: "답변 생성 중..." },
    ]);

    try {
      // 3) FastAPI /ask 호출
      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      // 4) 로딩 메시지 삭제 후 응답 삽입
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== loadingId)
          .concat({
            id: Date.now().toString(),
            from: "bot",
            text: data.answer || "응답을 생성할 수 없어요 😢",
          })
      );
    } catch (e) {
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== loadingId)
          .concat({
            id: Date.now().toString(),
            from: "bot",
            text: "서버와 연결할 수 없어요 😢",
          })
      );
    }
  };

  return (
    <View style={[styles.outer, { paddingTop: insets.top }]}>
      <View
        style={{
          width: width > MAX_WIDTH ? MAX_WIDTH : "90%",
          flex: 1,
        }}
      >
        {/* iOS는 KeyboardAvoidingView 사용 / Android는 무시 */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={TABBAR_HEIGHT + insets.bottom}
        >
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: ORIGINAL_BOTTOM + 80,
            }}
          >
            {messages.map((msg, i) => (
              <View
                key={i}
                style={[
                  styles.bubble,
                  msg.from === "user" ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text style={{ color: msg.from === "user" ? "#fff" : "#333" }}>
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Android에서는 inputBottom이 키보드/툴바에 따라 자동 조절됨 */}
          <View style={[styles.inputWrapper, { bottom: inputBottom }]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="메시지를 입력하세요..."
              style={styles.input}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />

            <Pressable style={styles.sendBtn} onPress={sendMessage}>
              <Ionicons name="send" size={22} color="#fff" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "#F4F1FF",
    alignItems: "center",
  },

  bubble: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 6,
    maxWidth: "80%",
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#6C63FF",
  },

  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
  },

  inputWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
    zIndex: 999,
    marginBottom: 16
  },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  sendBtn: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
  },
});
