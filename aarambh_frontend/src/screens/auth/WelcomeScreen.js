import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Carousel from '../../components/Carousel';
import CountUp from '../../components/CountUp';
import Logo from '../../components/Logo';
import ThemeToggle from '../../components/ThemeToggle';
import { listTextbooks } from '../../api/textbooks.api';
import { predictRank } from '../../api/predictor.api';
import { getPublicStats } from '../../api/stats.api';
import { radius, shadow, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { useBreakpoint, useColumns } from '../../theme/responsive';

// Real marketing creatives, text baked into the artwork — used as-is for
// the hero and NCERT+PYQ carousel slides instead of code-drawn copy.
const BANNER_NEET_JOURNEY = require('../../images/screen1.jpg');
const BANNER_NCERT_PYQ = require('../../images/screen2.jpg');
const BANNER_NATIVE_RATIO = 1280 / 721;

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

// Pastel tile backgrounds — the same palette/technique the mobile app's
// in-app Study Tools grid already uses (HomeScreen.js STUDY_TOOLS), reused
// here so the marketing site and the actual product look like one system
// instead of the web landing page having its own separate visual language.
const FEATURES = [
  {
    key: 'chapters',
    icon: '📚',
    title: 'Practice by NCERT chapter',
    body: 'Open any chapter and practice the exact high-probability questions mapped to it — no hunting through unrelated content.',
    tint: '#FBE7EA',
  },
  {
    key: 'mocks',
    icon: '📝',
    title: 'Mix Quiz & CBT mock tests',
    body: 'Build a custom quiz from high-probability questions, or sit a full CBT-style mock test with a real exam timer and question palette.',
    tint: '#E7ECFB',
  },
  {
    key: 'mentors',
    icon: '🎓',
    title: '1:1 mentor booking',
    body: 'Book a session with a top-ranker mentor when a chapter or a doubt is holding you back — pay, or unlock a free session with a 7-day practice streak.',
    tint: '#E4F5EC',
  },
  {
    key: 'doubts',
    icon: '💬',
    title: 'Ask a doubt',
    body: 'Stuck on a question? Ask a mentor directly and get a written answer back on the doubt.',
    tint: '#F2E9FB',
  },
  {
    key: 'bookmarks',
    icon: '🔖',
    title: 'Bookmark for revision',
    body: 'Save any question while practicing and come back to your saved list before exam day.',
    tint: '#FBF0E3',
  },
  {
    key: 'batches',
    icon: '🏫',
    title: 'Join a coaching batch',
    body: 'Browse structured NEET/JEE/Board batches with a syllabus, teachers and a weekly schedule, and enroll in one click.',
    tint: '#E7F0FB',
  },
  {
    key: 'predictor',
    icon: '📊',
    title: 'Score & rank prediction',
    body: 'Estimate your NEET rank from your marks, then see the probable colleges you’re in range for — try it below, no account needed.',
    tint: '#FBE7EA',
  },
  {
    key: 'pulse',
    icon: '⚡',
    title: 'Daily Aarambh Pulse',
    body: 'A 5-minute daily memory workout to keep formulas and key terms fresh, every single day.',
    tint: '#E7ECFB',
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
    q: 'What is Aarambh?',
    a: 'Aarambh is a NEET preparation platform that connects NEET PYQs directly with the NCERT lines from which they were asked, making NCERT-based preparation more focused and practical.',
  },
  {
    q: 'What does "PYQ from NCERT line to line" mean?',
    a: 'Each PYQ is linked to the relevant NCERT line or content that it was based on. This helps you understand which parts of NCERT have been tested in NEET.',
  },
  {
    q: 'Can I practice PYQs chapter-wise?',
    a: 'Yes. Aarambh allows you to practice NEET PYQs according to subjects and chapters, helping you focus on specific topics during your preparation.',
  },
  {
    q: 'Is Aarambh free?',
    a: 'Aarambh is currently launching in beta, with its core PYQ–NCERT feature available for students to explore and use.',
  },
  {
    q: 'Who created Aarambh?',
    a: 'Aarambh was created by Mukul Singla, a 4th-year MBBS student who scored 670/720 in NEET through self-study without coaching. Aarambh was created from his own NEET preparation experience, with the goal of making NCERT-focused PYQ practice simpler and more effective for NEET aspirants.',
  },
];

const CONTACT_LINKS = [
  {
    key: 'instagram',
    glyph: 'IG',
    label: 'Instagram',
    value: '@chale_mukul',
    url: 'https://www.instagram.com/chale_mukul?stkn=MWZtaG83OG9qNHVqcw==',
  },
  {
    key: 'youtube',
    glyph: 'YT',
    label: 'YouTube',
    value: '@chale_mukul7',
    url: 'https://youtube.com/@chale_mukul7?si=fNWGKMVEPmeBu_rw',
  },
  {
    key: 'email',
    glyph: '@',
    label: 'Email',
    value: 'aggarwal7m@gmail.com',
    url: 'mailto:aggarwal7m@gmail.com',
  },
];

// A dedicated dark neutral for the footer band — independent of the light/dark
// theme toggle. Matches the charcoal already used as the stats/mentor slide
// gradient start (#1A1A1D) so it reads as one deliberate palette, not a
// one-off color.
const FOOTER_BG = '#17171A';

const NAV_LINKS = [
  { key: 'subjects', label: 'Subjects' },
  { key: 'features', label: 'Features' },
  { key: 'predictor', label: 'Try it' },
  { key: 'faq', label: 'FAQ' },
  { key: 'contact', label: 'Contact' },
];

function NavPill({ label, onPress }) {
  const styles = useThemedStyles(makeStyles);
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={styles.navPill}
    >
      <Text style={[styles.navPillText, isHovered && styles.navPillTextHovered]}>{label}</Text>
      <View style={[styles.navPillUnderline, isHovered && styles.navPillUnderlineHovered]} />
    </Pressable>
  );
}

