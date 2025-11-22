import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  Pressable
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import Constants from "expo-constants";
import { router } from "expo-router";

export default function ProfileScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");

  // 🔥 비밀번호 변경 변수 통일
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const host = Constants.expoConfig?.hostUri?.split(":")[0] || "localhost";
  const API_BASE = `http://${host}:4000`;

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("auth_token");
      setUserId(token);

      // 사용자 프로필 데이터 불러오기
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/auth/user-info?user_id=${token}`);
          const data = await res.json();

          if (res.ok) {
            setUniversity(data.university_name);
            setDepartment(data.department_name);
          }
        } catch (err) {
          console.log("프로필 불러오기 오류:", err);
        }
      }
    })();
  }, []);

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("모든 비밀번호 항목을 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "비밀번호 변경 실패");
        return;
      }

      alert("비밀번호 변경 완료!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (err) {
      console.log(err);
      alert("서버 오류");
    }
  };

  const handleProfileSave = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          university_name: university,
          department_name: department,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert(data.message || "프로필 저장 실패");
        return;
      }

      Alert.alert("프로필 저장 완료!");

    } catch (err) {
      console.log(err);
      Alert.alert("서버 오류");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("auth_token");
    router.replace("/(auth)/sign-in");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.wrapper}>
        
        <Text style={styles.title}>프로필</Text>

        <View style={styles.card}>
          <Text style={styles.label}>아이디</Text>
          <Text style={styles.value}>{userId}</Text>

          {/* 🔥 비밀번호 변경 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>비밀번호 변경</Text>

            <TextInput
              style={styles.input}
              placeholder="현재 비밀번호"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="새 비밀번호"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="새 비밀번호 확인"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Pressable style={styles.saveBtn} onPress={handlePasswordChange}>
              <Text style={styles.saveBtnText}>변경하기</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>학교명</Text>
          <TextInput
            style={styles.input}
            value={university}
            onChangeText={setUniversity}
          />

          <Text style={styles.sectionTitle}>학과명</Text>
          <TextInput
            style={styles.input}
            value={department}
            onChangeText={setDepartment}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleProfileSave}>
            <Text style={styles.saveText}>프로필 저장</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>

        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingBottom: 80,
    alignItems: "center",
    backgroundColor: "#f5f4ff",
  },
  section: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  wrapper: {
    width: "100%",
    maxWidth: 450,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4B3EFF",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: "#777",
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: "#6C63FF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  saveText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  logoutBtn: {
    backgroundColor: "#ff5c5c",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
  },
});
