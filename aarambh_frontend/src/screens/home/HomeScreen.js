import React, { useEffect, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Carousel from '../../components/Carousel';
import Logo from '../../components/Logo';
import { listTextbooks } from '../../api/textbooks.api';
import { listQuestions } from '../../api/questions.api';
import { getMyStreak } from '../../api/mentors.api';
import { useAuth } from '../../context/AuthContext';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme/theme';
import { hexToRgba } from '../../utils/color';
import { notify } from '../../utils/alert';

const FALLBACK_SUBJECTS = [
  { code: 'physics', title: 'Physics', icon: '⚛️', color: '#3B6FE0' },
  { code: 'chemistry', title: 'Chemistry', icon: '🧪', color: '#E63946' },
  { code: 'biology', title: 'Biology', icon: '🌿', color: '#18875A' },
  { code: 'maths', title: 'Maths', icon: '📐', color: '#0E9488' },
];

const DAILY_TASKS = [
  { key: 'ncert', label: '1 NCERT Line' },
  { key: 'pyq', label: '1 PYQ' },
  { key: 'mcq', label: '1 MCQ' },
  { key: 'revision', label: '1 Revision' },
];

const STUDY_TOOLS = [
  { key: 'ai', img: require('../../images/tools/ai.png'), title: 'Aarambh AI', subtitle: 'Ask anything. Get instant help.', tint: '#FBE7EA' },
  { key: 'quiz', img: require('../../images/tools/quiz.png'), title: 'Quiz Creator', subtitle: 'Create your own custom quiz.', tint: '#E7ECFB' },
  { key: 'predictor', img: require('../../images/tools/predictor.png'), title: 'Rank Predictor', subtitle: 'Know your potential and plan better.', tint: '#E4F5EC' },
  { key: 'chapterwise', img: require('../../images/tools/chapterwise.png'), title: 'Chapterwise PYQ', subtitle: 'Topic-wise PYQs with NCERT mapping.', tint: '#F2E9FB' },
  { key: 'notes', img: require('../../images/tools/notes.png'), title: 'Short Notes', subtitle: 'Quick revision, better retention.', tint: '#FBF0E3' },
  { key: 'material', img: require('../../images/tools/material.png'), title: 'Study Material', subtitle: 'Handwritten notes, PDFs, & more.', tint: '#E7F0FB' },
];

const PRACTICE_TILES = [
  { key: 'leaderboard', icon: '🏆', title: 'Leaderboard', subtitle: 'Compete. Improve. Grow.', tint: '#E4F5EC' },
  { key: 'quick', icon: '⚡', title: 'Quick Practice', subtitle: '5 questions · Focused · Result driven', tint: '#E7ECFB' },
  { key: 'weak', icon: '🎯', title: 'Your Weak Areas', subtitle: 'Focus more. Improve faster.', tint: '#FBE7EA' },
];

const WEAK_AREAS = [
  { key: 'physics', label: 'Physics', percent: 42, color: '#E63946' },
  { key: 'organic', label: 'Organic Chemistry', percent: 56, color: '#B4700D' },
  { key: 'plant', label: 'Plant Physiology', percent: 64, color: '#18875A' },
];

// The marketing creative banners (screen1/screen2.jpg) are the pre-login
// landing page's pitch to sign up — showing them again to someone already
// signed in and on their dashboard was pure noise, so this carousel is just
// the code-drawn slides now, each with a real in-app action.
const BANNER_NATIVE_RATIO = 1280 / 721;

const HERO_SLIDES = [
  {
    key: 'concepts',
    eyebrow: 'YOUR NEET JOURNEY',
    title: 'Build Concepts.\nCrack NEET.',
    body: 'NCERT + PYQ, Smart Tools, everything you need — all in one place.',
    cta: 'Start Learning',
    target: 'TextbookList',
  },
  {
    key: 'mock',
    eyebrow: 'PRACTICE LIKE THE REAL THING',
    title: 'Mix Quiz &\nCBT Mocks.',
    body: 'A real exam timer, a real question palette — practice under real conditions.',
    cta: 'Take a test',
    target: 'MixQuizSetup',
  },
  {
    key: 'mentor',
    eyebrow: '1:1 MENTORSHIP',
    title: 'Stuck? Ask a\ntop-ranker mentor.',
    body: 'Book a session, or keep a 7-day streak to unlock one free.',
    cta: 'Browse mentors',
    target: 'MentorList',
  },
];

function optionLabel(index) {
  return String.fromCharCode(65 + index);
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { colors, typography, isDark, setMode } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const firstName = user?.name?.split(' ')?.[0] || 'there';
  const today = new Date();

  const [streak, setStreak] = useState(null);
  const [subjects, setSubjects] = useState(FALLBACK_SUBJECTS);
  const [pyq, setPyq] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    getMyStreak()
      .then(setStreak)
      .catch(() => setStreak(null));

    listTextbooks()
      .then((data) => {
        if (data?.length) setSubjects(data);
      })
      .catch(() => {});

    listQuestions({ isPyq: 'true', limit: 1 })
      .then((data) => {
        const first = data?.questions?.[0];
        if (first) setPyq(first);
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    setMode(isDark ? 'light' : 'dark');
  };

  const streakDays = streak?.currentStreakDays || 0;
  const completedTasks = Math.min(streakDays > 0 ? 3 : 0, DAILY_TASKS.length);

  const goToTab = (tab, screen, params) => {
    navigation.navigate(tab, { screen, params });
  };

  const handleStudyToolPress = (key) => {
    switch (key) {
      case 'quiz':
      case 'quick':
        return goToTab('TestsTab', 'MixQuizSetup');
      case 'predictor':
        return goToTab('MoreTab', 'Predictor');
      case 'chapterwise':
      case 'material':
        return goToTab('TextbooksTab', 'TextbookList');
      case 'notes':
        return goToTab('MoreTab', 'Notes');
      case 'leaderboard':
        return navigation.navigate('Leaderboard');
      case 'weak':
        return goToTab('TestsTab', 'MyAttempts');
      default:
        return notify('Aarambh AI', 'Coming soon!');
    }
  };

  return (
    <ScreenContainer noPadding>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable
            hitSlop={8}
            onPress={() => navigation.navigate('Profile')}
            style={styles.menuButton}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </Pressable>

          <Logo size="sm" />

          <Pressable onPress={toggleTheme} style={styles.themeToggle}>
            <View style={[styles.themeThumb, isDark && styles.themeThumbDark]}>
              <Text style={styles.themeIcon}>{isDark ? '🌙' : '☀️'}</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.heroWrap}>
          <Carousel
            height={210}
            aspectRatio={BANNER_NATIVE_RATIO}
            autoAdvanceMs={5500}
            slides={HERO_SLIDES.map((slide) => ({
              key: slide.key,
              render: () => (
                <View style={styles.heroSlide}>
                  <Text style={styles.heroEyebrow}>{slide.eyebrow}</Text>
                  <Text style={styles.heroTitle}>{slide.title}</Text>
                  <Text style={styles.heroBody}>{slide.body}</Text>
                  <Pressable
                    onPress={() => goToTab('TextbooksTab', slide.target)}
                    style={styles.heroButton}
                  >
                    <Text style={styles.heroButtonText}>{slide.cta}  →</Text>
                  </Pressable>
                </View>
              ),
            }))}
          />
        </View>

        <View style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <View style={styles.missionHeaderLeft}>
              <Text style={styles.missionIcon}>🎯</Text>
              <View>
                <Text style={typography.h3}>Daily Mission</Text>
                <Text style={[typography.bodyMuted, styles.missionSubtitle]}>
                  Small steps. Big results.
                </Text>
              </View>
            </View>
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>
                📅 {today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ›
              </Text>
            </View>
          </View>

          <View style={styles.missionBody}>
            <View style={styles.progressRing}>
              <Text style={styles.progressRingText}>
                {completedTasks}/{DAILY_TASKS.length}
              </Text>
              <Text style={styles.progressRingLabel}>Completed</Text>
            </View>

            <View style={styles.taskList}>
              {DAILY_TASKS.map((task, index) => {
                const done = index < completedTasks;
                return (
                  <View key={task.key} style={styles.taskRow}>
                    <Text style={[styles.taskCheck, done && styles.taskCheckDone]}>
                      {done ? '✓' : '○'}
                    </Text>
                    <Text style={[typography.body, styles.taskLabel]}>{task.label}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.streakBox}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakDays}>{streakDays} Day Streak</Text>
              <Text style={styles.streakHint}>Keep going!</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionIcon}>📖</Text>
            <View>
              <Text style={typography.h3}>PYQ Practice + NCERT Line to Line</Text>
              <Text style={[typography.bodyMuted, styles.missionSubtitle]}>
                Study smarter. Understand deeper.
              </Text>
            </View>
          </View>
          <Pressable onPress={() => goToTab('TextbooksTab', 'TextbookList')}>
            <Text style={styles.viewAll}>View All →</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectRow}
        >
          {subjects.map((subject) => {
            const key = subject.code || subject.key || subject.title;
            const color = subject.color || colors.primary;
            return (
              <Pressable
                key={key}
                onPress={() =>
                  subject.code
                    ? goToTab('TextbooksTab', 'TextbookDetail', { code: subject.code })
                    : goToTab('TextbooksTab', 'TextbookList')
                }
                style={[styles.subjectCard, { borderBottomColor: color }]}
              >
                <View style={[styles.subjectIconWrap, { backgroundColor: hexToRgba(color, 0.12) }]}>
                  <Text style={styles.subjectIcon}>{subject.icon || '📚'}</Text>
                </View>
                <Text style={styles.subjectTitle}>{subject.title || subject.subject}</Text>
                <View style={styles.subjectMetaRow}>
                  <Text style={styles.subjectMeta}>100% NCERT</Text>
                  <Text style={[styles.subjectArrow, { color }]}>→</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.pyqCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionIcon}>🎯</Text>
              <View>
                <Text style={typography.h3}>PYQ of the Day</Text>
                <Text style={[typography.bodyMuted, styles.missionSubtitle]}>
                  Attempt today's question. Boost your confidence.
                </Text>
              </View>
            </View>
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>
                📅 {today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </View>
          </View>

          <View style={styles.pyqBody}>
            <View style={styles.pyqTagRow}>
              <Text style={styles.pyqTag}>
                NEET {pyq?.pyqYear || 2023}
              </Text>
              <Text style={styles.pyqTagMuted}>
                {(pyq?.options?.length || 4)} Options
              </Text>
            </View>

            <Text style={styles.pyqQuestion}>
              {pyq?.questionText ||
                'Which of the following is the correct sequence of the levels of biological organisation from smallest to largest?'}
            </Text>

            <View style={styles.pyqOptions}>
              {(pyq?.options?.length
                ? pyq.options
                : [
                    { text: 'Cell → Tissue → Organ → Organ system' },
                    { text: 'Tissue → Cell → Organ → Organ system' },
                    { text: 'Cell → Organ → Tissue → Organ system' },
                    { text: 'Organ → Tissue → Cell → Organ system' },
                  ]
              ).map((option, index) => {
                const selected = selectedOption === index;
                return (
                  <Pressable
                    key={index}
                    onPress={() => setSelectedOption(index)}
                    style={[styles.pyqOption, selected && styles.pyqOptionSelected]}
                  >
                    <View style={[styles.pyqOptionLetter, selected && styles.pyqOptionLetterSelected]}>
                      <Text
                        style={[
                          styles.pyqOptionLetterText,
                          selected && styles.pyqOptionLetterTextSelected,
                        ]}
                      >
                        {optionLabel(index)}
                      </Text>
                    </View>
                    <Text style={styles.pyqOptionText}>{option.text}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.pyqFooter}>
              <Text style={styles.pyqFooterText}>
                📖 NCERT Line to Line{pyq?.pageNumber ? `  |  Pg. ${pyq.pageNumber}` : ''}
              </Text>
              <Pressable
                onPress={() => notify('View Solution', 'Full solutions are coming soon!')}
              >
                <Text style={styles.viewAll}>View Solution →</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionIcon}>📖</Text>
            <View>
              <Text style={typography.h3}>Study Tools</Text>
              <Text style={[typography.bodyMuted, styles.missionSubtitle]}>
                Smart tools for smarter preparation.
              </Text>
            </View>
          </View>
          <Pressable onPress={() => goToTab('MoreTab', 'MoreHub')}>
            <Text style={styles.viewAll}>View All →</Text>
          </Pressable>
        </View>

        <View style={styles.toolGrid}>
          {STUDY_TOOLS.map((tool) => (
            <Pressable
              key={tool.key}
              onPress={() => handleStudyToolPress(tool.key)}
              style={[styles.toolCard, { backgroundColor: isDark ? colors.surface : tool.tint }]}
            >
              <Image source={tool.img} style={styles.toolIconImg} resizeMode="contain" />
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>
              <Text style={styles.toolArrow}>→</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionIcon}>🎯</Text>
            <View>
              <Text style={typography.h3}>Practice & Performance</Text>
              <Text style={[typography.bodyMuted, styles.missionSubtitle]}>
                Track. Improve. Get ahead.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.practiceRow}>
          {PRACTICE_TILES.map((tile) => (
            <Pressable
              key={tile.key}
              onPress={() => handleStudyToolPress(tile.key)}
              style={[styles.practiceCard, { backgroundColor: isDark ? colors.surface : tile.tint }]}
            >
              <Text style={styles.toolIcon}>{tile.icon}</Text>
              <Text style={styles.toolTitle}>{tile.title}</Text>
              <Text style={styles.toolSubtitle}>{tile.subtitle}</Text>
              <Text style={styles.toolArrow}>→</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.weakCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionIcon}>🎯</Text>
              <View>
                <Text style={typography.h3}>Your Weak Areas</Text>
                <Text style={[typography.bodyMuted, styles.missionSubtitle]}>
                  Focus more. Improve faster.
                </Text>
              </View>
            </View>
            <Pressable onPress={() => goToTab('TestsTab', 'MyAttempts')}>
              <Text style={styles.viewAll}>View Analysis →</Text>
            </Pressable>
          </View>
          <View style={styles.weakPillRow}>
            {WEAK_AREAS.map((area) => (
              <View
                key={area.key}
                style={[styles.weakPill, { backgroundColor: hexToRgba(area.color, 0.12) }]}
              >
                <Text style={[styles.weakPillText, { color: area.color }]}>
                  {area.label}  {area.percent}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const makeStyles = ({ colors, typography }) => StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  menuButton: {
    padding: spacing.xs,
  },
  menuIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  themeToggle: {
    width: 54,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  themeThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  themeThumbDark: {
    alignSelf: 'flex-end',
    backgroundColor: colors.surface,
  },
  themeIcon: {
    fontSize: 12,
  },
  heroWrap: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  heroSlide: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  heroEyebrow: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: colors.white,
    marginTop: spacing.xs,
  },
  heroBody: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
    maxWidth: 320,
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  heroButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  missionCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: hexToRgba(colors.primary, 0.06),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: hexToRgba(colors.primary, 0.15),
    padding: spacing.md,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
  },
  missionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  missionIcon: {
    fontSize: 26,
  },
  missionSubtitle: {
    marginTop: 2,
  },
  datePill: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePillText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  missionBody: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  progressRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 6,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  progressRingText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  progressRingLabel: {
    fontSize: 8,
    color: colors.textMuted,
    fontWeight: '600',
  },
  taskList: {
    gap: 6,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  taskCheck: {
    fontSize: 13,
    color: colors.textMuted,
    width: 16,
  },
  taskCheckDone: {
    color: colors.success,
    fontWeight: '800',
  },
  taskLabel: {
    fontSize: 13,
  },
  streakBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginLeft: 'auto',
  },
  streakIcon: {
    fontSize: 18,
  },
  streakDays: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  streakHint: {
    fontSize: 11,
    color: colors.textMuted,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  sectionIcon: {
    fontSize: 22,
  },
  viewAll: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  subjectRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  subjectCard: {
    width: 150,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 3,
    borderRadius: radius.md,
    padding: spacing.md,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  subjectIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  subjectIcon: {
    fontSize: 20,
  },
  subjectTitle: {
    ...typography.h3,
    fontSize: 15,
  },
  subjectMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  subjectMeta: {
    ...typography.caption,
  },
  subjectArrow: {
    fontWeight: '800',
  },
  pyqCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  pyqBody: {
    marginTop: spacing.xs,
  },
  pyqTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pyqTag: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  pyqTagMuted: {
    ...typography.caption,
  },
  pyqQuestion: {
    ...typography.body,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  pyqOptions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  pyqOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  pyqOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  pyqOptionLetter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pyqOptionLetterSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pyqOptionLetterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  pyqOptionLetterTextSelected: {
    color: colors.white,
  },
  pyqOptionText: {
    ...typography.body,
    flex: 1,
  },
  pyqFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pyqFooterText: {
    ...typography.caption,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  toolCard: {
    flexBasis: '31%',
    flexGrow: 1,
    borderRadius: radius.lg,
    padding: spacing.sm,
    minHeight: 110,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  toolIcon: {
    fontSize: 22,
  },
  toolIconImg: {
    width: 30,
    height: 30,
  },
  toolTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  toolSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toolArrow: {
    color: colors.primary,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  practiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  practiceCard: {
    flexBasis: '31%',
    flexGrow: 1,
    borderRadius: radius.lg,
    padding: spacing.sm,
    minHeight: 110,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  weakCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  weakPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  weakPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  weakPillText: {
    ...typography.caption,
    fontWeight: '700',
  },
});