function NavBar({ navigation, maxWidth, onNavigate, isScrolled }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { isTablet } = useBreakpoint();
  return (
    <View style={[styles.navBar, isScrolled && styles.navBarScrolled]}>
      <RevealOnMount style={[styles.band, { maxWidth }, styles.navRow]}>
        <Logo size="sm" />

        {isTablet ? (
          <View style={styles.navPills}>
            {NAV_LINKS.map((link) => (
              <NavPill key={link.key} label={link.label} onPress={() => onNavigate(link.key)} />
            ))}
          </View>
        ) : null}

        <View style={styles.navActions}>
          <ThemeToggle style={styles.navThemeToggle} />
          <Button title="Log in" variant="ghost" onPress={() => navigation.navigate('Login')} />
          <Button
            title="Sign up"
            onPress={() => navigation.navigate('Signup')}
            style={styles.navSignup}
          />
        </View>
      </RevealOnMount>
      <LinearGradient
        colors={[colors.primary, 'rgba(230,57,70,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.navAccentLine}
      />
    </View>
  );
}

function FaqItem({ index, question, answer }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      onPress={() => setIsOpen((prev) => !prev)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[styles.faqItem, (isOpen || isHovered) && styles.faqItemActive]}
    >
      <View style={styles.faqHeader}>
        <View style={[styles.faqBadge, isOpen && styles.faqBadgeActive]}>
          <Text style={[styles.faqBadgeText, isOpen && styles.faqBadgeTextActive]}>
            {String(index + 1).padStart(2, '0')}
          </Text>
        </View>
        <Text style={[typography.h3, styles.faqQuestion]}>{question}</Text>
        <Text style={[styles.faqToggle, isOpen && styles.faqToggleOpen]}>+</Text>
      </View>

      <View style={[styles.faqAnswerWrap, isOpen && styles.faqAnswerWrapOpen]}>
        <Text style={[typography.bodyMuted, styles.faqAnswer]}>{answer}</Text>
      </View>
    </Pressable>
  );
}

function ContactLink({ contact }) {
  const styles = useThemedStyles(makeStyles);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      onPress={() => Linking.openURL(contact.url)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={({ pressed }) => [
        styles.footerLink,
        isHovered && styles.footerLinkHovered,
        pressed && styles.footerLinkPressed,
      ]}
    >
      <View style={[styles.footerLinkBadge, isHovered && styles.footerLinkBadgeHovered]}>
        <Text style={[styles.footerLinkBadgeText, isHovered && styles.footerLinkBadgeTextHovered]}>
          {contact.glyph}
        </Text>
      </View>
      <View>
        <Text style={styles.footerLinkLabel}>{contact.label}</Text>
        <Text style={styles.footerLinkValue}>{contact.value}</Text>
      </View>
    </Pressable>
  );
}

// Backend deliberately anonymizes recent activity (no name/userId — see
// stats.controller.js), so each card is colour-coded by the *real* accuracy
// instead of a fabricated avatar/name — keeps it honest while still giving
// the row the same multi-coloured-badge feel as the reference design.
function activityTint(accuracy) {
  if (accuracy >= 75) return { bg: '#E4F5EC', icon: '🎯' };
  if (accuracy >= 50) return { bg: '#FBF0E3', icon: '📘' };
  return { bg: '#FBE7EA', icon: '✍️' };
}

function ActivityCard({ activity }) {
  const styles = useThemedStyles(makeStyles);
  const [isHovered, setIsHovered] = useState(false);
  const tint = activityTint(activity.accuracy);

  return (
    <Pressable
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[styles.activityCard, isHovered && styles.activityCardHovered]}
    >
      <View style={[styles.activityAvatar, { backgroundColor: tint.bg }]}>
        <Text style={styles.activityAvatarIcon}>{tint.icon}</Text>
      </View>
      <View style={styles.activityBody}>
        <Text style={styles.activityTitle} numberOfLines={1}>
          {activity.title}
        </Text>
        <Text style={styles.activityMeta} numberOfLines={1}>
          Scored {activity.accuracy}% · {activity.exam}
        </Text>
      </View>
      <Text style={styles.activityTime}>{timeAgo(activity.completedAt)}</Text>
    </Pressable>
  );
}

