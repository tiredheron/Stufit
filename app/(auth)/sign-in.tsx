import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";

export function showAlert(title: string, message?: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message || ""}`);
  } else {
    Alert.alert(title, message);
  }
  console.log(`[ALERT] ${title}: ${message}`);
}

// ⚠️ 네 PC IP 주소 사용 (ipconfig 기준)
const API_URL = "http://10.100.142.113:4000";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("오류", "이메일과 비밀번호를 모두 입력하세요.");
      return;
    }

    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: email,
          password: hash,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert("로그인 실패", data.message || "로그인에 실패했습니다.");
        return;
      }

      // 로그인 세션 저장
      await AsyncStorage.setItem("auth_token", "logged_in");

      showAlert("로그인 성공", `${email}님 환영합니다!`);
      router.replace("/(tabs)");
    } catch (error) {
      console.error(error);
      showAlert("오류", "서버에 연결할 수 없습니다.\n백엔드가 켜져 있는지 확인하세요.");
    }
  };

  return (
    <LinearGradient
      colors={["#EFEAFF", "#F7F5FF", "#FFFFFF"]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrapper}
      >
        <View style={styles.card}>
          <Text style={styles.title}>로그인</Text>

          <TextInput
            placeholder="이메일"
            placeholderTextColor="#888"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            placeholder="비밀번호"
            placeholderTextColor="#888"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>로그인</Text>
          </Pressable>

          <TouchableOpacity
            style={{ marginTop: 16 }}
            onPress={() => router.push("/(auth)/sign-up")}
          >
            <Text style={styles.linkText}>아직 회원이 아니신가요? 회원가입</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    paddingVertical: 40,
    paddingHorizontal: 28,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 28,
    color: "#4B3EFF",
  },
  input: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  loginBtn: {
    backgroundColor: "#6C63FF",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
    alignItems: "center",
    shadowColor: "#6C63FF",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  linkText: {
    fontSize: 14,
    textAlign: "center",
    color: "#6C63FF",
    textDecorationLine: "underline",
  },
});
