import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, shadow, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

// A titled dashboard card: optional subtitle on the left, optional `right`
// accessory (filter chip, "View All" link). Body is `children`.
export function SectionCard({ title, subtitle, icon, right, children, style, padded = true }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.card, style]}>
      {(title || right) && (
        <View style={styles.cardHead}>
          <View style={{ flex: 1 }}>
            {title ? (
              <View style={styles.titleRow}>
                {icon ? <Text style={styles.titleIcon}>{icon}</Text> : null}
                <Text style={styles.cardTitle}>{title}</Text>
              </View>
            ) : null}
            {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
          </View>
          {right}
        </View>
      )}
      <View style={padded ? null : styles.flush}>{children}</View>
    </View>
  );
}

// Small rounded status chip. `tone` sets text color; background is a soft tint.
export function Pill({ label, color, soft = true }) {
  const { colors } = useTheme();
  const c = color || colors.primary;
  return (
    <View style={[pillStyles.pill, { backgroundColor: soft ? `${c}22` : c }]}>
      <Text style={[pillStyles.pillText, { color: soft ? c : '#fff' }]}>{label}</Text>
    </View>
  );
}

export function Dot({ color, size = 9 }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}

export function LegendRow({ items }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      {items.map((it) => (
        <View key={it.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Dot color={it.color} />
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function LinkText({ label, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

const pillStyles = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  pillText: { fontSize: 11, fontWeight: '700' },
});

const makeStyles = ({ colors }) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      ...shadow.card,
    },
    cardHead: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md, gap: spacing.sm },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    titleIcon: { fontSize: 16 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
    cardSubtitle: { fontSize: 12.5, color: colors.textSecondary, marginTop: 3 },
    flush: { marginHorizontal: -spacing.md, marginBottom: -spacing.md },
  });
