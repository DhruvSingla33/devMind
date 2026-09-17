import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

const SECTIONS = [
  {
    key: 'textbooks',
    icon: '📚',
    title: 'Textbooks & Chapters',
    subtitle: 'Create textbooks, chapters, and upload NCERT PDFs',
    screen: 'AdminTextbookList',
  },
  {
    key: 'questions',
    icon: '📝',
    title: 'Questions',
    subtitle: 'Author single questions or bulk-import a JSON set',
    screen: 'AdminQuestionList',
  },
  {
    key: 'mentors',
    icon: '🎓',
    title: 'Mentors',
    subtitle: 'Add mentors and open up booking slots',
    screen: 'AdminMentorForm',
  },
  {
    key: 'batches',
    icon: '🏫',
    title: 'Batches',
    subtitle: 'Create and manage coaching batches',
    screen: 'AdminBatchList',
  },
  {
    key: 'pulse',
    icon: '⚡',
    title: 'Aarambh Pulse',
    subtitle: "Publish today's 5-minute memory workout",
    screen: 'AdminPulseForm',
  },
  {
    key: 'doubts',
    icon: '💬',
    title: 'Doubts',
    subtitle: 'Answer student doubts',
    screen: 'AdminDoubts',
  },
];

export default function AdminHubScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={typography.h2}>Admin panel</Text>
        <Text style={[typography.bodyMuted, styles.subtitle]}>
          Signed in as {user?.name} ({user?.email})
        </Text>
        <View style={styles.headerActions}>
          <Button
            title="← Back to app"
            variant="outline"
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Tabs'))}
            style={styles.backButton}
          />
          <Button title="Log out" variant="ghost" onPress={logout} style={styles.logout} />
        </View>
      </View>

      <Grid
        data={SECTIONS}
        keyExtractor={(item) => item.key}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate(item.screen)} style={styles.card}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={typography.h3}>{item.title}</Text>
            <Text style={[typography.bodyMuted, styles.cardSubtitle]}>{item.subtitle}</Text>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  backButton: {
    minWidth: 140,
  },
  logout: {
    alignSelf: 'flex-start',
  },
  list: {
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  cardSubtitle: {
    marginTop: spacing.xs,
  },
});
