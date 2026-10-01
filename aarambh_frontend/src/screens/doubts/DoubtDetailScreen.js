import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { getDoubt } from '../../api/doubts.api';
import { extractErrorMessage } from '../../api/client';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

const makeStatusColors = (colors) => ({
  PENDING: colors.warning,
  IN_PROGRESS: colors.primary,
  RESOLVED: colors.success,
});

export default function DoubtDetailScreen({ route }) {
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const STATUS_COLORS = makeStatusColors(colors);
  const { doubtId } = route.params;
  const [doubt, setDoubt] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getDoubt(doubtId);
      setDoubt(data);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, [doubtId]);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') return <LoadingState label="Loading doubt…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.caption, { color: STATUS_COLORS[doubt.status] }]}>
          {doubt.status?.replace('_', ' ')}
        </Text>
        <Text style={typography.h2}>{doubt.subject} · {doubt.chapter}</Text>
        <Card style={styles.card}>
          <Text style={typography.body}>{doubt.questionText}</Text>
        </Card>

        {doubt.status === 'RESOLVED' && doubt.solution ? (
          <Card style={styles.card}>
            <Text style={typography.h3}>Mentor's answer</Text>
            <Text style={[typography.body, styles.answer]}>{doubt.solution.answerText}</Text>
          </Card>
        ) : (
          <Text style={[typography.bodyMuted, styles.waiting]}>
            Still waiting on a mentor to answer this one — check back soon.
          </Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const makeStyles = () => StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    marginTop: spacing.md,
  },
  answer: {
    marginTop: spacing.sm,
  },
  waiting: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
