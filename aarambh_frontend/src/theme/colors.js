// Aarambh brand palette — supports both a light and a dark theme.
//
// The accent red (#E63946 "Imperial Red") is the brand color and stays the
// same in both themes. In each palette `background` (the page canvas) is
// deliberately a different value from `surface` (cards/inputs) so cards lift
// off the page — impossible when both share one value.
//
// The ACTIVE palette is chosen once, at module-load time, from the user's saved
// preference (see theme/themeMode.js and index.js). Because almost every screen
// imports `colors`/`typography` statically, selecting here means the whole app
// picks up the right theme without any per-screen changes. Switching themes
// reloads the app so these modules re-evaluate with the new palette.
import { Appearance } from 'react-native';

export const lightColors = {
  background: '#F3F4F7',
  backgroundElevated: '#EAEBF0',
  surface: '#FFFFFF',
  surfaceAlt: '#F2F2F5',
  border: '#E2E3E9',

  white: '#FFFFFF',
  offWhite: '#F3F4F7',

  textPrimary: '#17171A',
  textSecondary: '#5B5B66',
  textMuted: '#8E8E98',
  textOnLight: '#17171A',
  textOnDark: '#FFFFFF',

  primary: '#E63946',
  primaryDark: '#B5182A',
  primaryLight: '#FF6B74',
  primaryMuted: 'rgba(230, 57, 70, 0.08)',

  success: '#18875A',
  warning: '#B4700D',
  danger: '#E63946',

  overlay: 'rgba(17, 17, 20, 0.5)',

  // Aliases used by the StudySection reader components (they were authored
  // against a text/muted/accent naming scheme).
  text: '#17171A',
  muted: '#5B5B66',
  faint: '#8E8E98',
  accent: '#E63946',
  accentSoft: 'rgba(230, 57, 70, 0.08)',
  primarySoft: 'rgba(230, 57, 70, 0.08)',
  successSoft: 'rgba(24, 135, 90, 0.12)',
  dangerSoft: 'rgba(230, 57, 70, 0.12)',
};

export const darkColors = {
  background: '#0E0E11',
  backgroundElevated: '#17171C',
  surface: '#1C1C22',
  surfaceAlt: '#24242B',
  border: '#2E2E37',

  white: '#FFFFFF',
  offWhite: '#F3F4F7',

  textPrimary: '#F4F4F7',
  textSecondary: '#B7B7C2',
  textMuted: '#85858F',
  textOnLight: '#17171A',
  textOnDark: '#FFFFFF',

  primary: '#E63946',
  primaryDark: '#B5182A',
  primaryLight: '#FF6B74',
  primaryMuted: 'rgba(230, 57, 70, 0.16)',

  success: '#3DBB86',
  warning: '#E0A23C',
  danger: '#FF6B74',

  overlay: 'rgba(0, 0, 0, 0.6)',

  // Aliases used by the StudySection reader components (they were authored
  // against a text/muted/accent naming scheme).
  text: '#F4F4F7',
  muted: '#B7B7C2',
  faint: '#85858F',
  accent: '#E63946',
  accentSoft: 'rgba(230, 57, 70, 0.16)',
  primarySoft: 'rgba(230, 57, 70, 0.16)',
  successSoft: 'rgba(61, 187, 134, 0.16)',
  dangerSoft: 'rgba(255, 107, 116, 0.16)',
};

// Resolve the mode chosen before the app tree loaded. `globalThis.__themeMode`
// is set in index.js from persisted storage; 'system' follows the OS setting.
function resolveScheme() {
  const mode = globalThis.__themeMode || 'system';
  if (mode === 'light' || mode === 'dark') {
    return mode;
  }
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

export const activeScheme = resolveScheme();
export const isDarkTheme = activeScheme === 'dark';
export const colors = isDarkTheme ? darkColors : lightColors;

export default colors;
