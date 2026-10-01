import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

const ENTRIES = [
  {
    key: 'mentors',
    icon: '🎓',
    title: 'Mentors',
    subtitle: 'Book a 1:1 session with a top ranker',
    screen: 'MentorList',
  },
  {
    key: 'doubts',
    icon: '💬',
    title: 'Doubts',
    subtitle: 'Ask a doubt, see mentor answers',
    screen: 'MyDoubts',
  },
  {
    key: 'bookmarks',
    icon: '🔖',
    title: 'Bookmarks',
    subtitle: 'Questions you saved for revision',
    screen: 'Bookmarks',
  },
  {
    key: 'notes',
    icon: '📝',
    title: 'Notes',
    subtitle: 'Write and save your own study notes',
    screen: 'Notes',
  },
  {
    key: 'batches',
    icon: '🏫',
    title: 'Batches',
    subtitle: 'Browse and enroll in coaching batches',
    screen: 'BatchList',
  },
  {
    key: 'predictor',
    icon: '📊',
    title: 'Rank & College Predictor',
    subtitle: 'Estimate your NEET rank and probable colleges',
    screen: 'Predictor',
  },
  {
    key: 'pulse',
    icon: '⚡',
    title: "Today's Pulse",
    subtitle: '5-minute daily memory workout',
    screen: 'Pulse',
  },
];

export default function MoreHubScreen({ navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <ScreenContainer>
      <Grid
        data={ENTRIES}
        keyExtractor={(entry) => entry.key}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        contentContainerStyle={styles.list}
        renderItem={({ item: entry }) => (
          <Card onPress={() => navigation.navigate(entry.screen)} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.icon}>{entry.icon}</Text>
              <View style={styles.info}>
                <Text style={typography.h3}>{entry.title}</Text>
                <Text style={[typography.bodyMuted, styles.subtitle]}>{entry.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
  },
});
