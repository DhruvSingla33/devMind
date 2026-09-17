import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import StreakBadge from '../../components/StreakBadge';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/theme';
import { hexToRgba } from '../../utils/color';

const QUICK_ACTIONS = [
  {
    key: 'textbooks',
    icon: '📚',
    title: 'Practice by NCERT chapter',
    subtitle: 'Physics, Chemistry, Biology & Maths — Class XI & XII',
    tab: 'TextbooksTab',
    screen: 'TextbookList',
    color: '#3DD68C',
  },
  {
    key: 'mix-quiz',
    icon: '⚡',
    title: 'Start a Mix Quiz',
    subtitle: 'A custom CBT-style quiz from high-probability questions',
    tab: 'TestsTab',
    screen: 'MixQuizSetup',
    color: colors.primary,
  },
  {
    key: 'attempts',
    icon: '📈',
    title: 'My attempts',
    subtitle: 'Review your score history and accuracy',
    tab: 'TestsTab',
    screen: 'MyAttempts',
    color: '#5B8CFF',
  },
  {
    key: 'pulse',
    icon: '🧠',
    title: "Today's Pulse",
    subtitle: '5-minute daily memory workout',
    tab: 'MoreTab',
    screen: 'Pulse',
    color: '#B455E6',
  },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')?.[0] || 'there';

  return (
    <ScreenContainer noPadding>
      <Grid
        data={QUICK_ACTIONS}
        keyExtractor={(action) => action.key}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={[styles.hero, { backgroundColor: hexToRgba(colors.primary, 0.08) }]}>
            <Text style={typography.h2}>Hi {firstName} 👋</Text>
            <Text style={[typography.bodyMuted, styles.subtitle]}>
              See what will be asked — pick up where you left off.
            </Text>
            <StreakBadge />
          </View>
        }
        renderItem={({ item: action }) => (
          <Card
            onPress={() => navigation.navigate(action.tab, { screen: action.screen })}
            style={[styles.actionCard, { borderTopColor: action.color }]}
          >
            <View style={styles.actionRow}>
              <View style={[styles.iconBadge, { backgroundColor: hexToRgba(action.color, 0.14) }]}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </View>
              <View style={styles.actionText}>
                <Text style={typography.h3}>{action.title}</Text>
                <Text style={[typography.bodyMuted, styles.actionSubtitle]}>{action.subtitle}</Text>
              </View>
              <Text style={[styles.chevron, { color: action.color }]}>›</Text>
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  hero: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    marginHorizontal: -spacing.md,
    marginBottom: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  actionCard: {
    marginBottom: spacing.md,
    borderTopWidth: 3,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    flex: 1,
  },
  actionSubtitle: {
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
});
