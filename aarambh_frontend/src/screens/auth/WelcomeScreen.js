import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Carousel from '../../components/Carousel';
import CountUp from '../../components/CountUp';
import { listTextbooks } from '../../api/textbooks.api';
import { predictRank } from '../../api/predictor.api';
import { getPublicStats } from '../../api/stats.api';
import colors from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/theme';
import { useBreakpoint, useColumns } from '../../theme/responsive';

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const SUBJECTS = [
  { key: 'biology', icon: '🧬', title: 'Biology', classLevel: 'XI · XII', tag: 'NEET', color: '#3DD68C' },
  { key: 'physics', icon: '⚡', title: 'Physics', classLevel: 'XI · XII', tag: 'NEET · JEE', color: '#5B8CFF' },
  { key: 'chemistry', icon: '⚗️', title: 'Chemistry', classLevel: 'XI · XII', tag: 'NEET · JEE', color: '#F5A623' },
  { key: 'maths', icon: '📐', title: 'Maths', classLevel: 'XI · XII', tag: 'JEE', color: '#E63946' },
];

const FEATURES = [
  {
    key: 'chapters',
    icon: '📚',
    title: 'Practice by NCERT chapter',
    body: 'Open any chapter and practice the exact high-probability questions mapped to it — no hunting through unrelated content.',
  },
  {
    key: 'mocks',
    icon: '📝',
    title: 'Mix Quiz & CBT mock tests',
    body: 'Build a custom quiz from high-probability questions, or sit a full CBT-style mock test with a real exam timer and question palette.',
  },
  {
    key: 'mentors',
    icon: '🎓',
    title: '1:1 mentor booking',
    body: 'Book a session with a top-ranker mentor when a chapter or a doubt is holding you back — pay, or unlock a free session with a 7-day practice streak.',
  },
  {
    key: 'doubts',
    icon: '💬',
    title: 'Ask a doubt',
    body: 'Stuck on a question? Ask a mentor directly and get a written answer back on the doubt.',
  },
  {
    key: 'bookmarks',
    icon: '🔖',
    title: 'Bookmark for revision',
    body: 'Save any question while practicing and come back to your saved list before exam day.',
  },
  {
    key: 'batches',
    icon: '🏫',
    title: 'Join a coaching batch',
    body: 'Browse structured NEET/JEE/Board batches with a syllabus, teachers and a weekly schedule, and enroll in one click.',
  },
  {
    key: 'predictor',
    icon: '📊',
    title: 'Score & rank prediction',
    body: 'Estimate your NEET rank from your marks, then see the probable colleges you’re in range for — try it below, no account needed.',
  },
  {
    key: 'pulse',
    icon: '⚡',
    title: 'Daily Aarambh Pulse',
    body: 'A 5-minute daily memory workout to keep formulas and key terms fresh, every single day.',
  },
];

const STEPS = [
  { key: '1', title: 'Pick a chapter', body: 'Choose your subject, class and chapter.' },
  { key: '2', title: 'Practice what’s asked', body: 'Work through questions mapped to that exact chapter.' },
  { key: '3', title: 'Take a mock test', body: 'Run a Mix Quiz or a full CBT-style mock under a timer.' },
  { key: '4', title: 'Track & get help', body: 'Review your attempts and book a mentor for doubts.' },
];

const FAQS = [
  {
    q: 'Which exams does Aarambh cover?',
    a: 'NEET, JEE and school Boards — every question is mapped back to an NCERT chapter.',
  },
  {
    q: 'Do I need the app to practice?',
    a: 'You can practice here on the web, and pick up the same account on the Aarambh mobile app.',
  },
  {
    q: 'What’s a Mix Quiz?',
    a: 'A custom quiz built on the fly from high-probability questions across chapters you choose, instead of one fixed mock test.',
  },
  {
    q: 'Can I get help from a mentor?',
    a: 'Yes — book a 1:1 session, or ask a doubt in writing and get an answer back from a mentor.',
  },
  {
    q: 'Are there structured coaching batches?',
    a: 'Yes — browse NEET/JEE/Board batches with a syllabus, teachers and weekly schedule, and enroll directly.',
  },
];

