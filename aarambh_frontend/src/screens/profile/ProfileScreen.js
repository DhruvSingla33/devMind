import React, { useLayoutEffect } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StreakBadge from '../../components/StreakBadge';
import { useAuth } from '../../context/AuthContext';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme/theme';
import { hexToRgba } from '../../utils/color';

const THEME_OPTIONS = [
  { key: 'system', icon: '🌗', label: 'System' },
  { key: 'light', icon: '☀️', label: 'Light' },
  { key: 'dark', icon: '🌙', label: 'Dark' },
];

const ROWS = [
  { key: 'role', icon: '🎓', label: 'Role', value: (user) => user?.role, tint: '#E7ECFB' },
  {
    key: 'signin',
    icon: '🔐',
    label: 'Sign-in method',
    value: (user) => user?.authProvider,
    tint: '#F2E9FB',
  },
  {
    key: 'verified',
    icon: '✉️',
    label: 'Email verified',
    value: (user) => (user?.isEmailVerified ? 'Yes' : 'No'),
    tint: '#E4F5EC',
  },
];

// Home's bottom tab bar only shows Home / Leaderboard / Aarambh+, so these
// stacks (still fully registered as hidden tabs — see AppTabs.js) need a
// reachable entry point. Profile, opened from Home's ☰ button, is it.
const MORE_LINKS = [
  {
    key: 'textbooks',
    icon: '📚',
    label: 'Textbooks',
    tab: 'TextbooksTab',
    screen: 'TextbookList',
    tint: '#E7F0FB',
  },
  {
    key: 'tests',
    icon: '📝',
    label: 'Mock tests & Mix Quiz',
    tab: 'TestsTab',
    screen: 'TestList',
    tint: '#FBE7EA',
  },
  {
    key: 'attempts',
    icon: '📈',
    label: 'My attempts',
    tab: 'TestsTab',
    screen: 'MyAttempts',
    tint: '#E4F5EC',
  },
  {
    key: 'more',
    icon: '🧭',
    label: 'Mentors, doubts, notes & more',
    tab: 'MoreTab',
    screen: 'MoreHub',
    tint: '#FBF0E3',
  },
];

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors, typography, mode: currentMode, setMode } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const initial = (user?.name?.[0] || '?').toUpperCase();

  // The content-management panel needs real file pickers, so it's web-only —
  // admins on a phone just use the normal app.
  const canManageContent = user?.role === 'admin' && Platform.OS === 'web';

  // Live theme switch via ThemeContext — the app repaints in place, no reload;
  // no-op if the tapped mode is already active.
  const onSelectTheme = (mode) => {
    if (mode !== currentMode) {
      setMode(mode);
    }
  };

  // A header logout button that's always on screen, not just the one at the
  // bottom of a long scroll — that one stays too, but this is the one a
  // student actually finds without hunting for it.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={logout} hitSlop={8} style={styles.headerLogout}>
          <Text style={styles.headerLogoutText}>Log out</Text>
        </Pressable>
      ),
    });
  }, [navigation, logout, styles]);

  return (
    <ScreenContainer maxWidth={640}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
              <View style={[styles.rowIconBadge, { backgroundColor: row.tint }]}>
                <Text style={styles.rowIcon}>{row.icon}</Text>
              </View>
              <Text style={typography.bodyMuted}>{row.label}</Text>
            </View>
            <Text style={styles.rowValue}>{row.value(user)}</Text>
          </View>
        ))}
      </Card>

      <Text style={[typography.caption, styles.sectionLabel]}>EXPLORE</Text>
      <Card style={styles.card} noPadding>
        {MORE_LINKS.map((link, index) => (
          <Pressable
            key={link.key}
            onPress={() => navigation.navigate(link.tab, { screen: link.screen })}
            style={({ pressed }) => [
              styles.row,
              index < MORE_LINKS.length - 1 && styles.rowDivider,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.rowLabel}>
              <View style={[styles.rowIconBadge, { backgroundColor: link.tint }]}>
                <Text style={styles.rowIcon}>{link.icon}</Text>
              </View>
              <Text style={typography.body}>{link.label}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
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

      <Button
        title="Reset password"
        variant="outline"
        onPress={() => navigation.navigate('ResetPassword')}
        style={styles.resetPassword}
      />
      <Button title="Log out" variant="outline" onPress={logout} style={styles.logout} />
      </ScrollView>
    </ScreenContainer>
  );
}

const makeStyles = ({ colors, typography }) => StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
  },
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
  rowIconBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIcon: {
    fontSize: 14,
  },
  rowValue: {
    ...typography.body,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
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
  resetPassword: {
    marginTop: spacing.lg,
  },
  logout: {
    marginTop: spacing.sm,
  },
  headerLogout: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerLogoutText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
