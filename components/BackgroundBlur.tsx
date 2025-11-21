import { Platform, StyleSheet, View } from "react-native";

export default function BackgroundBlur() {
  return (
    <>
      <View style={[styles.circle, { left: 330, top: 230, backgroundColor: "#7C46F0" }]} />
      <View style={[styles.circle, { left: -20, top: 540, backgroundColor: "#46BDF0" }]} />
      <View style={[styles.circle, { left: 70, top: 210, backgroundColor: "#5F27FF" }]} />
      <View style={[styles.circle, { left: 240, top: 760, backgroundColor: "#F0B646", height: 60, width: 60 }]} />
      <View style={[styles.circle, { left: -20, top: -10, backgroundColor: "#46F080" }]} />
    </>
  );
}

const styles = StyleSheet.create({
  circle: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 50,
    opacity: 0.8,
    ...(Platform.OS === "web" ? { filter: "blur(70px)" } : {}),
  },
});
