import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { getMyAttempts } from '../../api/tests.api';
import { extractErrorMessage } from '../../api/client';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

export default function MyAttemptsScreen() {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [attempts, setAttempts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getMyAttempts();
      setAttempts(data);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') return <LoadingState label="Loading your attempts…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  return (
    <ScreenContainer>
      <Grid
        data={attempts}
        keyExtractor={(item) => item._id}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<ErrorState message="You haven't attempted any test yet." />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={typography.h3}>{item.mockTestId?.title || 'Mock test'}</Text>
                <Text style={[typography.bodyMuted, styles.meta]}>
                  {item.correctCount}/{item.totalQuestions} correct · {item.accuracy}% accuracy
                </Text>
              </View>
              <Text style={item.status === 'completed' ? styles.scoreDone : styles.scorePending}>
                {item.status === 'completed' ? item.totalScore : '—'}
              </Text>
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
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    paddingRight: spacing.md,
  },
  meta: {
    marginTop: 4,
  },
  scoreDone: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  scorePending: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMuted,
  },
});
