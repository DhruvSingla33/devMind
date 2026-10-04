import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { submitTest } from '../../api/tests.api';
import { toggleBookmark } from '../../api/bookmarks.api';
import { logPractice } from '../../api/mentors.api';
import { extractErrorMessage } from '../../api/client';
import { confirmAsync, notify } from '../../utils/alert';
import { radius, shadow, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

const BLUE = '#4F86F7';

function formatClock(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// Supports two call styles:
//  - embedded in the dashboard: <TestAttemptScreen session={...} onBack={} onFinish={} />
//  - pushed as a route: receives { route, navigation } (route.params.session)
export default function TestAttemptScreen({ route, navigation, session: sessionProp, onBack, onFinish }) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const session = sessionProp || route?.params?.session;
  const questions = session?.mockTest?.questions || [];
  const mock = session?.mockTest || {};

  const [answers, setAnswers] = useState(() =>
    questions.map((q) => ({ questionId: q._id, selectedOption: null, status: 'not_visited' }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState({});
  const [flaggedIds, setFlaggedIds] = useState({});
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => (mock.durationMinutes || 10) * 60);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const answeredCount = useMemo(() => answers.filter((a) => a.selectedOption !== null).length, [answers]);

  const submitRef = useRef(null);

  // Countdown timer — auto-submits when it reaches zero.
  useEffect(() => {
    if (!questions.length) return undefined;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          submitRef.current?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [questions.length]);

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

  const toggleFlag = () => {
    setFlaggedIds((prev) => ({ ...prev, [currentQuestion._id]: !prev[currentQuestion._id] }));
  };

  const finishWith = (result) => {
    if (onFinish) return onFinish(result);
    if (navigation?.replace) return navigation.replace('TestResult', { result });
    if (navigation?.navigate) return navigation.navigate('TestResult', { result });
    return undefined;
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
      logPractice(answeredCount).catch(() => {});
      finishWith(result);
    } catch (error) {
      notify('Could not submit test', extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };
  submitRef.current = submit;

  const handleSubmit = async () => {
    const confirmed = await confirmAsync(
      'Submit test?',
      `You've answered ${answeredCount} of ${questions.length} questions. This cannot be undone.`,
      'Submit'
    );
    if (confirmed) submit();
  };

  const goBack = () => {
    if (onBack) return onBack();
    if (navigation?.goBack) return navigation.goBack();
    return undefined;
  };

  if (!session || !questions.length) {
    return (
      <View style={[styles.page, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>This test has no questions.</Text>
      </View>
    );
  }

  const lowTime = secondsLeft <= 60;
  const isLast = currentIndex === questions.length - 1;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        {/* ---------------------------- Header ---------------------------- */}
        <View style={styles.headerCard}>
          <Pressable onPress={goBack} style={styles.backBtn} accessibilityLabel="Back">
            <Text style={{ fontSize: 18, color: colors.textSecondary }}>←</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {mock.title || 'Quiz'}
            </Text>
            <Text style={styles.subMeta}>
              {(mock.exam || 'NEET')} · {questions.length} questions · {mock.durationMinutes} min · {mock.totalMarks} marks
            </Text>
          </View>
          <View style={[styles.timerPill, lowTime && { borderColor: colors.danger }]}>
            <Text style={{ fontSize: 13 }}>🕐</Text>
            <Text style={[styles.timerText, lowTime && { color: colors.danger }]}>{formatClock(secondsLeft)}</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Test in progress</Text>
          </View>
        </View>

        {/* ------------------------- Question palette ------------------------- */}
        <View style={styles.navCard}>
          <Text style={styles.navTitle}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
            {questions.map((q, index) => {
              const isAnswered = answers[index].selectedOption !== null;
              const isCurrent = index === currentIndex;
              return (
                <Pressable
                  key={q._id}
                  onPress={() => goTo(index)}
                  style={[
                    styles.pill,
                    isAnswered && !isCurrent && styles.pillAnswered,
                    isCurrent && styles.pillCurrent,
                  ]}
                >
                  <Text style={[styles.pillText, (isCurrent || isAnswered) && styles.pillTextActive]}>{index + 1}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Text style={styles.answeredText}>{answeredCount} answered</Text>
        </View>

        {/* --------------------------- Question card --------------------------- */}
        <View style={styles.questionCard}>
          <View style={styles.qHead}>
            <View style={styles.qIcon}>
              <Text style={{ fontSize: 16 }}>📄</Text>
            </View>
            <Text style={styles.qLabel}>Question {currentIndex + 1}</Text>
            <View style={{ flex: 1 }} />
            <Pressable
              onPress={handleToggleBookmark}
              disabled={isBookmarking}
              style={styles.iconBtn}
              accessibilityLabel="Bookmark question"
            >
              <Text style={[styles.iconBtnTxt, bookmarkedIds[currentQuestion._id] && { color: BLUE }]}>
                {bookmarkedIds[currentQuestion._id] ? '🔖' : '🔖'}
              </Text>
            </Pressable>
            <Pressable onPress={toggleFlag} style={styles.iconBtn} accessibilityLabel="Mark for review">
              <Text style={[styles.iconBtnTxt, flaggedIds[currentQuestion._id] && { color: '#E0A23C' }]}>
                {flaggedIds[currentQuestion._id] ? '★' : '☆'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.questionText}>{currentQuestion.questionText}</Text>

          <View style={styles.options}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = currentAnswer.selectedOption === index;
              return (
                <Pressable
                  key={index}
                  onPress={() => selectOption(index)}
                  style={({ hovered }) => [
                    styles.option,
                    hovered && !isSelected && styles.optionHover,
                    isSelected && styles.optionSelected,
                  ]}
                >
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <Text style={[styles.optionText, isSelected && { color: colors.textPrimary }]}>{option.text}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ------------------------------ Footer ------------------------------ */}
        <View style={styles.footer}>
          <Pressable
            onPress={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            style={({ pressed }) => [
              styles.prevBtn,
              currentIndex === 0 && { opacity: 0.45 },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.prevBtnTxt}>←  Previous</Text>
          </Pressable>

          <Pressable onPress={isLast ? handleSubmit : () => goTo(currentIndex + 1)} disabled={isSubmitting}>
            <LinearGradient
              colors={['#3E7BF0', '#5B5BE0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.nextBtn, isSubmitting && { opacity: 0.7 }]}
            >
              <Text style={styles.nextBtnTxt}>
                {isLast ? (isSubmitting ? 'Submitting…' : 'Submit  ✓') : 'Next  →'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const makeStyles = ({ colors }) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    inner: { width: '100%', maxWidth: 1180, alignSelf: 'center', gap: spacing.md },

    headerCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flexWrap: 'wrap',
      ...shadow.card,
    },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    title: { fontSize: 19, fontWeight: '800', color: colors.textPrimary },
    subMeta: { fontSize: 12.5, color: BLUE, marginTop: 3, fontWeight: '500' },
    timerPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    timerText: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, fontVariant: ['tabular-nums'] },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2FBF71' },
    statusText: { fontSize: 12.5, color: colors.textSecondary, fontWeight: '600' },

    navCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    navTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
    pills: { gap: 8, alignItems: 'center', flexGrow: 1 },
    pill: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    pillAnswered: { backgroundColor: `${BLUE}2A`, borderWidth: 1, borderColor: `${BLUE}66` },
    pillCurrent: { backgroundColor: BLUE },
    pillText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
    pillTextActive: { color: '#fff' },
    answeredText: { fontSize: 13, color: colors.textMuted, marginLeft: 'auto' },

    questionCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      ...shadow.card,
    },
    qHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.md },
    qIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: `${BLUE}22`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qLabel: { fontSize: 14.5, fontWeight: '700', color: BLUE },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    iconBtnTxt: { fontSize: 16, color: colors.textSecondary },

    questionText: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, lineHeight: 24, marginBottom: spacing.lg },
    options: { gap: spacing.sm },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingVertical: 15,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surfaceAlt,
      ...Platform.select({ web: { cursor: 'pointer', transitionDuration: '120ms' }, default: {} }),
    },
    optionHover: Platform.select({ web: { borderColor: `${BLUE}88` }, default: {} }),
    optionSelected: { borderColor: BLUE, backgroundColor: `${BLUE}1A` },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.textMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: { borderColor: BLUE },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: BLUE },
    optionText: { flex: 1, fontSize: 15, color: colors.textSecondary },

    footer: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, marginTop: spacing.xs },
    prevBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      paddingVertical: 13,
      paddingHorizontal: 26,
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    prevBtnTxt: { color: colors.textPrimary, fontWeight: '700', fontSize: 14 },
    nextBtn: {
      borderRadius: radius.md,
      paddingVertical: 13,
      paddingHorizontal: 40,
      alignItems: 'center',
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    nextBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  });
