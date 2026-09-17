import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import colors from '../theme/colors';
import { radius, shadow, spacing } from '../theme/theme';

export default function Card({ children, onPress, style, noPadding }) {
  const [isHovered, setIsHovered] = useState(false);
  const content = (
    <View
      style={[
        styles.card,
        noPadding && styles.noPadding,
        isHovered && !!onPress && styles.cardHovered,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={({ pressed }) => [styles.pressable, { opacity: pressed ? 0.85 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadow.card,
    ...Platform.select({
      web: {
        transitionProperty: 'transform, box-shadow, border-color',
        transitionDuration: '150ms',
        transitionTimingFunction: 'ease',
      },
      default: {},
    }),
  },
  noPadding: {
    padding: 0,
  },
  cardHovered: Platform.select({
    web: {
      transform: [{ translateY: -3 }],
      borderColor: colors.primary,
      shadowOpacity: 0.14,
      shadowRadius: 20,
    },
    default: {},
  }),
});
