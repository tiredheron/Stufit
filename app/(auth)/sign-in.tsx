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
import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";

export function showAlert(title: string, message?: string) {
  if (Platform.OS === 'web') {
    // 웹에서는 window.alert() 사용
    window.alert(`${title}\n${message || ''}`);
  } else {
    // 모바일은 기본 Alert 사용
    Alert.alert(title, message);
  }
  // 콘솔에서도 디버깅용 출력
  console.log(`[ALERT] ${title}: ${message}`);
}

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<Record<string, string>>({});

  // 앱 시작 시 기존 사용자 목록 로드
  useEffect(() => {
    (async () => {
      // AsyncStorage는 임시 저장소 이므로 추후에 자체 DB가 생기면 그걸로 변경을 진행해야 함.
      const stored = await AsyncStorage.getItem('users');
      if (stored) setUsers(JSON.parse(stored));
    })();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('오류', '이메일과 비밀번호를 모두 입력하세요.');
      return;
    }

    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );

    if (users[email]) {
      // 이미 등록된 이메일
      if (users[email] === hash) {
        // 로그인 세션 유지는 AsyncStorage (임시 저장소)를 그대로 사용해야 한다. (변경하지 말 것.)
        await AsyncStorage.setItem('auth_token', 'logged_in');
        showAlert('로그인 성공', `${email}님 환영합니다!`);
        router.replace('/(tabs)');
      } else {
        showAlert('로그인 실패', '비밀번호가 일치하지 않습니다.');
      }
    } else {
      showAlert('로그인 실패: 등록되지 않은 계정입니다.');
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

  // 메인 카드 UI
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
