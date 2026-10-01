import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

export default function LeaderboardScreen() {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <ScreenContainer maxWidth={640}>
      <View style={styles.hero}>
        <Text style={styles.icon}>🏆</Text>
        <Text style={typography.h2}>Leaderboard</Text>
        <Text style={[typography.bodyMuted, styles.subtitle]}>
          Rankings based on daily practice and accuracy are coming soon — keep your streak going
          to climb once it launches.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const makeStyles = () => StyleSheet.create({
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
