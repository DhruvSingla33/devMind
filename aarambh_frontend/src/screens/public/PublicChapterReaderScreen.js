import React, { useCallback, useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { getChapter, getChapterPdf } from '../../api/textbooks.api';
import { listQuestions, submitAnswer } from '../../api/questions.api';
import { extractErrorMessage } from '../../api/client';
import { radius, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../theme/responsive';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function PracticeQuestion({ question, index }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleSelect = async (optionIndex) => {
    setSelectedOption(optionIndex);
    setIsChecking(true);
    try {
      const data = await submitAnswer({ questionId: question._id, selectedOption: optionIndex });
      setResult(data);
    } catch (error) {
      setResult(null);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card style={styles.questionCard}>
      <View style={styles.questionHeaderRow}>
        <Text style={[typography.caption, styles.questionNumber]}>Question {index + 1}</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{question.difficulty}</Text>
        </View>
      </View>
      <Text style={[typography.body, styles.questionText]}>{question.questionText}</Text>

      <View style={styles.options}>
        {question.options.map((option, optionIndex) => {
          const isSelected = selectedOption === optionIndex;
          const isCorrectOption = result && result.correctOptionIndex === optionIndex;
          const isWrongSelection = result && isSelected && !result.isCorrect;
          return (
            <Card
              key={optionIndex}
              onPress={() => handleSelect(optionIndex)}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                isCorrectOption && styles.optionCorrect,
                isWrongSelection && styles.optionWrong,
              ]}
            >
              <View style={styles.optionRow}>
                <View
                  style={[
                    styles.optionLetter,
                    isCorrectOption && styles.optionLetterCorrect,
                    isWrongSelection && styles.optionLetterWrong,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLetterText,
                      (isCorrectOption || isWrongSelection) && styles.optionLetterTextActive,
                    ]}
                  >
                    {OPTION_LETTERS[optionIndex]}
                  </Text>
                </View>
                <Text style={[typography.body, styles.optionText]}>{option.text}</Text>
                {isCorrectOption ? <Text style={styles.optionCheck}>✓</Text> : null}
                {isWrongSelection ? <Text style={styles.optionCross}>✕</Text> : null}
              </View>
            </Card>
          );
        })}
      </View>

      {isChecking ? <Text style={typography.bodyMuted}>Checking…</Text> : null}
      {result ? (
        <View style={[styles.resultBox, result.isCorrect ? styles.resultBoxCorrect : styles.resultBoxWrong]}>
          <View style={[styles.resultBadge, result.isCorrect ? styles.resultBadgeCorrect : styles.resultBadgeWrong]}>
            <Text style={styles.resultBadgeText}>{result.isCorrect ? '✓ Correct' : '✕ Not quite'}</Text>
          </View>
          <Text style={[typography.bodyMuted, styles.explanation]}>{result.explanation}</Text>
        </View>
      ) : null}
    </Card>
  );
}

