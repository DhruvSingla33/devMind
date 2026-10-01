// Theme-mode preference: 'system' (follow the OS), 'light', or 'dark'.
//
// ThemeContext owns the live mode and persists changes; this module holds the
// shared constants and the pre-mount load used by index.js so first paint
// matches the saved choice.
//
// Default (no stored preference yet) is 'light', not 'system' — the brand is
// white/red and should look that way on first visit regardless of the
// visitor's OS/browser dark-mode setting. Once someone picks a mode via the
// toggle, that explicit choice always wins.
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
