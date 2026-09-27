import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors, { isDarkTheme } from '../theme/colors';
import { radius } from '../theme/theme';
import { setThemeMode } from '../theme/themeMode';

// Shared light/dark switch (sun/moon pill) — same visual used on Home. Reload
// happens inside setThemeMode once the new mode is persisted, so this stays a
// plain read of the module-load palette rather than local state.
export default function ThemeToggle({ style }) {
  const toggle = () => setThemeMode(isDarkTheme ? 'light' : 'dark');

  return (
    <Pressable onPress={toggle} hitSlop={8} style={[styles.toggle, style]}>
      <View style={[styles.thumb, isDarkTheme && styles.thumbDark]}>
        <Text style={styles.icon}>{isDarkTheme ? '🌙' : '☀️'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 54,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  thumbDark: {
    alignSelf: 'flex-end',
    backgroundColor: colors.surface,
  },
  icon: {
    fontSize: 12,
  },
});
