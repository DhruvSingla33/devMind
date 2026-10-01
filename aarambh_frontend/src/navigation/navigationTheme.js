import { DefaultTheme, DarkTheme } from '@react-navigation/native';

// Build a React Navigation theme for a given palette. Called with the live
// colors + isDark from useTheme() (see RootNavigator) so nav chrome — container
// background, header, card — repaints on theme change instead of at reload.
export const makeNavigationTheme = (colors, isDark) => {
  const base = isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.backgroundElevated,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.primary,
    },
  };
};

export default makeNavigationTheme;
