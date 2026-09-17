import { Platform, useWindowDimensions } from 'react-native';

export const breakpoints = {
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

export function useBreakpoint() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isTablet = width >= breakpoints.tablet;
  const isDesktop = width >= breakpoints.desktop;
  const isWide = width >= breakpoints.wide;

  return {
    width,
    height,
    isWeb,
    isTablet,
    isDesktop,
    isWide,
    // Only web at a real desktop width gets the desktop-only chrome (sidebar,
    // hover states, etc). A native iPad (app.json: ios.supportsTablet) can hit
    // this width too, so isWeb must be checked first or the native app would
    // pick up web-only nav/layout by accident.
    isWideWeb: isWeb && isDesktop,
  };
}

export function useColumns(config = {}) {
  const { mobile = 1, tablet = 2, desktop = 3 } = config;
  const { isDesktop, isTablet } = useBreakpoint();

  if (isDesktop) return desktop;
  if (isTablet) return tablet;
  return mobile;
}
