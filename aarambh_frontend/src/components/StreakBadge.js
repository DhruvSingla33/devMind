import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getMyStreak } from '../api/mentors.api';
import { radius, spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

export default function StreakBadge() {
  const styles = useThemedStyles(makeStyles);
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getMyStreak()
      .then((data) => {
        if (isMounted) setStreak(data);
      })
      .catch(() => {
        // Decorative widget — fail silently, just don't render anything.
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!streak || !streak.currentStreakDays) return null;

  return (
    <View style={styles.pill}>
      <Text style={styles.text}>
        🔥 {streak.currentStreakDays} day{streak.currentStreakDays === 1 ? '' : 's'} streak
      </Text>
      {streak.hasFreeMentorSessionCredit ? (
        <Text style={styles.creditText}>Free mentor session unlocked</Text>
      ) : null}
    </View>
  );
}

const makeStyles = ({ colors, typography }) => StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  text: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  creditText: {
    ...typography.caption,
    color: colors.success,
    marginTop: 2,
  },
});
