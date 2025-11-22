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

export default function SignUpScreen() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");

  // hostUri fallback 처리
  const host =
    Constants.expoConfig?.hostUri?.split(":")[0] || "localhost";
  const API_BASE = `http://${host}:4000`;

  const handleSignUp = async () => {
    if (!userId || !password || !passwordConfirm || !university || !department) {
      Alert.alert("모든 항목을 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          password,
          university_name: university,
          department_name: department,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        Alert.alert(result.message || "회원가입 실패");
        return;
      }

      Alert.alert("회원가입 완료!", "로그인 화면으로 이동합니다.");
      router.push("/(auth)/sign-in");
    } catch (err) {
      console.log(err);
      Alert.alert("서버 오류", "잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <LinearGradient colors={["#f1eeff", "#f7f4ff"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inner}
      >
        <Text style={styles.title}>회원가입</Text>

        <TextInput
          style={styles.input}
          placeholder="아이디"
          value={userId}
          onChangeText={setUserId}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          secureTextEntry
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
        />

        <TextInput
          style={styles.input}
          placeholder="학교명"
          value={university}
          onChangeText={setUniversity}
        />

        <TextInput
          style={styles.input}
          placeholder="학과명"
          value={department}
          onChangeText={setDepartment}
        />

        {/* Pressable → 반드시 TouchableOpacity */}
        <TouchableOpacity style={styles.signUpBtn} onPress={handleSignUp}>
          <Text style={styles.signUpBtnText}>가입하기</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
          <Text style={styles.linkText}>이미 계정이 있으신가요? 로그인하기</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#6C63FF",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    height: 52,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  signUpBtn: {
    backgroundColor: "#6C63FF",
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  signUpBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  linkText: {
    fontSize: 14,
    textAlign: "center",
    color: "#6C63FF",
    textDecorationLine: "underline",
    marginTop: 15,
  },
});