// A small continuously-pulsing dot — the "this is live" indicator next to
// the Recent Activity heading, in place of a static green circle emoji.
function PulsingDot({ color, size = 8 }) {
  const { colors } = useTheme();
  if (color === undefined) {
    color = colors.success;
  }
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ scale }],
          opacity,
        }}
      />
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
    </View>
  );
}

// A soft "radar ping" behind a spotlight icon — expands and fades on a loop,
// purely decorative, so it always keeps running (no need to gate it on slide
// visibility the way CountUp/RevealOnMount are).
function PulseRing({ size = 140, color = 'rgba(255,255,255,0.16)' }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1800, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.4] });
  const opacity = pulse.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.7, 0.25, 0] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ scale }],
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
}

// Gentle continuous up/down bob — gives an otherwise static icon a "floating",
// game-like feel instead of sitting dead still on the slide.
function FloatBob({ children, style, range = 7, duration = 1900 }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -range,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: range,
          duration: duration * 2,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [translateY, range, duration]);

  return <Animated.View style={[style, { transform: [{ translateY }] }]}>{children}</Animated.View>;
}

// Fades + slides content in on mount. Paired with a `key` that changes each
// time a carousel slide becomes the active one, so re-mounting it replays the
// entrance every time a student swipes back to that slide — the whole point
// being a static gradient slide should feel alive, not just sit there.
function RevealOnMount({ children, style, delay = 0 }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 520,
      delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [progress, delay]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

function Section({ background, children, maxWidth, style, onLayout }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.section, background && { backgroundColor: background }]} onLayout={onLayout}>
      <View style={[styles.band, { maxWidth }, style]}>{children}</View>
    </View>
  );
}

