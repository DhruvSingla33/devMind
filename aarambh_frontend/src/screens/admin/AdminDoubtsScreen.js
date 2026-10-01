import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import TextField from '../../components/TextField';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { adminListDoubts, adminAnswerDoubt } from '../../api/doubts.api';
import { extractErrorMessage } from '../../api/client';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

const STATUS_FILTERS = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
const makeStatusColors = (colors) => ({
  PENDING: colors.warning,
  IN_PROGRESS: colors.primary,
  RESOLVED: colors.success,
});

export default function AdminDoubtsScreen() {
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const STATUS_COLORS = makeStatusColors(colors);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [doubts, setDoubts] = useState([]);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const load = useCallback(async (filter) => {
    setLoadStatus('loading');
    try {
      const data = await adminListDoubts(filter ? { status: filter } : {});
      setDoubts(data);
      setLoadStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setLoadStatus('error');
    }
  }, []);

  useEffect(() => {
    load(statusFilter);
  }, [load, statusFilter]);

  const handleAnswer = async () => {
    if (!answerText.trim()) {
      setSubmitError('Write an answer before submitting.');
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await adminAnswerDoubt(selectedDoubt._id, { answerText: answerText.trim() });
      setSelectedDoubt(null);
      setAnswerText('');
      load(statusFilter);
    } catch (error) {
      setSubmitError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((value) => (
          <Button
            key={value}
            title={value.replace('_', ' ')}
            variant={statusFilter === value ? 'primary' : 'outline'}
            onPress={() => setStatusFilter(value)}
            style={styles.filterButton}
          />
        ))}
      </View>

      {loadStatus === 'loading' ? (
        <LoadingState label="Loading doubts…" />
      ) : loadStatus === 'error' ? (
        <ErrorState message={errorMessage} onRetry={() => load(statusFilter)} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {doubts.length === 0 ? (
            <ErrorState message="No doubts with this status." />
          ) : (
            doubts.map((doubt) => (
              <Card key={doubt._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={[typography.caption, { color: STATUS_COLORS[doubt.status] }]}>
                    {doubt.status.replace('_', ' ')}
                  </Text>
                  <Text style={typography.caption}>
                    {doubt.studentId?.name || 'Student'}
                  </Text>
                </View>
                <Text style={typography.h3}>
                  {doubt.subject} · {doubt.chapter}
                </Text>
                <Text style={[typography.body, styles.questionText]}>{doubt.questionText}</Text>

                {doubt.status === 'RESOLVED' && doubt.solution?.answerText ? (
                  <View style={styles.answerBox}>
                    <Text style={[typography.caption, styles.answerLabel]}>Answer</Text>
                    <Text style={typography.bodyMuted}>{doubt.solution.answerText}</Text>
                  </View>
                ) : selectedDoubt?._id === doubt._id ? (
                  <View style={styles.answerForm}>
                    <TextField
                      label="Your answer"
                      value={answerText}
                      onChangeText={setAnswerText}
                      multiline
                      numberOfLines={3}
                    />
                    {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
                    <View style={styles.answerActions}>
                      <Button
                        title="Submit answer"
                        onPress={handleAnswer}
                        loading={isSubmitting}
                        style={styles.answerButton}
                      />
                      <Button
                        title="Cancel"
                        variant="ghost"
                        onPress={() => {
                          setSelectedDoubt(null);
                          setAnswerText('');
                        }}
                      />
                    </View>
                  </View>
                ) : (
                  <Button
                    title="Answer this doubt"
                    variant="outline"
                    onPress={() => setSelectedDoubt(doubt)}
                    style={styles.answerCta}
                  />
                )}
              </Card>
            ))
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  filterButton: {
    flex: 1,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  questionText: {
    marginTop: spacing.sm,
  },
  answerBox: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
  },
  answerLabel: {
    color: colors.textMuted,
    marginBottom: 2,
  },
  answerForm: {
    marginTop: spacing.md,
  },
  answerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  answerButton: {
    flex: 1,
  },
  answerCta: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});
