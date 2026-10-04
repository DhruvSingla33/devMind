import React, { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { radius, spacing } from '../theme/theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';

// Variant palettes depend on the theme, so they're built per-render from the
// live colors rather than frozen at module-load.
const makeVariants = (colors) => ({
  primary: { bg: colors.primary, border: colors.primary, text: colors.textOnDark, glow: true },
  outline: { bg: 'transparent', border: colors.border, text: colors.textPrimary },
  ghost: { bg: 'transparent', border: 'transparent', text: colors.primary },
  light: { bg: colors.white, border: colors.border, text: colors.textOnLight },
});

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textColor,
}) {
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [isHovered, setIsHovered] = useState(false);
  const VARIANTS = makeVariants(colors);
  const basePalette = VARIANTS[variant] || VARIANTS.primary;
  const palette = textColor ? { ...basePalette, text: textColor } : basePalette;
  const isDisabled = disabled || loading;
  const isSmall = size === 'sm';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={({ pressed }) => [
        styles.base,
        isSmall && styles.baseSm,
        palette.glow && !isDisabled && styles.glow,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: isDisabled ? 0.55 : pressed ? 0.85 : 1,
          transform: [
            { translateY: isHovered && !isDisabled && !pressed ? -2 : 0 },
            { scale: pressed && !isDisabled ? 0.97 : 1 },
          ],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <Text style={[typography.button, isSmall && styles.textSm, { color: palette.text }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transitionProperty: 'opacity, transform, box-shadow',
        transitionDuration: '150ms',
        transitionTimingFunction: 'ease',
      },
      default: {},
    }),
  },
  // Compact size for dense rows like the mobile top bar.
  baseSm: {
    paddingVertical: spacing.xs + 1,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  textSm: {
    fontSize: 13,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
});
