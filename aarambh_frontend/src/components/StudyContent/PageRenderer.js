import { StyleSheet, Text, View } from "react-native";

import ContentBlock from "./ContentBlock";
import { colors, radius, spacing } from "../../theme/theme";

const PageRenderer = ({ page }) => {
  return (
    <View style={styles.article}>
      {page.sections.map((section) => (
        <View key={section.id} style={styles.section}>
          <View style={styles.headingRow}>
            <View style={styles.headingBar} />

            <Text style={styles.heading}>{section.heading}</Text>
          </View>

          {section.content?.map((item, index) => (
            <ContentBlock key={`${section.id}-${index}`} item={item} />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  article: {
    // Fill the column's width. Without this, a react-native-web ScrollView
    // shrink-wraps its content and text wraps at half width.
    width: "100%",
    alignSelf: "stretch",
    gap: spacing.md
  },

  section: {
    width: "100%",
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border
  },

  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },

  headingBar: {
    width: 3,
    height: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.primary
  },

  heading: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: "700"
  }
});

export default PageRenderer;