function RankPredictorWidget() {
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
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
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { isDesktop, isTablet } = useBreakpoint();
  // Phone-width viewports get a genuinely compact banner (row layout, small
  // icon, no secondary copy) instead of the stacked column layout, which
  // needed 500px+ of height to avoid clipping and ended up taking over the
  // whole screen instead of reading as a banner.
  const isCompactHero = !isTablet;
  const featureColumns = useColumns({ mobile: 1, tablet: 2, desktop: 4 });
  const subjectColumns = useColumns({ mobile: 2, tablet: 4, desktop: 4 });
  const activityColumns = useColumns({ mobile: 1, tablet: 2, desktop: 4 });
  const maxWidth = 1160;

  const scrollRef = useRef(null);
  const sectionOffsets = useRef({});
  const [textbooks, setTextbooks] = useState([]);
  const [textbooksStatus, setTextbooksStatus] = useState('loading'); // loading | ready | error
  const [stats, setStats] = useState(null);
  // Which hero-carousel slide is actually on screen right now — the
  // gradient slides use this to replay their entrance/count-up animation
  // every time a student swipes (back) onto them, instead of only once on
  // page load while they were still off-screen.
  const [activeHeroSlide, setActiveHeroSlide] = useState('hero');
  // Lets the toolbar pick up a shadow once the page has scrolled past it,
  // instead of sitting completely flat against the page forever.
  const [isScrolled, setIsScrolled] = useState(false);

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
  // The icon+headline slides get their own content-driven height rather than
  // the photo banners' aspect-ratio-derived box (that mismatch is what
  // clipped them on mobile). Sized per tier instead of one big number for
  // every width: compact phones get a short row-layout banner close to what
  // the photo slides render at natively, so the carousel doesn't visibly
  // jump in height slide to slide, and tablet/desktop step up from there.
  const contentSlideHeight = isDesktop ? 420 : isTablet ? 320 : 230;

  const renderHeroSlide = () => (
    <Pressable onPress={() => navigation.navigate('Signup')} style={styles.imageSlide}>
      <Image source={BANNER_NEET_JOURNEY} style={styles.imageSlideFill} resizeMode="contain" />
      <Pressable
        onPress={(event) => {
          event.stopPropagation?.();
          navigation.navigate('Login');
        }}
        style={styles.imageSlideLoginPill}
      >
        <Text style={styles.imageSlideLoginText}>Already have an account? Log in</Text>
      </Pressable>
    </Pressable>
  );

  const renderNcertPyqSlide = () => (
    <Pressable onPress={() => navigation.navigate('Signup')} style={styles.imageSlide}>
      <Image source={BANNER_NCERT_PYQ} style={styles.imageSlideFill} resizeMode="contain" />
    </Pressable>
  );

  const isStatsActive = activeHeroSlide === 'stats';

  const renderStatsSlide = () => (
    <LinearGradient
      colors={['#1A1A1D', '#3A1015']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientSlide}
    >
      <View
        style={[
          styles.band,
          { maxWidth },
          styles.statsBand,
          isCompactHero && styles.statsBandCompact,
        ]}
      >
        <RevealOnMount key={isStatsActive ? 'stats-in' : 'stats-out'} style={styles.statsReveal}>
          <Text style={[styles.statsEyebrow, isCompactHero && styles.eyebrowCompact]}>
            AARAMBH, RIGHT NOW
          </Text>
          {!isCompactHero ? (
            <Text style={[styles.spotlightTitle, isDesktop && styles.statsTitleDesktop]}>
              A growing community of NEET aspirants
            </Text>
          ) : null}
          <View style={[styles.statsRow, isCompactHero && styles.statsRowCompact]}>
            <View style={styles.statTile}>
              <View
                style={[
                  styles.statIconBadge,
                  isCompactHero && styles.statIconBadgeCompact,
                  { backgroundColor: 'rgba(91, 140, 255, 0.18)' },
                ]}
              >
                <Text style={[styles.statIconText, isCompactHero && styles.statIconTextCompact]}>
                  🎓
                </Text>
              </View>
              {stats ? (
                <CountUp
                  value={stats.totalStudents}
                  style={[styles.statNumber, isCompactHero && styles.statNumberCompact]}
                />
              ) : (
                <Text style={[styles.statNumber, isCompactHero && styles.statNumberCompact]}>—</Text>
              )}
              <Text style={[styles.statLabel, isCompactHero && styles.statLabelCompact]}>
                Students
              </Text>
            </View>
            <View style={[styles.statDivider, isCompactHero && styles.statDividerCompact]} />
            <View style={styles.statTile}>
              <View
                style={[
                  styles.statIconBadge,
                  isCompactHero && styles.statIconBadgeCompact,
                  { backgroundColor: 'rgba(245, 166, 35, 0.18)' },
                ]}
              >
                <Text style={[styles.statIconText, isCompactHero && styles.statIconTextCompact]}>
                  📘
                </Text>
              </View>
              {stats ? (
                <CountUp
                  value={stats.totalQuestions}
                  style={[styles.statNumber, isCompactHero && styles.statNumberCompact]}
                />
              ) : (
                <Text style={[styles.statNumber, isCompactHero && styles.statNumberCompact]}>—</Text>
              )}
              <Text style={[styles.statLabel, isCompactHero && styles.statLabelCompact]}>
                Questions
              </Text>
            </View>
            <View style={[styles.statDivider, isCompactHero && styles.statDividerCompact]} />
            <View style={styles.statTile}>
              <View
                style={[
                  styles.statIconBadge,
                  isCompactHero && styles.statIconBadgeCompact,
                  { backgroundColor: 'rgba(24, 135, 90, 0.18)' },
                ]}
              >
                <Text style={[styles.statIconText, isCompactHero && styles.statIconTextCompact]}>
                  🧑‍🏫
                </Text>
              </View>
              {stats ? (
                <CountUp
                  value={stats.totalMentors}
                  style={[styles.statNumber, isCompactHero && styles.statNumberCompact]}
                />
              ) : (
                <Text style={[styles.statNumber, isCompactHero && styles.statNumberCompact]}>—</Text>
              )}
              <Text style={[styles.statLabel, isCompactHero && styles.statLabelCompact]}>
                Mentors
              </Text>
            </View>
          </View>
          {!isCompactHero ? (
            <Button
              title="Create your free account"
              variant="light"
              onPress={() => navigation.navigate('Signup')}
              style={styles.spotlightButton}
            />
          ) : null}
          <Text style={[styles.statsFootnote, isCompactHero && styles.statsFootnoteCompact]}>
            {isCompactHero ? 'Real numbers, live.' : 'Real numbers, pulled live from our own database.'}
          </Text>
        </RevealOnMount>
      </View>
    </LinearGradient>
  );

  const isMentorsActive = activeHeroSlide === 'mentors';

  const renderMentorSlide = () => (
    <LinearGradient
      colors={['#1B1E3C', '#3A2E6B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientSlide}
    >
      <View style={[styles.band, { maxWidth }, styles.spotlightBand, isCompactHero && styles.spotlightBandCompact]}>
        <View
          style={[
            styles.spotlightGraphic,
            isCompactHero && styles.spotlightGraphicCompact,
            isDesktop && styles.spotlightGraphicWide,
          ]}
        >
          <PulseRing
            size={isDesktop ? 200 : isCompactHero ? 56 : 168}
            color="rgba(155, 140, 255, 0.35)"
          />
          <FloatBob style={styles.blobFloatWrap} range={isCompactHero ? 3 : 7}>
            <View
              style={[
                styles.blobFront,
                isCompactHero && styles.blobFrontCompact,
                isDesktop && styles.blobFrontWide,
              ]}
            >
              <Text
                style={[
                  styles.spotlightIcon,
                  isCompactHero && styles.spotlightIconCompact,
                  isDesktop && styles.spotlightIconWide,
                ]}
              >
                🎓
              </Text>
            </View>
          </FloatBob>
          {!isCompactHero ? (
            <FloatBob style={styles.spotlightBadgeWrap} range={5} duration={1500}>
              <View style={styles.spotlightBadge}>
                <Text style={styles.spotlightBadgeText}>⭐ Top-ranker mentors</Text>
              </View>
            </FloatBob>
          ) : null}
        </View>
        <RevealOnMount
          key={isMentorsActive ? 'mentors-in' : 'mentors-out'}
          style={styles.spotlightText}
        >
          <Text style={[styles.statsEyebrow, isCompactHero && styles.eyebrowCompact]}>
            1:1 MENTORSHIP
          </Text>
          <Text
            style={[
              styles.spotlightTitle,
              styles.spotlightTitleRow,
              isCompactHero && styles.spotlightTitleCompact,
              isDesktop && styles.spotlightTitleDesktop,
            ]}
            numberOfLines={2}
          >
            Book a session with a top-ranker mentor
          </Text>
          {!isCompactHero ? (
            <Text style={styles.heroSubheadLight} numberOfLines={2}>
              Stuck on a chapter or a doubt? Get personal guidance — or earn a free session by
              keeping a 7-day practice streak.
            </Text>
          ) : null}
          <Button
            title={isCompactHero ? 'Browse mentors' : 'Sign up to browse mentors'}
            variant="light"
            onPress={() => navigation.navigate('Signup')}
            style={[styles.spotlightButton, isCompactHero && styles.spotlightButtonCompact]}
          />
        </RevealOnMount>
      </View>
    </LinearGradient>
  );

  const isPredictorActive = activeHeroSlide === 'predictor';

  const renderPredictorSlide = () => (
    <LinearGradient
      colors={['#2B1B0E', '#6B4A1E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientSlide}
    >
      <View style={[styles.band, { maxWidth }, styles.spotlightBand, isCompactHero && styles.spotlightBandCompact]}>
        <View
          style={[
            styles.spotlightGraphic,
            isCompactHero && styles.spotlightGraphicCompact,
            isDesktop && styles.spotlightGraphicWide,
          ]}
        >
          <PulseRing
            size={isDesktop ? 200 : isCompactHero ? 56 : 168}
            color="rgba(255, 190, 100, 0.35)"
          />
          <FloatBob style={styles.blobFloatWrap} range={isCompactHero ? 3 : 7}>
            <View
              style={[
                styles.blobFront,
                isCompactHero && styles.blobFrontCompact,
                isDesktop && styles.blobFrontWide,
              ]}
            >
              <Text
                style={[
                  styles.spotlightIcon,
                  isCompactHero && styles.spotlightIconCompact,
                  isDesktop && styles.spotlightIconWide,
                ]}
              >
                📊
              </Text>
            </View>
          </FloatBob>
          {!isCompactHero ? (
            <FloatBob style={styles.spotlightBadgeWrap} range={5} duration={1500}>
              <View style={styles.spotlightBadge}>
                <Text style={styles.spotlightBadgeText}>⚡ Instant result</Text>
              </View>
            </FloatBob>
          ) : null}
        </View>
        <RevealOnMount
          key={isPredictorActive ? 'predictor-in' : 'predictor-out'}
          style={styles.spotlightText}
        >
          <Text style={[styles.statsEyebrow, isCompactHero && styles.eyebrowCompact]}>
            FREE TOOL · NO SIGN-UP
          </Text>
          <Text
            style={[
              styles.spotlightTitle,
              styles.spotlightTitleRow,
              isCompactHero && styles.spotlightTitleCompact,
              isDesktop && styles.spotlightTitleDesktop,
            ]}
            numberOfLines={2}
          >
            See your NEET rank in seconds
          </Text>
          {!isCompactHero ? (
            <Text style={styles.heroSubheadLight} numberOfLines={2}>
              Enter your expected marks and get an instant estimated All India Rank — try it right
              now, no account needed.
            </Text>
          ) : null}
          <Button
            title={isCompactHero ? 'Try it ↓' : 'Try the predictor ↓'}
            variant="light"
            onPress={() => scrollToSection('predictor')}
            style={[styles.spotlightButton, isCompactHero && styles.spotlightButtonCompact]}
          />
        </RevealOnMount>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.page}>
      <NavBar
        navigation={navigation}
        maxWidth={maxWidth}
        onNavigate={scrollToSection}
        isScrolled={isScrolled}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.pageScroll}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => setIsScrolled(event.nativeEvent.contentOffset.y > 8)}
        scrollEventThrottle={32}
      >

        <Carousel
          height={heroSlideHeight}
          aspectRatio={BANNER_NATIVE_RATIO}
          maxHeight={600}
          autoAdvanceMs={5500}
          onIndexChange={(_index, key) => setActiveHeroSlide(key)}
          slides={[
            { key: 'hero', render: renderHeroSlide },
            { key: 'ncert-pyq', render: renderNcertPyqSlide },
            { key: 'stats', height: contentSlideHeight, render: renderStatsSlide },
            { key: 'mentors', height: contentSlideHeight, render: renderMentorSlide },
            { key: 'predictor', height: contentSlideHeight, render: renderPredictorSlide },
          ]}
        />

        {stats?.recentActivity?.length ? (
          <Section maxWidth={maxWidth} style={styles.activitySection}>
            <View style={styles.activityHeader}>
              <PulsingDot />
              <Text style={styles.activityHeading}>Recent activity</Text>
            </View>
            <View style={styles.activityGrid}>
              {stats.recentActivity.map((activity, index) => (
                <View
                  key={index}
                  style={[styles.activityCardWrap, { flexBasis: `${100 / activityColumns}%` }]}
                >
                  <ActivityCard activity={activity} />
                </View>
              ))}
            </View>
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
                  <Card
                    onPress={() => navigation.navigate('PublicBookDetail', { code: book.code })}
                    style={[styles.subjectCard, { borderTopColor: book.color || colors.primary }]}
                  >
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
                      onPress={(event) => {
                        event.stopPropagation?.();
                        navigation.navigate('PublicBookDetail', { code: book.code });
                      }}
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
                  <Card
                    onPress={() => navigation.navigate('Signup')}
                    style={[styles.subjectCard, { borderTopColor: subject.color }]}
                  >
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
                      onPress={(event) => {
                        event.stopPropagation?.();
                        navigation.navigate('Signup');
                      }}
                      style={[styles.exploreButton, { borderColor: subject.color }]}
                    />
                  </Card>
                </View>
              ))}
            </View>
          )}
        </Section>

        <Section background={colors.backgroundElevated} maxWidth={maxWidth} onLayout={registerSection('features')}>
          <Text style={styles.eyebrow}>WHAT'S INSIDE</Text>
          <Text style={typography.h2}>Built around how you actually prep</Text>
          <View style={styles.grid}>
            {FEATURES.map((feature) => (
              <View
                key={feature.key}
                style={[styles.gridItem, { flexBasis: `${100 / featureColumns}%` }]}
              >
                <Card
                  onPress={() => navigation.navigate('Signup')}
                  style={[styles.featureCard, { backgroundColor: feature.tint }]}
                >
                  <View style={styles.featureIconBadge}>
                    <Text style={styles.featureIcon}>{feature.icon}</Text>
                  </View>
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
          <Text style={styles.eyebrow}>GOT QUESTIONS?</Text>
          <Text style={typography.h2}>Frequently asked</Text>
          <View style={styles.faqList}>
            {FAQS.map((item, index) => (
              <FaqItem key={item.q} index={index} question={item.q} answer={item.a} />
            ))}
          </View>
        </Section>

        <Section
          background={FOOTER_BG}
          maxWidth={maxWidth}
          onLayout={registerSection('contact')}
          style={styles.footer}
        >
          <View style={[styles.footerTop, isDesktop && styles.footerTopDesktop]}>
            <View style={styles.footerBrand}>
              <Text style={styles.footerBrandName}>aarambh</Text>
              <Text style={styles.footerBrandTagline}>
                NCERT-mapped practice for NEET, JEE &amp; Boards.
              </Text>
            </View>

            <View style={styles.footerContact}>
              <Text style={styles.footerHeading}>Get in touch</Text>
              <View style={styles.footerLinks}>
                {CONTACT_LINKS.map((contact) => (
                  <ContactLink key={contact.key} contact={contact} />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.footerDivider} />

          <Text style={styles.footerCopyright}>
            © {new Date().getFullYear()} Aarambh · Built for students, by a student.
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}

function NativeWelcome({ navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Logo size="lg" align="column" />
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
        {/* OTP sign-in is off for now — kept commented, not removed. */}
        {/* <Button
          title="Continue with phone / email OTP"
          variant="ghost"
          onPress={() => navigation.navigate('Otp')}
          style={styles.spacedButton}
        /> */}
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

const makeStyles = ({ colors, typography }) => StyleSheet.create({
  // --- web landing ---
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageScroll: {
    flex: 1,
  },
  // Rendered as a fixed sibling above the ScrollView (not inside it), so it
  // stays put as a persistent toolbar while the page scrolls underneath —
  // `isScrolled` (driven by the ScrollView's onScroll) then just decides
  // whether it has picked up a shadow yet.
  navBar: {
    zIndex: 30,
    backgroundColor: colors.background,
    ...Platform.select({
      web: { transitionProperty: 'box-shadow', transitionDuration: '200ms' },
      default: {},
    }),
  },
  navBarScrolled: {
    boxShadow: '0 6px 20px rgba(17, 17, 20, 0.08)',
  },
  navAccentLine: {
    height: 2,
    width: '100%',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
    paddingVertical: spacing.md,
  },
  navPills: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  navPill: {
    paddingVertical: spacing.xs,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  navPillText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
    color: colors.textSecondary,
    ...Platform.select({
      web: { transitionProperty: 'color', transitionDuration: '150ms' },
      default: {},
    }),
  },
  navPillTextHovered: {
    color: colors.primary,
  },
  navPillUnderline: {
    height: 2,
    marginTop: 4,
    borderRadius: 1,
    width: '100%',
    backgroundColor: colors.primary,
    opacity: 0,
    ...Platform.select({
      web: { transitionProperty: 'opacity, transform', transitionDuration: '180ms' },
      default: {},
    }),
    transform: [{ scaleX: 0 }],
  },
  navPillUnderlineHovered: {
    opacity: 1,
    transform: [{ scaleX: 1 }],
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  navThemeToggle: {
    marginRight: spacing.xs,
  },
  navSignup: {
    minWidth: 110,
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
  imageSlide: {
    flex: 1,
    overflow: 'hidden',
    // Matches the banner artwork's own black backdrop, so on any viewport
    // where the box is wider/shorter than the image (maxHeight capping the
    // carousel on a wide screen) the letterbox bars from resizeMode="contain"
    // blend in instead of showing as a visible gap.
    backgroundColor: '#000000',
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  // Fills whatever box the Carousel actually measured. resizeMode="contain"
  // (set on the Image itself) then scales the whole banner to fit inside
  // that box without ever cropping — these are marketing creatives with
  // baked-in text/logo that must stay fully visible, unlike "cover" which
  // crops to fill and was cutting off the logo and tagline on wide screens.
  imageSlideFill: {
    width: '100%',
    height: '100%',
  },
  imageSlideLoginPill: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  imageSlideLoginText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
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
  // Compact (phone) drops the padding this shares with every other Section —
  // the carousel slide is short on purpose, and the default paddingVertical
  // meant for a full page section would eat most of that height budget.
  statsBandCompact: {
    paddingVertical: spacing.md,
  },
  statsEyebrow: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  eyebrowCompact: {
    fontSize: 10,
    marginBottom: spacing.xs,
  },
  statsReveal: {
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  statsRowCompact: {
    gap: spacing.sm,
    marginTop: 0,
  },
  statTile: {
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    minWidth: 100,
  },
  statIconBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statIconBadgeCompact: {
    width: 28,
    height: 28,
    marginBottom: spacing.xs,
  },
  statIconText: {
    fontSize: 22,
  },
  statIconTextCompact: {
    fontSize: 13,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
  },
  statNumberCompact: {
    fontSize: 20,
  },
  statLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  statLabelCompact: {
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statDividerCompact: {
    height: 28,
  },
  statsFootnote: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.5)',
    marginTop: spacing.lg,
  },
  statsFootnoteCompact: {
    fontSize: 10,
    marginTop: spacing.sm,
  },
  // Mentor/predictor slides are always icon-left, text-right — even at
  // phone width — with just the sizing scaled down per tier. Stacking them
  // (icon above text) was what needed 500px+ of height on mobile and made
  // the slide take over the screen instead of reading as a banner.
  spotlightBand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotlightBandCompact: {
    paddingVertical: spacing.md,
  },
  spotlightGraphic: {
    width: 168,
    height: 168,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xl,
  },
  spotlightGraphicCompact: {
    width: 60,
    height: 60,
    marginRight: spacing.sm,
  },
  spotlightGraphicWide: {
    width: 200,
    height: 200,
    marginRight: spacing.xxl,
  },
  blobFloatWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  blobFront: {
    width: 116,
    height: 116,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blobFrontCompact: {
    width: 52,
    height: 52,
  },
  blobFrontWide: {
    width: 136,
    height: 136,
  },
  spotlightIcon: {
    fontSize: 52,
  },
  spotlightIconCompact: {
    fontSize: 22,
  },
  spotlightIconWide: {
    fontSize: 60,
  },
  spotlightBadgeWrap: {
    position: 'absolute',
    top: -4,
    right: -22,
  },
  spotlightBadge: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  spotlightBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  spotlightText: {
    flex: 1,
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
  // Mentor/predictor titles sit in the row layout's text column, left-aligned
  // against the icon — the stats slide keeps the base centered style as-is.
  spotlightTitleRow: {
    textAlign: 'left',
  },
  spotlightTitleCompact: {
    fontSize: 15,
    lineHeight: 19,
    marginTop: 0,
    marginBottom: spacing.xs,
  },
  spotlightTitleDesktop: {
    fontSize: 34,
    lineHeight: 40,
  },
  statsTitleDesktop: {
    fontSize: 34,
    lineHeight: 40,
  },
  spotlightButton: {
    marginTop: spacing.lg,
    minWidth: 220,
  },
  spotlightButtonCompact: {
    marginTop: spacing.xs,
    minWidth: 0,
    paddingHorizontal: spacing.md,
  },
  activitySection: {
    paddingVertical: spacing.lg,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  activityHeading: {
    ...typography.h3,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  activityCardWrap: {
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: spacing.sm,
    ...shadow.card,
    ...Platform.select({
      web: {
        cursor: 'default',
        transitionProperty: 'transform, box-shadow, border-color',
        transitionDuration: '150ms',
      },
      default: {},
    }),
  },
  activityCardHovered: Platform.select({
    web: { transform: [{ translateY: -3 }], borderColor: colors.primary, shadowOpacity: 0.14 },
    default: {},
  }),
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityAvatarIcon: {
    fontSize: 16,
  },
  activityBody: {
    flex: 1,
    minWidth: 0,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  activityMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  activityTime: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  sectionSubtitle: {
    marginTop: spacing.xs,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
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
    borderWidth: 0,
  },
  featureIconBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  featureIcon: {
    fontSize: 22,
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
    gap: spacing.sm,
  },
  faqItem: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    borderRadius: radius.lg,
    padding: spacing.md,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transitionProperty: 'border-color, box-shadow, transform',
        transitionDuration: '180ms',
        transitionTimingFunction: 'ease',
      },
      default: {},
    }),
  },
  faqItemActive: {
    borderColor: colors.primary,
    borderLeftColor: colors.primary,
    ...Platform.select({
      web: {
        transform: [{ translateY: -1 }],
        boxShadow: '0 10px 24px rgba(230, 57, 70, 0.12)',
      },
      default: {},
    }),
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  faqBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { transitionProperty: 'background-color', transitionDuration: '180ms' },
      default: {},
    }),
  },
  faqBadgeActive: {
    backgroundColor: colors.primary,
  },
  faqBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  faqBadgeTextActive: {
    color: colors.white,
  },
  faqQuestion: {
    flex: 1,
  },
  faqToggle: {
    fontSize: 22,
    fontWeight: '400',
    color: colors.textMuted,
    width: 24,
    textAlign: 'center',
    ...Platform.select({
      web: { transitionProperty: 'transform, color', transitionDuration: '180ms' },
      default: {},
    }),
  },
  faqToggleOpen: {
    color: colors.primary,
    transform: [{ rotate: '45deg' }],
  },
  faqAnswerWrap: {
    maxHeight: 0,
    opacity: 0,
    overflow: 'hidden',
    ...Platform.select({
      web: { transitionProperty: 'max-height, opacity, margin-top', transitionDuration: '220ms' },
      default: {},
    }),
  },
  faqAnswerWrapOpen: {
    maxHeight: 400,
    opacity: 1,
    marginTop: spacing.sm,
  },
  faqAnswer: {
    paddingLeft: 32 + spacing.sm,
  },
  footer: {
    borderTopWidth: 3,
    borderTopColor: colors.primary,
    paddingVertical: spacing.xxl,
  },
  footerTop: {
    gap: spacing.xl,
  },
  footerTopDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  footerBrand: {
    maxWidth: 320,
  },
  footerBrandName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: colors.white,
  },
  footerBrandTagline: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.55)',
  },
  footerContact: {
    minWidth: 260,
  },
  footerHeading: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  footerLinks: {
    gap: spacing.sm,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transitionProperty: 'background-color, border-color, transform',
        transitionDuration: '180ms',
        transitionTimingFunction: 'ease',
      },
      default: {},
    }),
  },
  footerLinkHovered: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(230, 57, 70, 0.35)',
    ...Platform.select({ web: { transform: [{ translateX: 2 }] }, default: {} }),
  },
  footerLinkPressed: {
    opacity: 0.6,
  },
  footerLinkBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: 'rgba(230, 57, 70, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { transitionProperty: 'background-color', transitionDuration: '180ms' },
      default: {},
    }),
  },
  footerLinkBadgeHovered: {
    backgroundColor: colors.primary,
  },
  footerLinkBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  footerLinkBadgeTextHovered: {
    color: colors.white,
  },
  footerLinkLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  footerLinkValue: {
    fontSize: 12,
    marginTop: 1,
    color: 'rgba(255,255,255,0.5)',
  },
  footerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: spacing.xl,
  },
  footerCopyright: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.4)',
  },

  // --- native (unchanged) ---
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
