import colors from './colors';

// Re-exported so components can pull colors from the theme barrel alongside
// spacing/typography.
export { colors };

// Content-area safe-area padding for the StudySection reader chrome. The
// screen already sits below the navigation header and above the tab bar, so a
// small static inset is enough; bump these if you drop the native header.
export const insets = { top: 0, bottom: 0 };

// Width at which the reader shows page content and MCQs side-by-side.
export const WIDE_BREAKPOINT = 1024;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
};

// Typography carries text colors, so it is theme-dependent: `makeTypography`
// builds the set for a given palette. The static `typography` export below is
// the light/dark set resolved at module-load (backward compat for screens not
// yet migrated to useTheme()); live theming reads it from the ThemeContext,
// which calls makeTypography with the active palette.
export const makeTypography = (c) => ({
  h1: { fontSize: 28, fontWeight: '700', color: c.textPrimary },
  h2: { fontSize: 22, fontWeight: '700', color: c.textPrimary },
  h3: { fontSize: 18, fontWeight: '600', color: c.textPrimary },
  body: { fontSize: 15, fontWeight: '400', color: c.textPrimary },
  bodyMuted: { fontSize: 14, fontWeight: '400', color: c.textSecondary },
  caption: { fontSize: 12, fontWeight: '500', color: c.textMuted },
  button: { fontSize: 16, fontWeight: '600' },
});

export const typography = makeTypography(colors);

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
};

export const theme = { colors, spacing, radius, typography, shadow };

export default theme;
