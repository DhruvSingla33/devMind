import React from 'react';
import { Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// The real brand artwork (cropped from the marketing banner, background
// keyed out to transparent) — not a code-drawn approximation. The flattened
// "lockup" (mark + wordmark + tagline) has the wordmark baked in as black
// pixels, so it only reads on a light backdrop; dark theme falls back to the
// mark alone (red/white, legible either way) since there's no dark-safe
// version of the wordmark asset to fall back on.
const LOCKUP_RATIO = 1153 / 261;
const MARK_RATIO = 330 / 282;

const LOCKUP_WIDTH = {
  sm: 132,
  md: 190,
  lg: 300,
};

const MARK_HEIGHT = {
  sm: 30,
  md: 40,
  lg: 60,
};

export default function Logo({ size = 'md', style }) {
  const { isDark } = useTheme();
  if (!isDark) {
    const width = LOCKUP_WIDTH[size] || LOCKUP_WIDTH.md;
    return (
      <Image
        source={require('../images/logo-lockup.png')}
        style={[{ width, height: width / LOCKUP_RATIO }, style]}
        resizeMode="contain"
      />
    );
  }

  const height = MARK_HEIGHT[size] || MARK_HEIGHT.md;
  return (
    <Image
      source={require('../images/logo-mark.png')}
      style={[{ width: height * MARK_RATIO, height }, style]}
      resizeMode="contain"
    />
  );
}
