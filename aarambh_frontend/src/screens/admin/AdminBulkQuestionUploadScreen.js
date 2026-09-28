import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { adminBulkCreateQuestions } from '../../api/questions.api';
import { extractErrorMessage } from '../../api/client';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

const PLACEHOLDER = `[
  {
    "questionText": "Which of the following is a defining property of living organisms?",
    "options": [{ "text": "Growth" }, { "text": "Reproduction" }, { "text": "Metabolism" }, { "text": "Self-increase in mass" }],
    "correctOptionIndex": 2,
    "explanation": "Metabolism is a defining feature of all living organisms without exception.",
    "difficulty": "easy",
    "examTags": ["NEET"],
    "isHighProbability": true
  }
]`;

export default function AdminBulkQuestionUploadScreen({ route, navigation }) {
  const { textbookId } = route.params;
  const [raw, setRaw] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successCount, setSuccessCount] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    setSuccessCount(null);

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      setError('That is not valid JSON — check for a missing bracket or comma.');
      return;
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      setError('Paste a JSON array with at least one question object.');
      return;
    }

    const invalidIndex = parsed.findIndex(
      (q) =>
        !q.questionText ||
        !Array.isArray(q.options) ||
        q.options.length < 2 ||
        typeof q.correctOptionIndex !== 'number'
    );
    if (invalidIndex !== -1) {
      setError(
        `Question ${invalidIndex + 1} is missing questionText, options, or correctOptionIndex.`
      );
      return;
    }

    const questions = parsed.map((q) => ({
      textbookId: q.textbookId || textbookId,
      // Quiz belongs to a page; backend resolves/creates it from pageNumber.
      pageNumber: q.pageNumber || 1,
      questionText: q.questionText,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation || '',
      ncertRefPage: q.ncertRefPage || '',
      difficulty: q.difficulty || 'medium',
      examTags: q.examTags || ['NEET'],
      pyqYear: q.pyqYear ?? null,
      isHighProbability: q.isHighProbability ?? true,
    }));

    setIsSubmitting(true);
    try {
      const created = await adminBulkCreateQuestions(questions);
      setSuccessCount(created.length);
      setRaw('');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer maxWidth={720}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.h2}>Bulk import questions</Text>
        <Text style={[typography.bodyMuted, styles.subtitle]}>
          Paste a JSON array of questions below. Each one is added to this book at its
          pageNumber (a page is created if needed) unless it includes its own textbookId/pageNumber.
        </Text>

        <TextField
          value={raw}
          onChangeText={setRaw}
          placeholder={PLACEHOLDER}
          multiline
          numberOfLines={16}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {successCount != null ? (
          <Text style={styles.success}>✓ Imported {successCount} questions.</Text>
        ) : null}

        <Button title="Import questions" onPress={handleSubmit} loading={isSubmitting} />
        <Button title="Done" variant="ghost" onPress={() => navigation.goBack()} style={styles.doneButton} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
  success: {
    color: colors.success,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  doneButton: {
    marginTop: spacing.sm,
  },
});
