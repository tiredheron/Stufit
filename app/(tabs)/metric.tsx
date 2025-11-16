import { View, Text, StyleSheet } from "react-native";

export default function MetricPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>프로필 페이지</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 40,
  },
});
