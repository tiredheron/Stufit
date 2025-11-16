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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatbotPage() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  
  const TABBAR_HEIGHT = 70;   
  const FLOATING_BTN_HEIGHT = 70; // 가운데 아이콘 버튼
  const TOTAL_BOTTOM_SPACE = TABBAR_HEIGHT + FLOATING_BTN_HEIGHT * 0.6 + insets.bottom;

  const [messages, setMessages] = useState([
    { from: "bot", text: "안녕하세요! 무엇을 도와드릴까요? 😊" },
  ]);

  const [input, setInput] = useState("");

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: "확인했습니다 😀" }]);
    }, 300);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={TABBAR_HEIGHT + 40}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: TOTAL_BOTTOM_SPACE + 70,
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

        <View
          style={[
            styles.inputWrapper,
            { bottom: TABBAR_HEIGHT + FLOATING_BTN_HEIGHT * 0.4 + insets.bottom },
          ]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요..."
            style={styles.input}
          />

          <Pressable style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={22} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F1FF" },

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
    zIndex: 9999,
    elevation: 100,
    pointerEvents: "box-none",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
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
