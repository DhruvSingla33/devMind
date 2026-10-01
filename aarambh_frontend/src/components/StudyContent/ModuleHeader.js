import { StyleSheet, Text, View } from "react-native";

import { insets, radius, spacing } from "../../theme/theme";
import { useThemedStyles } from "../../theme/ThemeContext";
import ViewModeToggle from "./ViewModeToggle";

const ModuleHeader = ({
  chapter,
  currentPage,
  totalPages,
  viewMode,
  onViewModeChange
}) => {
  const styles = useThemedStyles(makeStyles);
  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.subject} numberOfLines={1}>
            {"📘"} {chapter.subject}
          </Text>

          <Text style={styles.title} numberOfLines={2}>
            {chapter.title}
          </Text>
        </View>

        {totalPages > 0 ? (
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {currentPage} / {totalPages}
            </Text>
          </View>
        ) : null}
      </View>

      {viewMode && onViewModeChange ? (
        <View style={styles.toggleRow}>
          <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
        </View>
      ) : null}

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
};

const makeStyles = ({ colors }) => StyleSheet.create({
  header: {
    paddingTop: insets.top + spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },

  left: {
    flex: 1
  },

  subject: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },

  title: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24
  },

  counterBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft
  },

  counterText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"]
  },

  toggleRow: {
    marginTop: spacing.md
  },

  progressTrack: {
    marginTop: spacing.md,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: "hidden"
  },

  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.primary
  }
});

export default ModuleHeader;
