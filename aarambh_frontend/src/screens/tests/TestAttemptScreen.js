import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import { submitTest } from '../../api/tests.api';
import { toggleBookmark } from '../../api/bookmarks.api';
import { logPractice } from '../../api/mentors.api';
import { extractErrorMessage } from '../../api/client';
import { confirmAsync, notify } from '../../utils/alert';
import { radius, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

export default function TestAttemptScreen({ route, navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { session } = route.params;
  const questions = session.mockTest.questions;

  const [answers, setAnswers] = useState(() =>
    questions.map((q) => ({ questionId: q._id, selectedOption: null, status: 'not_visited' }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState({});
  const [isBookmarking, setIsBookmarking] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const answeredCount = useMemo(
    () => answers.filter((a) => a.selectedOption !== null).length,
    [answers]
  );

  const selectOption = (optionIndex) => {
    setAnswers((prev) =>
      prev.map((a, i) => (i === currentIndex ? { ...a, selectedOption: optionIndex, status: 'answered' } : a))
    );
  };

  const goTo = (index) => {
    if (index >= 0 && index < questions.length) setCurrentIndex(index);
  };

  const handleToggleBookmark = async () => {
    setIsBookmarking(true);
    try {
      const result = await toggleBookmark({ questionId: currentQuestion._id });
      setBookmarkedIds((prev) => ({ ...prev, [currentQuestion._id]: result.bookmarked }));
    } catch (error) {
      notify('Could not bookmark this question', extractErrorMessage(error));
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleSubmit = async () => {
    const confirmed = await confirmAsync(
      'Submit test?',
      `You've answered ${answeredCount} of ${questions.length} questions. This cannot be undone.`,
      'Submit'
    );
    if (confirmed) submit();
  };

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const payload = answers.map((a) => ({
        questionId: a.questionId,
        selectedOption: a.selectedOption,
        status: a.selectedOption !== null ? 'answered' : 'not_answered',
      }));
      const result = await submitTest(session.attemptId, payload);
      logPractice(answeredCount).catch(() => {
        // Streak tracking is best-effort — never block navigation on it.
      });
      navigation.replace('TestResult', { result });
    } catch (error) {
      notify('Could not submit test', extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.progressRow}>
        <Text style={typography.bodyMuted}>
          Question {currentIndex + 1} of {questions.length}
        </Text>
        <Text style={typography.bodyMuted}>{answeredCount} answered</Text>
      </View>

      <ScrollView contentContainerStyle={styles.paletteRow} horizontal showsHorizontalScrollIndicator={false}>
        {questions.map((q, index) => {
          const isAnswered = answers[index].selectedOption !== null;
          const isCurrent = index === currentIndex;
          return (
            <Pressable
              key={q._id}
              style={[
                styles.paletteItem,
                isAnswered && styles.paletteItemAnswered,
                isCurrent && styles.paletteItemCurrent,
              ]}
              onPress={() => goTo(index)}
            >
              <Text
                style={[
                  styles.paletteText,
                  (isAnswered || isCurrent) && styles.paletteTextActive,
                ]}
              >
                {index + 1}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.questionArea} contentContainerStyle={styles.questionContent}>
        <View style={styles.questionHeader}>
          <Text style={[typography.h3, styles.questionText]}>{currentQuestion.questionText}</Text>
          <Pressable
            onPress={handleToggleBookmark}
            disabled={isBookmarking}
            hitSlop={8}
            style={styles.bookmarkButton}
          >
            <Text style={styles.bookmarkIcon}>
              {bookmarkedIds[currentQuestion._id] ? '★' : '☆'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.options}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = currentAnswer.selectedOption === index;
            return (
              <Pressable
                key={index}
                onPress={() => selectOption(index)}
                style={[styles.option, isSelected && styles.optionSelected]}
              >
                <View style={[styles.radio, isSelected && styles.radioSelected]} />
                <Text style={[typography.body, styles.optionText]}>{option.text}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Previous"
          variant="outline"
          onPress={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          style={styles.footerButton}
        />
        {currentIndex === questions.length - 1 ? (
          <Button
            title="Submit"
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.footerButton}
          />
        ) : (
          <Button title="Next" onPress={() => goTo(currentIndex + 1)} style={styles.footerButton} />
        )}
      </View>
    </ScreenContainer>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  paletteRow: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  paletteItem: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  paletteItemAnswered: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  paletteItemCurrent: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  paletteText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  paletteTextActive: {
    color: colors.primary,
  },
  questionArea: {
    flex: 1,
  },
  questionContent: {
    paddingVertical: spacing.md,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  questionText: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  bookmarkButton: {
    padding: spacing.xs,
  },
  bookmarkIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  options: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.textMuted,
    marginRight: spacing.sm,
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionText: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
