import { Pressable, StyleSheet, Text, View } from "react-native";

import { insets, radius, spacing } from "../../theme/theme";
import { useThemedStyles } from "../../theme/ThemeContext";

const PageNavigation = ({ currentPage, totalPages, onPrevious, onNext }) => {
  const styles = useThemedStyles(makeStyles);
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;

  return (
    <View style={styles.footer}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isFirstPage }}
        disabled={isFirstPage}
        onPress={onPrevious}
        style={({ pressed }) => [
          styles.button,
          isFirstPage && styles.buttonDisabled,
          pressed && !isFirstPage && styles.buttonPressed
        ]}
      >
        <Text
          style={[styles.buttonText, isFirstPage && styles.buttonTextDisabled]}
        >
          ← Previous
        </Text>
      </Pressable>

      <View style={styles.indicator}>
        <Text style={styles.indicatorText}>
          Page <Text style={styles.indicatorStrong}>{currentPage + 1}</Text> of{" "}
          {totalPages}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isLastPage }}
        disabled={isLastPage}
        onPress={onNext}
        style={({ pressed }) => [
          styles.button,
          styles.buttonPrimary,
          isLastPage && styles.buttonDisabled,
          pressed && !isLastPage && styles.buttonPressed
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            styles.buttonTextPrimary,
            isLastPage && styles.buttonTextDisabled
          ]}
        >
          Next →
        </Text>
      </Pressable>
    </View>
  );
};

const makeStyles = ({ colors }) => StyleSheet.create({
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },

  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt
  },

  buttonPrimary: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },

  buttonDisabled: {
    opacity: 0.35
  },

  buttonPressed: {
    opacity: 0.7
  },

  buttonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700"
  },

  buttonTextPrimary: {
    color: "#1B1200"
  },

  buttonTextDisabled: {
    color: colors.muted
  },

  indicator: {
    flex: 1,
    alignItems: "center"
  },

  indicatorText: {
    color: colors.muted,
    fontSize: 12
  },

  indicatorStrong: {
    color: colors.text,
    fontWeight: "700"
  }
});

export default PageNavigation;
