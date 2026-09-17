import { Platform, StatusBar } from "react-native";

export const colors = {
  background: "#0F1115",
  surface: "#171A21",
  surfaceAlt: "#1E222B",
  border: "#2A2F3A",

  text: "#E8EAF0",
  muted: "#9AA3B2",
  faint: "#6B7383",

  primary: "#F59E0B",
  primarySoft: "rgba(245, 158, 11, 0.14)",

  accent: "#8B5CF6",
  accentSoft: "rgba(139, 92, 246, 0.16)",

  success: "#22C55E",
  successSoft: "rgba(34, 197, 94, 0.14)",

  danger: "#EF4444",
  dangerSoft: "rgba(239, 68, 68, 0.14)"
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999
};

// The two-column layout only makes sense on tablets / web.
export const WIDE_BREAKPOINT = 900;

// Lightweight safe-area approximation so the app stays dependency free.
// Swap for `react-native-safe-area-context` if you add it later.
export const insets = {
  top: Platform.select({
    android: StatusBar.currentHeight || 24,
    ios: 44,
    default: 12
  }),
  bottom: Platform.select({
    ios: 24,
    default: 12
  })
};