export default function PublicChapterReaderScreen({ route, navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { code, chapterNumber, title } = route.params;
  const { isDesktop } = useBreakpoint();
  const [data, setData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isOpeningPdf, setIsOpeningPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const chapterData = await getChapter(code, chapterNumber);
      setData(chapterData);
      const questionData = await listQuestions({ chapterId: chapterData.chapter._id, limit: 50 });
      setQuestions(questionData.questions);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, [code, chapterNumber]);

  useEffect(() => {
    navigation.setOptions({ title: title || 'Chapter' });
    load();
  }, [load, navigation, title]);

  if (status === 'loading') return <LoadingState label="Loading chapter…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  const { chapter } = data;
  const hasPdf = !!(chapter.pdfUrl || (chapter.startPage && chapter.endPage));

  const handleOpenPdf = async () => {
    setPdfError(null);
    setIsOpeningPdf(true);
    try {
      const { publicUrl } = await getChapterPdf(code, chapterNumber);
      Linking.openURL(publicUrl);
    } catch (error) {
      setPdfError(extractErrorMessage(error));
    } finally {
      setIsOpeningPdf(false);
    }
  };

  return (
    <ScreenContainer maxWidth={1200}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.layout, isDesktop && styles.layoutRow]}>
          <View style={[styles.column, isDesktop && styles.readerColumn]}>
            <Text style={typography.h2}>{chapter.title}</Text>
            {chapter.description ? (
              <Text style={[typography.bodyMuted, styles.description]}>{chapter.description}</Text>
            ) : null}
            <Text style={[typography.bodyMuted, styles.pages]}>
              {chapter.totalPages} page{chapter.totalPages === 1 ? '' : 's'} in this chapter
            </Text>
            {hasPdf ? (
              <>
                <Button
                  title="Open NCERT PDF"
                  variant="outline"
                  loading={isOpeningPdf}
                  onPress={handleOpenPdf}
                  style={styles.pdfButton}
                />
                {pdfError ? <Text style={styles.pdfError}>{pdfError}</Text> : null}
              </>
            ) : null}

            <View style={styles.signupCard}>
              <Text style={typography.h3}>Want the full experience?</Text>
              <Text style={[typography.bodyMuted, styles.signupBody]}>
                Sign up to save your progress, take timed CBT mock tests, bookmark questions, and
                book a mentor.
              </Text>
              <Button title="Sign up free" onPress={() => navigation.navigate('Signup')} />
            </View>
          </View>

          <View
            style={[styles.column, isDesktop ? styles.questionsColumn : styles.questionsColumnMobile]}
          >
            <Text style={[typography.h3, styles.questionsHeading]}>
              High-probability exam questions
            </Text>
            {questions.length === 0 ? (
              <Text style={typography.bodyMuted}>No practice questions for this chapter yet.</Text>
            ) : (
              questions.map((question, index) => (
                <PracticeQuestion key={question._id} question={question} index={index} />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  layout: {
    flexDirection: 'column',
  },
  layoutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  // No flex here: on mobile the layout is a vertical column inside a
  // ScrollView, and `flex: 1` on stacked children in an unbounded-height
  // column collapses them so the two sections overlap. Flex is applied only
  // in the desktop row layout (questionsColumn), where the width is bounded.
  column: {
    minWidth: 0,
  },
  readerColumn: {
    flex: 1,
    maxWidth: 420,
  },
  questionsColumn: {
    flex: 1,
  },
  // Mobile: the questions stack below the signup card, so give them breathing
  // room above the heading instead of butting right up against the card.
  questionsColumnMobile: {
    marginTop: spacing.xl,
  },
  description: {
    marginTop: spacing.sm,
  },
  pages: {
    marginTop: spacing.md,
  },
  pdfButton: {
    marginTop: spacing.md,
  },
  pdfError: {
    color: colors.danger,
    marginTop: spacing.sm,
  },
  signupCard: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  signupBody: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  questionsHeading: {
    marginBottom: spacing.md,
  },
  questionCard: {
    marginBottom: spacing.md,
  },
  questionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  questionNumber: {
    color: colors.textMuted,
  },
  tag: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  questionText: {
    marginBottom: spacing.md,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    paddingVertical: spacing.sm + 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  optionLetterCorrect: {
    backgroundColor: colors.success,
  },
  optionLetterWrong: {
    backgroundColor: colors.danger,
  },
  optionLetterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  optionLetterTextActive: {
    color: colors.textOnDark,
  },
  optionText: {
    flex: 1,
  },
  optionCheck: {
    color: colors.success,
    fontWeight: '800',
    fontSize: 16,
    marginLeft: spacing.sm,
  },
  optionCross: {
    color: colors.danger,
    fontWeight: '800',
    fontSize: 16,
    marginLeft: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.primary,
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: 'rgba(24, 135, 90, 0.08)',
  },
  optionWrong: {
    borderColor: colors.danger,
    backgroundColor: colors.primaryMuted,
  },
  resultBox: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  resultBoxCorrect: {
    backgroundColor: 'rgba(24, 135, 90, 0.08)',
  },
  resultBoxWrong: {
    backgroundColor: colors.primaryMuted,
  },
  resultBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.xs,
  },
  resultBadgeCorrect: {
    backgroundColor: colors.success,
  },
  resultBadgeWrong: {
    backgroundColor: colors.danger,
  },
  resultBadgeText: {
    color: colors.textOnDark,
    fontWeight: '700',
    fontSize: 12,
  },
  explanation: {
    marginTop: spacing.xs,
  },
});
