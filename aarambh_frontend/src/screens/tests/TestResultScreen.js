import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

function StatTile({ label, value, tint }) {
  return (
    <View style={styles.tile}>
      <Text style={[styles.tileValue, tint && { color: tint }]}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

export default function TestResultScreen({ route, navigation }) {
  const { result } = route.params;
  const unansweredCount = result.totalQuestions - result.answeredCount;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Your score</Text>
          <Text style={styles.score}>
            {result.totalScore}
            <Text style={styles.scoreTotal}> / {result.mockTest?.totalMarks ?? result.totalQuestions * 4}</Text>
          </Text>
          <Text style={styles.accuracy}>{result.accuracy}% accuracy</Text>
        </Card>

        <View style={styles.statsGrid}>
          <StatTile label="Correct" value={result.correctCount} tint={colors.success} />
          <StatTile label="Incorrect" value={result.incorrectCount} tint={colors.danger} />
          <StatTile label="Unanswered" value={unansweredCount} />
          <StatTile label="Total" value={result.totalQuestions} />
        </View>

        <Button
          title="Back to tests"
          onPress={() => navigation.popToTop()}
          style={styles.backButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  scoreCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  scoreLabel: {
    ...typography.bodyMuted,
  },
  score: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  scoreTotal: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: '600',
  },
  accuracy: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  tile: {
    flexBasis: '47%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tileValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tileLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  backButton: {
    marginTop: spacing.xl,
  },
});