const NAV_LINKS = [
  { key: 'subjects', label: 'Subjects' },
  { key: 'features', label: 'Features' },
  { key: 'predictor', label: 'Try it' },
  { key: 'faq', label: 'FAQ' },
];

function NavPill({ label, onPress }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[styles.navPill, isHovered && styles.navPillHovered]}
    >
      <Text style={styles.navPillText}>{label}</Text>
    </Pressable>
  );
}

function NavBar({ navigation, maxWidth, onNavigate }) {
  const { isTablet } = useBreakpoint();
  return (
    <View style={styles.navBar}>
      <View style={[styles.band, { maxWidth }, styles.navRow]}>
        <View style={styles.navBrand}>
          <Text style={styles.navMark}>आ</Text>
          <Text style={styles.navTitle}>Aarambh</Text>
        </View>

        {isTablet ? (
          <View style={styles.navPills}>
            {NAV_LINKS.map((link) => (
              <NavPill key={link.key} label={link.label} onPress={() => onNavigate(link.key)} />
            ))}
          </View>
        ) : null}

        <View style={styles.navActions}>
          <Button title="Log in" variant="ghost" onPress={() => navigation.navigate('Login')} />
          <Button
            title="Sign up"
            onPress={() => navigation.navigate('Signup')}
            style={styles.navSignup}
          />
        </View>
      </View>
    </View>
  );
}

function Section({ background, children, maxWidth, style, onLayout }) {
  return (
    <View style={[styles.section, background && { backgroundColor: background }]} onLayout={onLayout}>
      <View style={[styles.band, { maxWidth }, style]}>{children}</View>
    </View>
  );
}

