import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { listTests, startTest } from '../../api/tests.api';
import { extractErrorMessage } from '../../api/client';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

export default function TestListScreen({ navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [tests, setTests] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);
  const [startingId, setStartingId] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await listTests();
      setTests(data);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStart = async (test) => {
    setStartingId(test._id);
    try {
      const session = await startTest(test._id);
      navigation.navigate('TestAttempt', { session });
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
    } finally {
      setStartingId(null);
    }
  };

  if (status === 'loading') return <LoadingState label="Loading mock tests…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Button title="⚡ New Mix Quiz" onPress={() => navigation.navigate('MixQuizSetup')} />
      </View>
      <Grid
        data={tests}
        keyExtractor={(item) => item._id}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <ErrorState message="No mock tests published yet — start a Mix Quiz above instead." />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={typography.h3}>{item.title}</Text>
            <Text style={[typography.bodyMuted, styles.meta]}>
              {item.exam} · {item.questions?.length || 0} questions · {item.durationMinutes} min ·{' '}
              {item.totalMarks} marks
            </Text>
            <Button
              title="Start test"
              variant="outline"
              loading={startingId === item._id}
              onPress={() => handleStart(item)}
              style={styles.startButton}
            />
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const makeStyles = () => StyleSheet.create({
  header: {
    paddingVertical: spacing.md,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  meta: {
    marginTop: 4,
  },
  startButton: {
    marginTop: spacing.md,
  },
});
