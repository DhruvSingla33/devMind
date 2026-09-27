// Theme-mode preference: 'system' (follow the OS), 'light', or 'dark'.
//
// The chosen palette is selected at module-load time in theme/colors.js, so
// changing the mode requires reloading the app for those modules to re-evaluate
// with the new palette. This module persists the choice and triggers the reload.
//
// Default (no stored preference yet) is 'light', not 'system' — the brand is
// white/red and should look that way on first visit regardless of the
// visitor's OS/browser dark-mode setting. Once someone picks a mode via the
// toggle, that explicit choice always wins.
import { Platform, DevSettings } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const THEME_MODE_KEY = 'themeMode';
export const THEME_MODES = ['system', 'light', 'dark'];
export const DEFAULT_THEME_MODE = 'light';

// The mode resolved before the app tree loaded (set on globalThis in index.js).
export function getThemeMode() {
  const mode = globalThis.__themeMode;
  return THEME_MODES.includes(mode) ? mode : DEFAULT_THEME_MODE;
}

// Load the persisted mode. Called from index.js before the app renders so that
// theme/colors.js can read it synchronously.
export async function loadThemeMode() {
  try {
    const stored = await AsyncStorage.getItem(THEME_MODE_KEY);
    return THEME_MODES.includes(stored) ? stored : DEFAULT_THEME_MODE;
  } catch {
    return DEFAULT_THEME_MODE;
  }
}

function reloadApp() {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    return;
  }
  // Native: DevSettings.reload works in dev/Expo Go. Production native builds
  // would need expo-updates' reloadAsync(); wire that in if/when it's added.
  if (DevSettings?.reload) {
    DevSettings.reload();
  }
}

// Persist the mode, update the global, and reload so the new palette applies.
export async function setThemeMode(mode) {
  const next = THEME_MODES.includes(mode) ? mode : 'system';
  try {
    await AsyncStorage.setItem(THEME_MODE_KEY, next);
  } catch {
    // Non-fatal: the reload below still applies the mode from the global.
  }
  globalThis.__themeMode = next;
  reloadApp();
}
