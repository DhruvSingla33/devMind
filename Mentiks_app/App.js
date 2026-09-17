import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import StudySection from "./pages/StudySection/StudySection";
import { studyData } from "./data/studyData";
import { colors } from "./theme/theme";

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <StudySection studyData={studyData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
