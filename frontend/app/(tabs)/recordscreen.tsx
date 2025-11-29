import { Platform, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import BackgroundBlur from "../../components/BackgroundBlur";
import HeaderBar from "../../components/HeaderBar";
import ProjectProgressRow from "../../components/ProjectProgressRow";
import SubjectGroups from "../../components/SubjectGroups";
import TodayProgressCard from "../../components/TodayProgressCard";

export default function RecordScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const maxWidth =
    Platform.OS === "web"
      ? 1000
      : isTablet
      ? 600
      : 430;

  const horizontalPadding = 16;
  const contentWidth = Math.min(width - horizontalPadding * 2, maxWidth);

  return (
    <View style={styles.page}>
      <BackgroundBlur />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollArea}
      >
        <View style={{ width: contentWidth, alignSelf: "center" }}>
          <HeaderBar contentWidth={contentWidth} />
          <TodayProgressCard 
            contentWidth={contentWidth}
            onPressOverall={() => router.push("/(tabs)/metric?tab=department")}
            onPressMajor={() => router.push("/(tabs)/metric?tab=personal")}
          />
          <ProjectProgressRow contentWidth={contentWidth} isTablet={isTablet} />
          <SubjectGroups contentWidth={contentWidth} isTablet={isTablet} />
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollArea: {
    paddingTop: 20,
    paddingBottom: 40,
  },
});
