import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StreakBadge from '../../components/StreakBadge';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { getThemeMode, setThemeMode } from '../../theme/themeMode';
import { radius, spacing, typography } from '../../theme/theme';
import { hexToRgba } from '../../utils/color';

const THEME_OPTIONS = [
  { key: 'system', icon: '🌗', label: 'System' },
  { key: 'light', icon: '☀️', label: 'Light' },
  { key: 'dark', icon: '🌙', label: 'Dark' },
];

const ROWS = [
  { key: 'role', icon: '🎓', label: 'Role', value: (user) => user?.role },
  { key: 'signin', icon: '🔐', label: 'Sign-in method', value: (user) => user?.authProvider },
  {
    key: 'verified',
    icon: '✉️',
    label: 'Email verified',
    value: (user) => (user?.isEmailVerified ? 'Yes' : 'No'),
  },
];

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const initial = (user?.name?.[0] || '?').toUpperCase();
  const currentMode = getThemeMode();

  // The content-management panel needs real file pickers, so it's web-only —
  // admins on a phone just use the normal app.
  const canManageContent = user?.role === 'admin' && Platform.OS === 'web';

  // Changing the theme reloads the app so every screen re-picks the palette;
  // no-op if the tapped mode is already active.
  const onSelectTheme = (mode) => {
    if (mode !== currentMode) {
      setThemeMode(mode);
    }
  };

  return (
    <ScreenContainer maxWidth={640}>
      <View style={[styles.hero, { backgroundColor: hexToRgba(colors.primary, 0.08) }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={typography.h2}>{user?.name}</Text>
        {user?.email ? <Text style={typography.bodyMuted}>{user.email}</Text> : null}
        {user?.phone ? <Text style={typography.bodyMuted}>{user.phone}</Text> : null}
        <View style={styles.streakWrap}>
          <StreakBadge />
        </View>
      </View>

      <Card style={styles.card} noPadding>
        {ROWS.map((row, index) => (
          <View
            key={row.key}
            style={[styles.row, index < ROWS.length - 1 && styles.rowDivider]}
          >
            <View style={styles.rowLabel}>
              <Text style={styles.rowIcon}>{row.icon}</Text>
              <Text style={typography.bodyMuted}>{row.label}</Text>
            </View>
            <Text style={styles.rowValue}>{row.value(user)}</Text>
          </View>
        ))}
      </Card>

      <Text style={[typography.caption, styles.sectionLabel]}>APPEARANCE</Text>
      <View style={styles.themeRow}>
        {THEME_OPTIONS.map((option) => {
          const selected = option.key === currentMode;
          return (
            <Pressable
              key={option.key}
              onPress={() => onSelectTheme(option.key)}
              style={[styles.themeOption, selected && styles.themeOptionSelected]}
            >
              <Text style={styles.themeIcon}>{option.icon}</Text>
              <Text style={[styles.themeLabel, selected && styles.themeLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {canManageContent ? (
        <>
          <Text style={[typography.caption, styles.sectionLabel]}>ADMIN</Text>
          <Button
            title="Open admin panel"
            onPress={() => navigation.navigate('Admin')}
            style={styles.adminButton}
          />
        </>
      ) : null}

      <Button title="Log out" variant="outline" onPress={logout} style={styles.logout} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginHorizontal: -spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
  },
  streakWrap: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.white,
  },
  card: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowIcon: {
    fontSize: 16,
  },
  rowValue: {
    ...typography.body,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    letterSpacing: 1,
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  themeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: hexToRgba(colors.primary, 0.1),
  },
  themeIcon: {
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  themeLabel: {
    ...typography.bodyMuted,
    fontWeight: '600',
  },
  themeLabelSelected: {
    color: colors.primary,
  },
  adminButton: {
    marginTop: spacing.xs,
  },
  logout: {
    marginTop: spacing.lg,
  },
});
