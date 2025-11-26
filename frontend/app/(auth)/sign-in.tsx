import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { router } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignInScreen() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  // Expo 자동 IP 감지 + fallback 처리
  const host =
    Constants.expoConfig?.hostUri?.split(":")[0] || "localhost";
  const API_BASE = `http://${host}:4000`;

  const handleLogin = async () => {
    console.log("Login button pressed");

    if (!userId || !password) {
      Alert.alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          password,
        }),
      });

      const result = await response.json();
      console.log("Login response:", result);

      if (!response.ok) {
        Alert.alert(result.message || "로그인 실패");
        return;
      }

      await AsyncStorage.setItem("auth_token", result.user_id);
      Alert.alert("로그인 성공!", `${userId}님 환영합니다!`);
      router.replace("/(tabs)");

    } catch (err) {
      console.log("Login error:", err);
      Alert.alert("서버 오류", "잠시 후 다시 시도해주세요.");
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
            placeholder="아이디"
            placeholderTextColor="#888"
            style={styles.input}
            autoCapitalize="none"
            value={userId}
            onChangeText={setUserId}
          />

          <TextInput
            placeholder="비밀번호"
            placeholderTextColor="#888"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
            <Text style={styles.linkText}>
              계정이 없으신가요? 회원가입
            </Text>
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
    alignItems: "center",
    marginTop: 6,
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
    marginTop: 12,
  },
});
