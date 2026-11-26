import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { spacing } from '../theme/theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import ShimmerSkeleton from './Shimmer';

/**
 * variant: 'list' (default) | 'detail' -> shimmer skeleton
 *          'spinner'                   -> classic spinner + label
 */
export default function LoadingState({ label = 'Loading…', variant = 'list', rows }) {
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  if (variant !== 'spinner') {
    return (
      <View style={styles.flex} accessibilityRole="progressbar" accessibilityLabel={label}>
        <ShimmerSkeleton variant={variant} rows={rows} />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={[typography.bodyMuted, styles.label]}>{label}</Text>
    </View>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  label: {
    marginTop: spacing.sm,
  },
});
