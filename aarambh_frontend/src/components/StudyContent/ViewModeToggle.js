import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "../../theme/theme";
import { useThemedStyles } from "../../theme/ThemeContext";

const OPTIONS = [
  { value: "text", label: "📝 Notes" },
  { value: "pdf", label: "📄 PDF" }
];

// Segmented switch between the structured notes and the NCERT PDF pages.
const ViewModeToggle = ({ value, onChange }) => {
  const styles = useThemedStyles(makeStyles);
  return (
  <View style={styles.track} accessibilityRole="tablist">
    {OPTIONS.map((option) => {
      const isActive = option.value === value;
      return (
        <Pressable
          key={option.value}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
          onPress={() => onChange(option.value)}
          style={[styles.option, isActive && styles.optionActive]}
        >
          <Text style={[styles.label, isActive && styles.labelActive]}>
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
  );
};

const makeStyles = ({ colors }) => StyleSheet.create({
  track: {
    flexDirection: "row",
    alignSelf: "flex-start",
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border
  },

  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    ...Platform.select({ web: { cursor: "pointer" }, default: {} })
  },

  optionActive: {
    backgroundColor: colors.primary
  },

  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },

  labelActive: {
    color: colors.textOnDark
  }
});

export default ViewModeToggle;
