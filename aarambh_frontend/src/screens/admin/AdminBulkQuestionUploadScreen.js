import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import { adminImportQuestionsCsv } from '../../api/questions.api';
import { extractErrorMessage } from '../../api/client';
import { pickFile } from '../../utils/webUpload';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

// CSV columns the backend expects (matched case/space/dot-insensitively):
//   Question No., Question, Options, Answer, Solution, NCERT Page, PYQ Year
// Options are ";"-separated inside one cell; Answer is 1-4 / A-D / exact text;
// NCERT Page = the book page number the quiz belongs to.
export default function AdminBulkQuestionUploadScreen({ route, navigation }) {
  const { textbookId, bookTitle } = route.params;
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handlePick = async () => {
    setError(null);
    setResult(null);
    try {
      const picked = await pickFile('.csv,text/csv');
      setFile(picked);
    } catch (err) {
      if (err?.message !== 'No file selected') setError(extractErrorMessage(err));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Choose a CSV file first.');
      return;
    }
    setError(null);
    setResult(null);
    setIsSubmitting(true);
    try {
      const data = await adminImportQuestionsCsv(file, textbookId);
      setResult(data);
      setFile(null);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer maxWidth={720}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.h2}>Upload quiz CSV</Text>
        <Text style={[typography.bodyMuted, styles.subtitle]}>
          {bookTitle ? `Adding quizzes to “${bookTitle}”. ` : ''}
          Each row becomes a question on this book at its NCERT (book) page — a page is
          created automatically if it doesn’t exist yet.
        </Text>

        <View style={styles.cols}>
          <Text style={styles.colsTitle}>Expected columns</Text>
          <Text style={styles.colsText}>
            Question No., Question, Options, Answer, Solution, NCERT Page, PYQ Year
          </Text>
          <Text style={styles.colsHint}>
            Options: “1) A ; 2) B ; 3) C ; 4) D”. Answer: 1-4, A-D, or the exact option text.
          </Text>
        </View>

        <Button
          title={file ? `Selected: ${file.name}` : 'Choose CSV file'}
          variant="outline"
          onPress={handlePick}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {result ? (
          <View style={styles.result}>
            <Text style={styles.success}>✓ Imported {result.imported} of {result.totalRows} rows.</Text>
            {result.pagesCreated?.length ? (
              <Text style={styles.note}>New pages created: {result.pagesCreated.join(', ')}</Text>
            ) : null}
            {result.pagesOutsideChapter?.length ? (
              <Text style={styles.warn}>
                ⚠ Pages outside any chapter range (won’t show under a chapter yet):{' '}
                {result.pagesOutsideChapter.join(', ')}
              </Text>
            ) : null}
            {result.errors?.length ? (
              <View style={styles.errorsBox}>
                <Text style={styles.errorsTitle}>{result.errors.length} row(s) skipped:</Text>
                {result.errors.slice(0, 20).map((e) => (
                  <Text key={e.line} style={styles.rowError}>
                    Row {e.line}: {e.error}
                  </Text>
                ))}
                {result.errors.length > 20 ? (
                  <Text style={styles.rowError}>…and {result.errors.length - 20} more.</Text>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        <Button
          title="Import questions"
          onPress={handleUpload}
          loading={isSubmitting}
          disabled={!file}
          style={styles.uploadButton}
        />
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
  cols: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  colsTitle: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  colsText: {
    ...typography.body,
    fontWeight: '700',
  },
  colsHint: {
    ...typography.bodyMuted,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.md,
  },
  result: {
    marginTop: spacing.md,
  },
  success: {
    color: colors.success,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  note: {
    ...typography.bodyMuted,
    marginBottom: spacing.xs,
  },
  warn: {
    color: colors.warning || colors.danger,
    marginBottom: spacing.xs,
  },
  errorsBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: spacing.md,
  },
  errorsTitle: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  rowError: {
    ...typography.bodyMuted,
    color: colors.danger,
  },
  uploadButton: {
    marginTop: spacing.lg,
  },
  doneButton: {
    marginTop: spacing.sm,
  },
});
