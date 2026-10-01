import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { spacing } from '../theme/theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';

export default function LoadingState({ label = 'Loading…' }) {
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={[typography.bodyMuted, styles.label]}>{label}</Text>
    </View>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
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
