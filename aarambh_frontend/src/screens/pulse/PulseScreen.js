import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { getTodayPulse } from '../../api/pulse.api';
import { extractErrorMessage } from '../../api/client';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

export default function PulseScreen() {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [pulse, setPulse] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);
  const [revealed, setRevealed] = useState({});

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getTodayPulse();
      setPulse(data);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') return <LoadingState label="Loading today's pulse…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.h2}>{pulse.title}</Text>
        <Text style={[typography.bodyMuted, styles.subtitle]}>
          Tap a card to reveal the answer.
        </Text>

        {pulse.puzzles.map((puzzle) => {
          const isRevealed = revealed[puzzle._id];
          return (
            <Card
              key={puzzle._id}
              onPress={() => setRevealed((prev) => ({ ...prev, [puzzle._id]: !prev[puzzle._id] }))}
              style={styles.puzzleCard}
            >
              <Text style={[typography.caption, styles.category]}>{puzzle.category}</Text>
              <Text style={typography.h3}>{puzzle.term}</Text>
              {isRevealed ? (
                <Text style={[typography.body, styles.definition]}>{puzzle.definition}</Text>
              ) : (
                <Text style={[typography.bodyMuted, styles.hint]}>Tap to reveal</Text>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  puzzleCard: {
    marginBottom: spacing.md,
  },
  category: {
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  definition: {
    marginTop: spacing.sm,
  },
  hint: {
    marginTop: spacing.sm,
  },
});
