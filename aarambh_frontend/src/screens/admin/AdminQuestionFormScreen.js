import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { adminCreateQuestion, adminUpdateQuestion } from '../../api/questions.api';
import { extractErrorMessage } from '../../api/client';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const EXAM_TAGS = ['NEET', 'JEE', 'BOARDS'];
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function AdminQuestionFormScreen({ route, navigation }) {
  const { textbookId, question: existing } = route.params;
  const isEditing = !!existing;

  const [questionText, setQuestionText] = useState(existing?.questionText || '');
  const [options, setOptions] = useState(
    existing?.options?.map((o) => o.text) || ['', '', '', '']
  );
  // Intentionally NOT prefilled on edit — the question list this screen was
  // opened from has the answer key redacted (see question.service.js), so
  // pre-filling a blank/wrong value here could silently corrupt the question
  // on save. The admin must re-pick the correct option and re-enter the
  // explanation every time they edit.
  const [correctOptionIndex, setCorrectOptionIndex] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [ncertRefPage, setNcertRefPage] = useState(existing?.ncertRefPage || '');
  const [difficulty, setDifficulty] = useState(existing?.difficulty || 'medium');
  const [examTags, setExamTags] = useState(existing?.examTags || ['NEET']);
  const [isHighProbability, setIsHighProbability] = useState(existing?.isHighProbability ?? true);
  const [pyqYear, setPyqYear] = useState(existing?.pyqYear ? String(existing.pyqYear) : '');
  const [pageNumber, setPageNumber] = useState(existing?.pageNumber ? String(existing.pageNumber) : '1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const toggleExamTag = (tag) => {
    setExamTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const updateOption = (index, value) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const handleSubmit = async () => {
    if (!questionText.trim() || options.some((o) => !o.trim())) {
      setError('Question text and all 4 options are required.');
      return;
    }
    if (correctOptionIndex === null) {
      setError('Please select the correct option.');
      return;
    }
    if (!explanation.trim()) {
      setError('Please provide an explanation for the correct answer.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const payload = {
      textbookId,
      // Quiz belongs to a page: the backend resolves/creates the page for this
      // textbook + pageNumber (chapters are just page-ranges now).
      pageNumber: Number(pageNumber) || 1,
      questionText: questionText.trim(),
      options: options.map((text) => ({ text: text.trim() })),
      correctOptionIndex,
      explanation: explanation.trim(),
      ncertRefPage: ncertRefPage.trim(),
      difficulty,
      examTags,
      pyqYear: pyqYear ? Number(pyqYear) : null,
      isHighProbability,
    };

    try {
      if (isEditing) {
        await adminUpdateQuestion(existing._id, payload);
      } else {
        await adminCreateQuestion(payload);
      }
      navigation.goBack();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer maxWidth={640}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={typography.h2}>{isEditing ? 'Edit question' : 'New question'}</Text>
        {isEditing ? (
          <Text style={[typography.bodyMuted, styles.editNote]}>
            For security, the correct answer isn't shown here — please re-select it and re-enter
            the explanation before saving.
          </Text>
        ) : null}

        <TextField
          label="Question text"
          value={questionText}
          onChangeText={setQuestionText}
          placeholder="Which of the following…"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Options (tap the letter to mark it correct)</Text>
        {options.map((option, index) => (
          <View key={index} style={styles.optionRow}>
            <Button
              title={OPTION_LETTERS[index]}
              variant={correctOptionIndex === index ? 'primary' : 'outline'}
              onPress={() => setCorrectOptionIndex(index)}
              style={styles.optionLetterButton}
            />
            <TextField
              value={option}
              onChangeText={(value) => updateOption(index, value)}
              placeholder={`Option ${OPTION_LETTERS[index]}`}
              style={styles.optionInput}
            />
          </View>
        ))}

        <TextField
          label="Explanation"
          value={explanation}
          onChangeText={setExplanation}
          placeholder="Why this option is correct…"
          multiline
          numberOfLines={3}
        />
        <TextField
          label="NCERT reference page (optional)"
          value={ncertRefPage}
          onChangeText={setNcertRefPage}
          placeholder="NCERT XI Biology - Page 3"
        />
        <View style={styles.inlineRow}>
          <TextField
            label="Page number"
            value={pageNumber}
            onChangeText={setPageNumber}
            keyboardType="number-pad"
            style={styles.inlineField}
          />
          <TextField
            label="PYQ year (optional)"
            value={pyqYear}
            onChangeText={setPyqYear}
            keyboardType="number-pad"
            placeholder="2024"
            style={styles.inlineField}
          />
        </View>

        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.row}>
          {DIFFICULTIES.map((value) => (
            <Button
              key={value}
              title={value}
              variant={difficulty === value ? 'primary' : 'outline'}
              onPress={() => setDifficulty(value)}
              style={styles.rowButton}
            />
          ))}
        </View>

        <Text style={styles.label}>Exam tags</Text>
        <View style={styles.row}>
          {EXAM_TAGS.map((tag) => (
            <Button
              key={tag}
              title={tag}
              variant={examTags.includes(tag) ? 'primary' : 'outline'}
              onPress={() => toggleExamTag(tag)}
              style={styles.rowButton}
            />
          ))}
        </View>

        <Button
          title={isHighProbability ? '✓ High probability question' : 'Mark as high probability'}
          variant={isHighProbability ? 'primary' : 'outline'}
          onPress={() => setIsHighProbability((prev) => !prev)}
          style={styles.toggleButton}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title={isEditing ? 'Save changes' : 'Create question'}
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.submitButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  editNote: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionLetterButton: {
    minWidth: 48,
    marginBottom: spacing.md,
  },
  optionInput: {
    flex: 1,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inlineField: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  rowButton: {
    minWidth: 90,
  },
  toggleButton: {
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});
