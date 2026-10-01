import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { radius, spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

// Pill-shaped filter toggle and a labelled, horizontally scrolling row of them.
// Shared by the quiz-bank builder and the bookmarks screen.

export const toggleValue = (list, value) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export function Chip({ label, active, onPress }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function FilterRow({ label, children }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {children}
      </ScrollView>
    </View>
  );
}

const makeStyles = ({ colors, typography }) =>
  StyleSheet.create({
    pressed: { opacity: 0.75 },
    filterRow: { gap: spacing.xs },
    filterLabel: {
      ...typography.caption,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    chipRow: { gap: spacing.xs, paddingRight: spacing.md },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: 7,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      maxWidth: 240,
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
    chipTextActive: { color: colors.textOnDark },
  });
