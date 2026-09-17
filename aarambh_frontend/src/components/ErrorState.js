import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from './Button';
import colors from '../theme/colors';
import { spacing, typography } from '../theme/theme';

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[typography.body, styles.message]}>{message}</Text>
      {onRetry ? (
        <Button title="Try again" variant="outline" onPress={onRetry} style={styles.retry} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  message: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  retry: {
    minWidth: 140,
  },
});
