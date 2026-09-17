import React from 'react';
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import colors from '../theme/colors';
import { spacing } from '../theme/theme';
import { useBreakpoint } from '../theme/responsive';

const DEFAULT_MAX_WIDTH = 1120;

export default function ScreenContainer({ children, style, noPadding, maxWidth }) {
  const { isWeb, isDesktop, isTablet } = useBreakpoint();

  const webHorizontalPadding = isDesktop ? spacing.xl : isTablet ? spacing.lg : spacing.md;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  padded: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
});