function RankPredictorWidget() {
  const [marks, setMarks] = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | error

  const handlePredict = async () => {
    const parsed = Number(marks);
    if (!marks || Number.isNaN(parsed)) return;
    setStatus('loading');
    setResult(null);
    try {
      const data = await predictRank({ marks: parsed });
      setResult(data);
      setStatus('idle');
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <Card style={styles.widgetCard}>
      <Text style={typography.h3}>Try the rank predictor — no sign-up needed</Text>
      <Text style={[typography.bodyMuted, styles.widgetSubtitle]}>
        Enter your NEET marks out of 720 to see your estimated All India Rank instantly.
      </Text>
      <View style={styles.widgetRow}>
        <TextInput
          value={marks}
          onChangeText={setMarks}
          placeholder="e.g. 620"
          keyboardType="number-pad"
          placeholderTextColor={colors.textMuted}
          style={styles.widgetInput}
        />
        <Button
          title="Predict"
          onPress={handlePredict}
          loading={status === 'loading'}
          style={styles.widgetButton}
        />
      </View>
      {status === 'error' ? (
        <Text style={styles.widgetError}>Couldn't estimate right now — try again in a moment.</Text>
      ) : null}
      {result ? (
        <View style={styles.widgetResult}>
          <Text style={styles.widgetRankLabel}>Estimated All India Rank</Text>
          <Text style={styles.widgetRank}>{result.estimatedRank}</Text>
          <Text style={typography.bodyMuted}>
            Likely range: {result.rankRange.min} – {result.rankRange.max}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

function WebLanding({ navigation }) {
  const { isDesktop } = useBreakpoint();
  const featureColumns = useColumns({ mobile: 1, tablet: 2, desktop: 4 });
  const subjectColumns = useColumns({ mobile: 2, tablet: 4, desktop: 4 });
  const maxWidth = 1160;

  const scrollRef = useRef(null);
  const sectionOffsets = useRef({});
  const [textbooks, setTextbooks] = useState([]);
  const [textbooksStatus, setTextbooksStatus] = useState('loading'); // loading | ready | error
  const [stats, setStats] = useState(null);

  useEffect(() => {
    listTextbooks()
      .then((data) => {
        setTextbooks(data);
        setTextbooksStatus('ready');
      })
      .catch(() => setTextbooksStatus('error'));
    getPublicStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const registerSection = (key) => (event) => {
    sectionOffsets.current[key] = event.nativeEvent.layout.y;
  };

  const scrollToSection = (key) => {
    const y = sectionOffsets.current[key];
    if (y != null && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(y - 24, 0), animated: true });
    }
  };

  const heroSlideHeight = isDesktop ? 400 : 520;

  const renderHeroSlide = () => (
    <LinearGradient
      colors={[colors.primary, '#7A1420']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientSlide}
    >
      <View style={[styles.band, { maxWidth }]}>
        <Text style={[typography.caption, styles.heroEyebrowLight]}>NEET · JEE · BOARDS</Text>
        <Text style={[styles.heroHeadlineLight, isDesktop && styles.heroHeadlineDesktop]}>
          Open any textbook page.{'\n'}See what will be asked.
        </Text>
        <Text style={[styles.heroSubheadLight]}>
          High-probability exam questions generated from every NCERT chapter — mapped to NEET, JEE
          & Boards.
        </Text>
        <View style={styles.heroActions}>
          <Button title="Start practicing" variant="light" onPress={() => navigation.navigate('Signup')} />
          <Button
            title="I already have an account"
            variant="outline"
            onPress={() => navigation.navigate('Login')}
            style={[styles.heroSecondary, styles.heroSecondaryLight]}
          />
        </View>
        <Text style={styles.heroFactsLight}>
          {textbooksStatus === 'ready' ? textbooks.length : SUBJECTS.length}{' '}
          {textbooksStatus === 'ready' ? 'textbooks' : 'subjects'} · Class XI & XII · NEET, JEE &
          Boards
        </Text>
      </View>
    </LinearGradient>
  );

  const renderStatsSlide = () => (
    <LinearGradient
      colors={['#1A1A1D', '#3A1015']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientSlide}
    >
      <View style={[styles.band, { maxWidth }, styles.statsBand]}>
        <Text style={styles.statsEyebrow}>AARAMBH, RIGHT NOW</Text>
        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            {stats ? (
              <CountUp value={stats.totalStudents} style={styles.statNumber} />
            ) : (
              <Text style={styles.statNumber}>—</Text>
            )}
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statTile}>
            {stats ? (
              <CountUp value={stats.totalQuestions} style={styles.statNumber} />
            ) : (
              <Text style={styles.statNumber}>—</Text>
            )}
            <Text style={styles.statLabel}>Questions in the bank</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statTile}>
            {stats ? (
              <CountUp value={stats.totalMentors} style={styles.statNumber} />
            ) : (
              <Text style={styles.statNumber}>—</Text>
            )}
            <Text style={styles.statLabel}>Mentors available</Text>
          </View>
        </View>
        <Text style={styles.statsFootnote}>Real numbers, pulled live from our own database.</Text>
      </View>
    </LinearGradient>
  );

  const renderMentorSlide = () => (
    <LinearGradient
      colors={['#1B1E3C', '#3A2E6B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientSlide}
    >
      <View
        style={[
          styles.band,
          { maxWidth },
          styles.spotlightBand,
          isDesktop && styles.spotlightBandDesktop,
        ]}
      >
        <View style={[styles.spotlightGraphic, isDesktop && styles.spotlightGraphicDesktop]}>
          <View style={[styles.blob, styles.blobBack]} />
          <View style={[styles.blob, styles.blobFront]}>
            <Text style={styles.spotlightIcon}>🎓</Text>
          </View>
        </View>
        <View style={[styles.spotlightText, isDesktop && styles.spotlightTextDesktop]}>
          <Text style={styles.statsEyebrow}>1:1 MENTORSHIP</Text>
          <Text style={[styles.spotlightTitle, isDesktop && styles.spotlightTitleDesktop]}>
            Book a session with a top-ranker mentor
          </Text>
          <Text style={styles.heroSubheadLight}>
            Stuck on a chapter or a doubt? Get personal guidance — or earn a free session by
            keeping a 7-day practice streak.
          </Text>
          <Button
            title="Sign up to browse mentors"
            variant="light"
            onPress={() => navigation.navigate('Signup')}
            style={styles.spotlightButton}
          />
        </View>
      </View>
    </LinearGradient>
  );

  const renderPredictorSlide = () => (
    <LinearGradient
      colors={['#2B1B0E', '#6B4A1E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientSlide}
    >
      <View
        style={[
          styles.band,
          { maxWidth },
          styles.spotlightBand,
          isDesktop && styles.spotlightBandDesktop,
        ]}
      >
        <View style={[styles.spotlightGraphic, isDesktop && styles.spotlightGraphicDesktop]}>
          <View style={[styles.blob, styles.blobBack]} />
          <View style={[styles.blob, styles.blobFront]}>
            <Text style={styles.spotlightIcon}>📊</Text>
          </View>
        </View>
        <View style={[styles.spotlightText, isDesktop && styles.spotlightTextDesktop]}>
          <Text style={styles.statsEyebrow}>FREE TOOL · NO SIGN-UP</Text>
          <Text style={[styles.spotlightTitle, isDesktop && styles.spotlightTitleDesktop]}>
            See your NEET rank in seconds
          </Text>
          <Text style={styles.heroSubheadLight}>
            Enter your expected marks and get an instant estimated All India Rank — try it right
            now, no account needed.
          </Text>
          <Button
            title="Try the predictor ↓"
            variant="light"
            onPress={() => scrollToSection('predictor')}
            style={styles.spotlightButton}
          />
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.page}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <NavBar navigation={navigation} maxWidth={maxWidth} onNavigate={scrollToSection} />

        <Carousel
          height={heroSlideHeight}
          autoAdvanceMs={5500}
          slides={[
            { key: 'hero', render: renderHeroSlide },
            { key: 'stats', render: renderStatsSlide },
            { key: 'mentors', render: renderMentorSlide },
            { key: 'predictor', render: renderPredictorSlide },
          ]}
        />

        {stats?.recentActivity?.length ? (
          <Section maxWidth={maxWidth} style={styles.activitySection}>
            <Text style={[typography.caption, styles.activityLabel]}>🟢 Recent activity</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activityRow}>
              {stats.recentActivity.map((activity, index) => (
                <View key={index} style={styles.activityChip}>
                  <Text style={styles.activityText}>
                    Scored {activity.accuracy}% on “{activity.title}”
                  </Text>
                  <Text style={styles.activityTime}>{timeAgo(activity.completedAt)}</Text>
                </View>
              ))}
            </ScrollView>
          </Section>
        ) : null}

        <Section maxWidth={maxWidth} onLayout={registerSection('subjects')}>
          <Text style={typography.h2}>Every NCERT chapter, mapped to your exam</Text>
          <Text style={[typography.bodyMuted, styles.sectionSubtitle]}>
            Open any book, read a chapter and try the questions — no account needed.
          </Text>
          {textbooksStatus === 'ready' && textbooks.length > 0 ? (
            <View style={styles.grid}>
              {textbooks.map((book) => (
                <View
                  key={book._id}
                  style={[styles.gridItem, { flexBasis: `${100 / subjectColumns}%` }]}
                >
                  <Card style={[styles.subjectCard, { borderTopColor: book.color || colors.primary }]}>
                    <Text style={styles.subjectIcon}>{book.icon || '📚'}</Text>
                    <Text style={typography.h3}>{book.title}</Text>
                    <Text style={[typography.caption, styles.subjectMeta]}>
                      Class {book.classLevel}
                    </Text>
                    <Text style={[typography.caption, styles.subjectTag]}>
                      {book.examTags?.join(' · ')}
                    </Text>
                    <Button
                      title="Explore →"
                      variant="outline"
                      textColor={book.color || colors.primary}
                      onPress={() => navigation.navigate('PublicBookDetail', { code: book.code })}
                      style={[styles.exploreButton, { borderColor: book.color || colors.primary }]}
                    />
                  </Card>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.grid}>
              {SUBJECTS.map((subject) => (
                <View
                  key={subject.key}
                  style={[styles.gridItem, { flexBasis: `${100 / subjectColumns}%` }]}
                >
                  <Card style={[styles.subjectCard, { borderTopColor: subject.color }]}>
                    <Text style={styles.subjectIcon}>{subject.icon}</Text>
                    <Text style={typography.h3}>{subject.title}</Text>
                    <Text style={[typography.caption, styles.subjectMeta]}>
                      Class {subject.classLevel}
                    </Text>
                    <Text style={[typography.caption, styles.subjectTag]}>{subject.tag}</Text>
                    <Button
                      title="Explore →"
                      variant="outline"
                      textColor={subject.color}
                      onPress={() => navigation.navigate('Signup')}
                      style={[styles.exploreButton, { borderColor: subject.color }]}
                    />
                  </Card>
                </View>
              ))}
            </View>
          )}
        </Section>

        <Section background={colors.backgroundElevated} maxWidth={maxWidth} onLayout={registerSection('features')}>
          <Text style={typography.h2}>Built around how you actually prep</Text>
          <View style={styles.grid}>
            {FEATURES.map((feature) => (
              <View
                key={feature.key}
                style={[styles.gridItem, { flexBasis: `${100 / featureColumns}%` }]}
              >
                <Card style={styles.featureCard}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={typography.h3}>{feature.title}</Text>
                  <Text style={[typography.bodyMuted, styles.featureBody]}>{feature.body}</Text>
                </Card>
              </View>
            ))}
          </View>
        </Section>

        <Section maxWidth={maxWidth} onLayout={registerSection('predictor')} style={styles.widgetSection}>
          <RankPredictorWidget />
        </Section>

        <Section background={colors.backgroundElevated} maxWidth={maxWidth}>
          <Text style={typography.h2}>How it works</Text>
          <View style={styles.grid}>
            {STEPS.map((step, index) => (
              <View key={step.key} style={[styles.gridItem, { flexBasis: `${100 / (isDesktop ? 4 : 1)}%` }]}>
                <View style={styles.stepCard}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  <Text style={typography.h3}>{step.title}</Text>
                  <Text style={[typography.bodyMuted, styles.featureBody]}>{step.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </Section>

        <Section maxWidth={maxWidth} onLayout={registerSection('faq')}>
          <Text style={typography.h2}>Frequently asked</Text>
          <View style={styles.faqList}>
            {FAQS.map((item) => (
              <View key={item.q} style={styles.faqItem}>
                <Text style={typography.h3}>{item.q}</Text>
                <Text style={[typography.bodyMuted, styles.faqAnswer]}>{item.a}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section background={colors.backgroundElevated} maxWidth={maxWidth} style={styles.footer}>
          <Text style={[typography.caption, styles.footerText]}>
            © {new Date().getFullYear()} Aarambh · Built for students, by a student.
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}

function NativeWelcome({ navigation }) {
  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.mark}>आ</Text>
        <Text style={styles.brand}>Aarambh</Text>
        <Text style={[typography.bodyMuted, styles.tagline]}>
          See what will be asked. NCERT-mapped practice for NEET, JEE & Boards.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title="Log in" onPress={() => navigation.navigate('Login')} />
        <Button
          title="Create an account"
          variant="outline"
          onPress={() => navigation.navigate('Signup')}
          style={styles.spacedButton}
        />
        <Button
          title="Continue with phone / email OTP"
          variant="ghost"
          onPress={() => navigation.navigate('Otp')}
          style={styles.spacedButton}
        />
      </View>
    </ScreenContainer>
  );
}

export default function WelcomeScreen({ navigation }) {
  if (Platform.OS === 'web') {
    return <WebLanding navigation={navigation} />;
  }
  return <NativeWelcome navigation={navigation} />;
}

const styles = StyleSheet.create({
  // --- web landing ---
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  navMark: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  navTitle: {
    ...typography.h3,
  },
  navPills: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    ...Platform.select({
      web: { cursor: 'pointer', transitionProperty: 'background-color', transitionDuration: '120ms' },
      default: {},
    }),
  },
  navPillHovered: {
    backgroundColor: colors.primaryMuted,
  },
  navPillText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  navSignup: {
    minWidth: 100,
  },
  section: {
    width: '100%',
    alignItems: 'center',
  },
  band: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  gradientSlide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEyebrowLight: {
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  heroHeadlineLight: {
    ...typography.h1,
    fontSize: 30,
    marginTop: spacing.sm,
    color: colors.white,
  },
  heroHeadlineDesktop: {
    fontSize: 46,
    lineHeight: 54,
  },
  heroSubheadLight: {
    marginTop: spacing.md,
    maxWidth: 560,
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  heroSecondary: {
    minWidth: 200,
  },
  heroSecondaryLight: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  heroFactsLight: {
    ...typography.caption,
    marginTop: spacing.lg,
    color: 'rgba(255,255,255,0.7)',
  },
  statsBand: {
    alignItems: 'center',
  },
  statsEyebrow: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  statTile: {
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    minWidth: 90,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
  },
  statLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statsFootnote: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.5)',
    marginTop: spacing.lg,
  },
  spotlightBand: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  spotlightBandDesktop: {
    flexDirection: 'row',
    textAlign: 'left',
  },
  spotlightGraphic: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  spotlightGraphicDesktop: {
    marginBottom: 0,
    marginRight: spacing.xl,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobBack: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  blobFront: {
    width: 96,
    height: 96,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightIcon: {
    fontSize: 44,
  },
  spotlightText: {
    flex: 1,
    alignItems: 'center',
  },
  spotlightTextDesktop: {
    alignItems: 'flex-start',
  },
  spotlightTitle: {
    ...typography.h1,
    fontSize: 26,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  spotlightTitleDesktop: {
    textAlign: 'left',
  },
  spotlightButton: {
    marginTop: spacing.lg,
    minWidth: 220,
  },
  activitySection: {
    paddingVertical: spacing.md,
  },
  activityLabel: {
    color: colors.success,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  activityRow: {
    gap: spacing.sm,
  },
  activityChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    maxWidth: 320,
  },
  activityText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  activityTime: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionSubtitle: {
    marginTop: spacing.xs,
  },
  sectionLoading: {
    marginTop: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
    marginHorizontal: -spacing.sm,
  },
  gridItem: {
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  subjectCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderTopWidth: 3,
  },
  subjectIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  subjectMeta: {
    marginTop: spacing.xs,
  },
  subjectTag: {
    marginTop: spacing.xs,
    color: colors.primary,
  },
  exploreButton: {
    borderRadius: radius.pill,
    marginTop: spacing.md,
    width: '100%',
  },
  featureCard: {
    height: '100%',
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  featureBody: {
    marginTop: spacing.xs,
  },
  widgetSection: {
    alignItems: 'center',
  },
  widgetCard: {
    width: '100%',
    maxWidth: 560,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  widgetSubtitle: {
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  widgetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  widgetInput: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  widgetButton: {
    minWidth: 120,
  },
  widgetError: {
    color: colors.danger,
    marginTop: spacing.sm,
  },
  widgetResult: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  widgetRankLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  widgetRank: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.primary,
    marginVertical: spacing.xs,
  },
  stepCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    height: '100%',
  },
  stepNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  faqList: {
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  faqItem: {
    marginBottom: spacing.md,
  },
  faqAnswer: {
    marginTop: spacing.xs,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    color: colors.textMuted,
  },

  // --- native (unchanged) ---
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  brand: {
    ...typography.h1,
    fontSize: 34,
  },
  tagline: {
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  actions: {
    paddingBottom: spacing.xl,
  },
  spacedButton: {
    marginTop: spacing.sm,
  },
});
