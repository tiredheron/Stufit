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

  const host = Constants.expoConfig?.hostUri?.split(":")[0] || "localhost";
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
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          password,
          university_name: university,
          department_name: department,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert(data.message || "회원가입 실패");
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
    <LinearGradient
      colors={["#EFEAFF", "#F7F5FF", "#FFFFFF"]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrapper}
      >
        <View style={styles.card}>
          <Text style={styles.title}>회원가입</Text>

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

          <TextInput
            placeholder="비밀번호 확인"
            placeholderTextColor="#888"
            secureTextEntry
            style={styles.input}
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
          />

          <TextInput
            placeholder="학교명"
            placeholderTextColor="#888"
            style={styles.input}
            value={university}
            onChangeText={setUniversity}
          />

          <TextInput
            placeholder="학과명"
            placeholderTextColor="#888"
            style={styles.input}
            value={department}
            onChangeText={setDepartment}
          />

          <TouchableOpacity style={styles.loginBtn} onPress={handleSignUp}>
            <Text style={styles.loginBtnText}>가입하기</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
            <Text style={styles.linkText}>
              이미 계정이 있으신가요? 로그인
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
