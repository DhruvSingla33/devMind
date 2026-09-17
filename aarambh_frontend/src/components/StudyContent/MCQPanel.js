import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import MCQCard from "./MCQCard";
import { colors, radius, spacing } from "../../theme/theme";

const FILTERS = ["ALL", "NEET"];

const MCQPanel = ({ questions = [] }) => {
  const [activeFilter, setActiveFilter] = useState("ALL");

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.statusDot} />

          <Text style={styles.title}>High-Probability Exam Questions</Text>

          <View style={styles.cachedBadge}>
            <Text style={styles.cachedText}>cached</Text>
          </View>
        </View>

        <View style={styles.filters}>
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <Pressable
                key={filter}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                onPress={() => setActiveFilter(filter)}
                style={({ pressed }) => [
                  styles.filterButton,
                  isActive && styles.filterButtonActive,
                  pressed && styles.filterButtonPressed
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {questions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>{"🗒️"}</Text>

          <Text style={styles.emptyText}>
            No questions available for this page.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {questions.map((question, index) => (
            <MCQCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    gap: spacing.md
  },

  header: {
    gap: spacing.md
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.success
  },

  title: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700"
  },

  cachedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt
  },

  cachedText: {
    color: colors.faint,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.4
  },

  filters: {
    flexDirection: "row",
    gap: spacing.sm
  },

  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },

  filterButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },

  filterButtonPressed: {
    opacity: 0.75
  },

  filterText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5
  },

  filterTextActive: {
    color: colors.primary
  },

  empty: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: colors.surface
  },

  emptyIcon: {
    fontSize: 24
  },

  emptyText: {
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: 13,
    textAlign: "center"
  },

  list: {
    gap: spacing.md
  }
});

export default MCQPanel;
