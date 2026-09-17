import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { createMixQuiz, startTest } from '../../api/tests.api';
import { extractErrorMessage } from '../../api/client';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

const EXAMS = ['NEET', 'JEE'];

export default function MixQuizSetupScreen({ route, navigation }) {
  const { chapterId, chapterTitle } = route.params || {};
  const [exam, setExam] = useState('NEET');
  const [questionCount, setQuestionCount] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const quiz = await createMixQuiz({
        chapterIds: chapterId ? [chapterId] : [],
        questionCount: Number(questionCount) || 30,
        exam,
        title: chapterTitle ? `Mix Quiz · ${chapterTitle}` : undefined,
      });
      const session = await startTest(quiz._id);
      navigation.replace('TestAttempt', { session });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={typography.h2}>Set up your Mix Quiz</Text>
      <Text style={[typography.bodyMuted, styles.subtitle]}>
        {chapterTitle
          ? `Focused on: ${chapterTitle}`
          : 'A custom blend of high-probability questions & PYQs.'}
      </Text>

      <Text style={styles.label}>Exam</Text>
      <View style={styles.examRow}>
        {EXAMS.map((value) => (
          <Button
            key={value}
            title={value}
            variant={exam === value ? 'primary' : 'outline'}
            onPress={() => setExam(value)}
            style={styles.examButton}
          />
        ))}
      </View>

      <TextField
        label="Number of questions"
        value={questionCount}
        onChangeText={setQuestionCount}
        keyboardType="number-pad"
        placeholder="30"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Generate & start quiz" onPress={handleGenerate} loading={isSubmitting} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  examRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  examButton: {
    flex: 1,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
});
