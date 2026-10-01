import { useTheme } from '../theme/ThemeContext';

// Shared native-stack header look — imported by every Stack navigator so a
// single tweak (color, weight, border) updates the whole app's chrome at once
// instead of drifting across five duplicated screenOptions objects.
//
// `makeHeaderOptions(colors)` builds it for a palette; `useHeaderOptions()`
// reads the live palette so header chrome repaints on theme change.
export const makeHeaderOptions = (c) => ({
  headerStyle: {
    backgroundColor: c.backgroundElevated,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  headerTintColor: c.primary,
  headerTitleStyle: {
    color: c.textPrimary,
    fontWeight: '700',
    fontSize: 17,
  },
  headerShadowVisible: false,
});

export function useHeaderOptions() {
  const { colors: live } = useTheme();
  return makeHeaderOptions(live);
}
