import React from 'react';
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import { spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';
import { useBreakpoint } from '../theme/responsive';

const DEFAULT_MAX_WIDTH = 1120;

export default function ScreenContainer({ children, style, noPadding, maxWidth }) {
  const { isWeb, isDesktop, isTablet } = useBreakpoint();
  const styles = useThemedStyles(makeStyles);

  const webHorizontalPadding = isDesktop ? spacing.xl : isTablet ? spacing.lg : spacing.md;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.flexFill,
          !noPadding && styles.padded,
          isWeb && {
            width: '100%',
            maxWidth: maxWidth ?? DEFAULT_MAX_WIDTH,
            alignSelf: 'center',
            paddingHorizontal: noPadding ? 0 : webHorizontalPadding,
          },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Split out from `padded` so `noPadding` (HomeScreen, PublicBookDetailScreen)
  // still gets flex:1 — without it, the child ScrollView had no flex-bound
  // parent on web and grew to its full content height instead of staying
  // viewport-sized, so it never actually scrolled and everything past the
  // fold was clipped by the navigator's screen wrapper.
  flexFill: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.md,
  },
});
