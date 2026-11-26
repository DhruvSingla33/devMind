import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radius, spacing } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';

// Shared looping value so every shimmer block on screen sweeps in sync.
const progress = new Animated.Value(0);
let loop = null;
let users = 0;

function useSharedShimmer() {
  useEffect(() => {
    users += 1;
    if (!loop) {
      loop = Animated.loop(
        Animated.timing(progress, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        })
      );
      loop.start();
    }
    return () => {
      users -= 1;
      if (users === 0 && loop) {
        loop.stop();
        loop = null;
        progress.setValue(0);
      }
    };
  }, []);
  return progress;
}

/** A single shimmering placeholder block. */
export function ShimmerBlock({ width = '100%', height = 14, borderRadius = radius.sm, style }) {
  const { colors, scheme, isDark } = useTheme();
  const dark = isDark ?? scheme === 'dark';
  const value = useSharedShimmer();
  const [w, setW] = useState(0);

  const base = colors.surfaceAlt;
  const highlight = dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)';

  const translateX = value.interpolate({
    inputRange: [0, 1],
    outputRange: [-w, w],
  });

  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[{ width, height, borderRadius, backgroundColor: base, overflow: 'hidden' }, style]}
    >
      {w > 0 && (
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
          <LinearGradient
            colors={['transparent', highlight, 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
}

function CardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ShimmerBlock width={48} height={48} borderRadius={radius.md} />
      <View style={styles.cardBody}>
        <ShimmerBlock width="70%" height={16} />
        <ShimmerBlock width="45%" height={12} />
      </View>
    </View>
  );
}

function DetailSkeleton() {
  return (
    <View style={styles.detail}>
      <ShimmerBlock height={160} borderRadius={radius.lg} />
      <ShimmerBlock width="60%" height={22} />
      <ShimmerBlock width="90%" />
      <ShimmerBlock width="85%" />
      <ShimmerBlock width="40%" />
      <View style={{ height: spacing.md }} />
      <CardSkeleton />
      <CardSkeleton />
    </View>
  );
}

/** Full-screen skeleton. variant: 'list' | 'detail' */
export default function ShimmerSkeleton({ variant = 'list', rows = 6 }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {variant === 'detail' ? (
        <DetailSkeleton />
      ) : (
        <>
          <ShimmerBlock width="50%" height={24} style={{ marginBottom: spacing.sm }} />
          {Array.from({ length: rows }).map((_, i) => <CardSkeleton key={i} />)}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardBody: { flex: 1, gap: spacing.sm },
  detail: { gap: spacing.md },
});
