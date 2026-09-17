// Theme-mode preference: 'system' (follow the OS), 'light', or 'dark'.
//
// The chosen palette is selected at module-load time in theme/colors.js, so
// changing the mode requires reloading the app for those modules to re-evaluate
// with the new palette. This module persists the choice and triggers the reload.
import { Platform, DevSettings } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const THEME_MODE_KEY = 'themeMode';
export const THEME_MODES = ['system', 'light', 'dark'];

// The mode resolved before the app tree loaded (set on globalThis in index.js).
export function getThemeMode() {
  const mode = globalThis.__themeMode;
  return THEME_MODES.includes(mode) ? mode : 'system';
}

// Load the persisted mode. Called from index.js before the app renders so that
// theme/colors.js can read it synchronously.
export async function loadThemeMode() {
  try {
    const stored = await AsyncStorage.getItem(THEME_MODE_KEY);
    return THEME_MODES.includes(stored) ? stored : 'system';
  } catch {
    return 'system';
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
