// Live theming: the palette lives in React state here instead of being frozen
// at module-load, so toggling light/dark repaints the app with no reload.
//
// - `mode` is the user's choice: 'system' | 'light' | 'dark' (persisted).
// - `scheme` is the resolved 'light' | 'dark' actually rendered ('system'
//   follows the OS via Appearance).
// - Screens read colors/typography through `useTheme()`, and build their
//   StyleSheets through `useThemedStyles(makeStyles)` so both recompute when
//   the palette changes.
//
// Spacing/radius/shadow are theme-independent, so they're still imported
// statically from theme.js; only colors + typography flow through here.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pickColors } from './colors';
import { makeTypography, spacing, radius, shadow } from './theme';
import { THEME_MODE_KEY, THEME_MODES, DEFAULT_THEME_MODE } from './themeMode';

const ThemeContext = createContext(null);

function resolveScheme(mode) {
  if (mode === 'light' || mode === 'dark') {
    return mode;
  }
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  // Seed from the mode index.js already resolved from storage before mount, so
  // first paint matches the persisted choice with no flash.
  const [mode, setModeState] = useState(() => {
    const boot = globalThis.__themeMode;
    return THEME_MODES.includes(boot) ? boot : DEFAULT_THEME_MODE;
  });

  const [systemScheme, setSystemScheme] = useState(() => Appearance.getColorScheme());

  // Only track the OS scheme while following it, so a light/dark OS change
  // repaints a 'system' user but never overrides an explicit choice.
  useEffect(() => {
    if (mode !== 'system') {
      return undefined;
    }
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme));
    return () => sub.remove();
  }, [mode]);

  const scheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  // Persist + update state (no reload). Also mirror to the global so any
  // not-yet-migrated module that reads it stays consistent after a manual reload.
  const setMode = useCallback((next) => {
    const value = THEME_MODES.includes(next) ? next : 'system';
    setModeState(value);
    globalThis.__themeMode = value;
    AsyncStorage.setItem(THEME_MODE_KEY, value).catch(() => {
      // Non-fatal: the in-memory switch still applies for this session.
    });
  }, []);

  const value = useMemo(() => {
    const colors = pickColors(scheme);
    return {
      mode,
      scheme,
      isDark: scheme === 'dark',
      setMode,
      colors,
      typography: makeTypography(colors),
      spacing,
      radius,
      shadow,
    };
  }, [mode, scheme, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

// Build a themed StyleSheet once per palette change. `factory` receives the
// full theme ({ colors, typography, spacing, radius, shadow }) and returns a
// StyleSheet.create(...) result.
export function useThemedStyles(factory) {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
