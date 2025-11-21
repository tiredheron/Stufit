import { View, Text, StyleSheet, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function ProfilePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>프로필 페이지</Text>

      {/* 로그아웃 버튼 */}
      <Pressable
        onPress={async () => {
          await AsyncStorage.removeItem("auth_token");
          router.replace("/(auth)/sign-in");
        }}
        style={styles.logoutBtn}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 40,
  },

  logoutBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#6C63FF",
    borderRadius: 12,
    marginTop: 20,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
