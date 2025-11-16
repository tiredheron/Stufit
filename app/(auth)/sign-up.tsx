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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
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


export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<Record<string, string>>({});

  // 기존 사용자 목록 로드
  useEffect(() => {
    (async () => {
        // AsyncStorage는 임시 저장소 이므로 추후에 자체 DB가 생기면 그걸로 변경을 진행해야 함.
        const stored = await AsyncStorage.getItem('users');
        if (stored) setUsers(JSON.parse(stored));
    })();
  }, []);

  const handleSignUp = async () => {
    if (!email || !password) {
      showAlert('오류', '이메일과 비밀번호를 모두 입력하세요.');
      return;
    }

    if (users[email]) {
      showAlert('오류', '이미 존재하는 계정입니다.');
      return;
    }

    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );

    const updatedUsers = { ...users, [email]: hash };
    // AsyncStorage는 임시 저장소 이므로 추후에 자체 DB가 생기면 그걸로 변경을 진행해야 함.
    await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
    await AsyncStorage.setItem('auth_token', 'logged_in');
    setUsers(updatedUsers);

    showAlert('회원가입 완료', `${email} 계정이 생성되었습니다.`);
    router.replace('/(auth)/sign-in');
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
            placeholder="이메일"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
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

          <Pressable style={styles.signUpBtn} onPress={handleSignUp}>
            <Text style={styles.signUpBtnText}>회원가입 완료</Text>
          </Pressable>

          <TouchableOpacity
            style={{ marginTop: 16 }}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text style={styles.linkText}>이미 계정이 있으신가요? 로그인</Text>
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
    backgroundColor: "#FFFFFF",
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

  signUpBtn: {
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
  },
});