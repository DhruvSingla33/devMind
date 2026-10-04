import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Linking,
  Modal,
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
import { hexToRgba } from '../../utils/color';

// The hero banners carry a handwritten-script accent line ("Learn from the
// Best" etc.). RN has no bundled cursive face, so on web we pull one Google
// font (Caveat) in once; native falls back to the platform cursive/system
// face via the fontFamily list on `scriptText`.
const SCRIPT_FONT_FAMILY = Platform.select({
  web: "'Caveat', 'Segoe Script', cursive",
  default: 'cursive',
});

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const FONT_LINK_ID = 'aarambh-script-font';
  if (!document.getElementById(FONT_LINK_ID)) {
    const link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap';
    document.head.appendChild(link);
  }
}

// The handwritten accent that floats on the right of each hero banner — a
// short script line plus a little curved arrow pointing back toward the CTA,
// mirroring the "Learn from the Best" flourish in the design. Purely
// decorative, so it never intercepts taps and is dropped on compact phones
// where there is no room for it beside the banner copy.
function ScriptAccent({ text, visible }) {
  const styles = useThemedStyles(makeStyles);
  if (!visible) return null;
  return (
    <View style={styles.scriptAccent} pointerEvents="none">
      <Text style={styles.scriptText}>{text}</Text>
      <Text style={styles.scriptArrow}>↙</Text>
    </View>
  );
}

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
// Each feature is a full-width "spotlight" card: an eyebrow + optional badge,
// a headline, body and CTA on the left, and a themed in-product mini-mockup on
// the right (see FeatureWidget). `accent` drives the card's glow, border, badge
// and widget colour so each one reads as its own coloured panel.
// `span: 'full'` cards take a whole row and show their mini-mockup; `'half'`
// cards pair up two-per-row as compact tiles. Order is chosen so the mobile
// layout reads full → 2 tiles → full → 2 tiles → full → tile.
const FEATURES = [
  {
    key: 'mocks',
    icon: '📝',
    span: 'full',
    eyebrow: 'NEET CBT SIMULATOR',
    badge: 'CBT MOCK TEST',
    title: 'Mix Quiz & full CBT mock tests',
    body: 'Build a custom quiz from high-probability questions, or sit a full CBT-style mock with a real exam timer, question palette and mark-for-review.',
    cta: 'Start a mock test',
    accent: '#6C7BF5',
    widget: 'cbt',
  },
  {
    key: 'chapters',
    icon: '📚',
    span: 'half',
    eyebrow: 'NCERT CHAPTER PRACTICE',
    title: 'Practice by NCERT chapter',
    body: 'Open any chapter and practice the exact high-probability questions mapped to it — no hunting through unrelated content.',
    cta: 'Browse chapters',
    accent: '#E0922A',
    widget: 'notes',
  },
  {
    key: 'doubts',
    icon: '💬',
    span: 'half',
    eyebrow: 'DOUBT SOLVING',
    title: 'Ask a doubt, get a written answer',
    body: 'Stuck on a question? Ask a mentor directly and get a clear written solution back on the exact doubt.',
    cta: 'See how it works',
    accent: '#9B5FE0',
    widget: 'chat',
  },
  {
    key: 'mentors',
    icon: '🎓',
    span: 'full',
    eyebrow: '1:1 MENTORSHIP',
    title: 'Book a session with a top ranker',
    body: 'Get personalised guidance from students who cracked the exam — or earn a free 30-min session by practicing 20 MCQs a day for 7 days.',
    cta: 'Browse mentors',
    accent: '#2EA86A',
    widget: 'session',
  },
  {
    key: 'bookmarks',
    icon: '🔖',
    span: 'half',
    eyebrow: 'REVISION',
    title: 'Bookmark anything for revision',
    body: 'Save any question or note while practicing and pull your whole revision list back up before exam day.',
    cta: 'See revision',
    accent: '#D98A2B',
    widget: 'saved',
  },
  {
    key: 'predictor',
    icon: '📊',
    span: 'half',
    eyebrow: 'FREE NEET TOOLS',
    title: 'Predict your rank & college — instantly',
    body: 'Turn your marks into an estimated All India Rank, then see the colleges you’re in range for. No account needed.',
    cta: 'Check your rank',
    accent: '#E07B2B',
    widget: 'rank',
  },
  {
    key: 'pulse',
    icon: '⚡',
    span: 'full',
    eyebrow: 'DAILY AARAMBH PULSE',
    title: 'A 5-minute daily memory workout',
    body: 'Keep formulas and key terms fresh with a quick daily streak — small reps that add up over months.',
    cta: 'Start today’s pulse',
    accent: '#E6485D',
    widget: 'pulse',
  },
];

// Group features into mobile rows: each `full` is its own row; consecutive
// `half` cards pair two-per-row.
function featureRows(items) {
  const rows = [];
  let i = 0;
  while (i < items.length) {
    if (items[i].span === 'full') {
      rows.push([items[i]]);
      i += 1;
    } else {
      const pair = [items[i]];
      if (items[i + 1] && items[i + 1].span === 'half') pair.push(items[i + 1]);
      rows.push(pair);
      i += pair.length;
    }
  }
  return rows;
}

const STEPS = [
  { key: '1', title: 'Pick a chapter', body: 'Choose your subject, class and chapter.' },
  { key: '2', title: 'Practice what’s asked', body: 'Work through questions mapped to that exact chapter.' },
  { key: '3', title: 'Take a mock test', body: 'Run a Mix Quiz or a full CBT-style mock under a timer.' },
  { key: '4', title: 'Track & get help', body: 'Review your attempts and book a mentor for doubts.' },
];

// A tiny, static "bar" used throughout the feature mockups to stand in for a
// line of text/content without real copy.
function Bar({ w = '100%', c, h = 6 }) {
  return <View style={{ width: w, height: h, borderRadius: h / 2, backgroundColor: c }} />;
}

// The decorative in-product mini-mockup shown on the right of each feature
// card. Pure chrome (no real data, non-interactive) — it just makes each
// feature feel like a real screen from the app, themed by its accent colour.
function FeatureWidget({ type, accent, mini }) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const faint = colors.border;
  const panel = [s.fwPanel, mini && s.fwPanelMini, { borderColor: hexToRgba(accent, 0.3) }];
  const chip = (label, color) => (
    <View
      style={[
        s.fwChip,
        mini && s.fwChipMini,
        { borderColor: hexToRgba(color, 0.5), backgroundColor: hexToRgba(color, 0.12) },
      ]}
    >
      <Text style={[s.fwChipText, mini && s.fwChipTextMini, { color }]}>{label}</Text>
    </View>
  );

  if (type === 'cbt') {
    const palette = [
      { n: 1, c: '#2EA86A' },
      { n: 2, c: '#2EA86A' },
      { n: 3, c: accent, fill: true },
      { n: 4, c: faint },
      { n: 5, c: '#E6485D' },
      { n: 6, c: faint },
    ];
    return (
      <View style={panel}>
        <View style={[s.fwBar, { borderColor: hexToRgba(accent, 0.4) }]}>
          <Text style={[s.fwMono, mini && s.fwMonoMini, { color: accent }]}>CBT</Text>
          <Text style={[s.fwMono, mini && s.fwMonoMini, { color: colors.textPrimary }]}>00:45:00</Text>
        </View>
        <View style={mini ? s.fwRowWrap : s.fwStack}>
          {chip('Class 11 Physics · Ch 5', '#E6485D')}
          {chip('Class 12 Chem · Ch 2', '#2EA86A')}
          {chip('Class 11 Bio · Ch 7', accent)}
        </View>
        <View style={s.fwDivider} />
        <Text style={s.fwMiniLabel}>QUESTION PALETTE</Text>
        <View style={s.fwPaletteRow}>
          {palette.map((p) => (
            <View
              key={p.n}
              style={[
                s.fwCell,
                mini && s.fwCellMini,
                {
                  borderColor: hexToRgba(p.c, 0.6),
                  backgroundColor: p.fill ? p.c : hexToRgba(p.c, 0.1),
                },
              ]}
            >
              <Text style={[s.fwCellTxt, mini && s.fwCellTxtMini, { color: p.fill ? '#fff' : p.c }]}>
                {p.n}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (type === 'session') {
    return (
      <View style={panel}>
        <View style={s.fwRow}>
          <View style={[s.fwAvatar, mini && s.fwAvatarMini, { backgroundColor: hexToRgba(accent, 0.9) }]} />
          <View style={{ flex: 1, gap: 6 }}>
            <Bar w="70%" c={faint} />
            <Bar w="45%" c={faint} />
          </View>
        </View>
        <Text style={[s.fwMiniLabel, { marginTop: mini ? spacing.sm : spacing.md }]}>30-MIN SESSION</Text>
        <View style={s.fwStack}>
          <View style={s.fwRowWrap}>
            {chip('Today 6 PM', accent)}
            {chip('Tomorrow 8 AM', accent)}
          </View>
        </View>
      </View>
    );
  }

  if (type === 'notes') {
    return (
      <View style={panel}>
        <View style={[s.fwNote, { borderColor: hexToRgba(accent, 0.35) }]}>
          <View style={[s.fwTag, { backgroundColor: hexToRgba(accent, 0.15) }]}>
            <Text style={[s.fwTagTxt, { color: accent }]}>Bio 11 · Ch 3</Text>
          </View>
          <Text style={s.fwNoteTitle}>Cell wall</Text>
          <View style={{ gap: 6, marginTop: 6 }}>
            <Bar c={faint} />
            <Bar w="85%" c={faint} />
            <Bar w="60%" c={faint} />
          </View>
        </View>
      </View>
    );
  }

  if (type === 'chat') {
    return (
      <View style={panel}>
        <View style={[s.fwBubble, s.fwBubbleIn]}>
          <Bar w="80%" c={faint} />
          <Bar w="55%" c={faint} />
        </View>
        <View style={[s.fwBubble, s.fwBubbleOut, { backgroundColor: hexToRgba(accent, 0.18), borderColor: hexToRgba(accent, 0.4) }]}>
          <Bar w="70%" c={hexToRgba(accent, 0.7)} />
          <Bar w="90%" c={hexToRgba(accent, 0.7)} />
          <Bar w="40%" c={hexToRgba(accent, 0.7)} />
        </View>
      </View>
    );
  }

  if (type === 'saved') {
    const rows = [false, true, false];
    return (
      <View style={panel}>
        {rows.map((active, i) => (
          <View
            key={i}
            style={[
              s.fwSavedRow,
              active && { borderColor: hexToRgba(accent, 0.45), backgroundColor: hexToRgba(accent, 0.1) },
            ]}
          >
            <Text style={{ fontSize: 14, color: active ? accent : colors.textMuted }}>
              {active ? '🔖' : '☆'}
            </Text>
            <View style={{ flex: 1, gap: 5 }}>
              <Bar w={active ? '70%' : '85%'} c={active ? hexToRgba(accent, 0.6) : faint} />
              <Bar w="40%" c={faint} h={5} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (type === 'batch') {
    const days = ['Mon', 'Wed', 'Fri'];
    return (
      <View style={panel}>
        <View style={s.fwRow}>
          <Text style={[s.fwNoteTitle, { marginBottom: 0 }]}>NEET 2027 Batch</Text>
        </View>
        <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
          {days.map((d, i) => (
            <View key={d} style={s.fwRow}>
              <View style={[s.fwDayChip, { backgroundColor: hexToRgba(accent, 0.15) }]}>
                <Text style={[s.fwTagTxt, { color: accent }]}>{d}</Text>
              </View>
              <View style={{ flex: 1, gap: 5 }}>
                <Bar w={`${80 - i * 12}%`} c={faint} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (type === 'rank') {
    const steps = [
      { k: 'Marks', v: '620 / 720' },
      { k: 'Est. AIR', v: '~ 8,500' },
      { k: 'Colleges', v: '12 in range' },
    ];
    return (
      <View style={panel}>
        {steps.map((st, i) => (
          <View key={st.k}>
            <View style={s.fwRankRow}>
              <Text style={s.fwRankKey}>{st.k}</Text>
              <Text style={[s.fwRankVal, i === 1 && { color: accent, fontSize: 16 }]}>{st.v}</Text>
            </View>
            {i < steps.length - 1 ? <Text style={[s.fwArrow, { color: hexToRgba(accent, 0.7) }]}>↓</Text> : null}
          </View>
        ))}
      </View>
    );
  }

  if (type === 'pulse') {
    const days = [1, 1, 1, 1, 0, 0, 0];
    return (
      <View style={panel}>
        <View style={s.fwRow}>
          <Text style={{ fontSize: 18 }}>🔥</Text>
          <Text style={[s.fwNoteTitle, { marginBottom: 0 }]}>4-day streak</Text>
        </View>
        <View style={[s.fwPaletteRow, { marginTop: mini ? spacing.sm : spacing.md }]}>
          {days.map((on, i) => (
            <View
              key={i}
              style={[
                s.fwDot,
                mini && s.fwDotMini,
                on
                  ? { backgroundColor: accent, borderColor: accent }
                  : { borderColor: faint },
              ]}
            />
          ))}
        </View>
        <Text style={[s.fwMiniLabel, { marginTop: spacing.sm }]}>KEEP IT GOING</Text>
      </View>
    );
  }

  return null;
}

// One full-width feature "spotlight": text column + themed mini-mockup, over a
// faint accent-tinted panel with a matching border and CTA.
function FeatureCard({ feature, onPress, isMobile }) {
  const s = useThemedStyles(makeStyles);
  const { accent } = feature;
  const [hovered, setHovered] = useState(false);

  // Mobile, full-width card: eyebrow/badge + title + body + CTA, with the
  // themed mini-mockup below (full width, where it has room to render).
  if (isMobile && feature.span === 'full') {
    return (
      <Pressable
        onPress={onPress}
        style={[s.spotMFull, { borderColor: hexToRgba(accent, 0.3), backgroundColor: hexToRgba(accent, 0.07) }]}
      >
        <View style={s.spotEyebrowRow}>
          <Text style={[s.spotEyebrow, { color: accent }]} numberOfLines={1}>
            {feature.eyebrow}
          </Text>
          {feature.badge ? (
            <View style={[s.spotBadge, { borderColor: hexToRgba(accent, 0.5) }]}>
              <Text style={[s.spotBadgeTxt, { color: accent }]}>{feature.badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={s.spotMFullTitle}>{feature.title}</Text>
        <Text style={s.spotMFullBody} numberOfLines={2}>
          {feature.body}
        </Text>
        <View style={s.spotMFullWidget}>
          <FeatureWidget type={feature.widget} accent={accent} mini />
        </View>
        <Text style={[s.spotMCta, { color: accent, marginTop: spacing.sm }]}>{feature.cta}  →</Text>
      </Pressable>
    );
  }

  // Mobile, half card: a small 2-up tile (icon + eyebrow + title + CTA).
  if (isMobile) {
    return (
      <Pressable
        onPress={onPress}
        style={[s.spotM, { borderColor: hexToRgba(accent, 0.3), backgroundColor: hexToRgba(accent, 0.07) }]}
      >
        <View style={[s.spotMIcon, { backgroundColor: hexToRgba(accent, 0.15) }]}>
          <Text style={s.spotMIconTxt}>{feature.icon}</Text>
        </View>
        <Text style={[s.spotEyebrow, s.spotMEyebrow, { color: accent }]} numberOfLines={1}>
          {feature.eyebrow}
        </Text>
        <Text style={s.spotMTitle}>{feature.title}</Text>
        <Text style={[s.spotMCta, { color: accent }]}>{feature.cta}  →</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        s.spot,
        {
          borderColor: hexToRgba(accent, hovered ? 0.6 : 0.3),
          backgroundColor: hexToRgba(accent, 0.06),
        },
      ]}
    >
      <View style={s.spotText}>
        <View style={s.spotEyebrowRow}>
          <Text style={[s.spotEyebrow, { color: accent }]}>{feature.eyebrow}</Text>
          {feature.badge ? (
            <View style={[s.spotBadge, { borderColor: hexToRgba(accent, 0.5) }]}>
              <Text style={[s.spotBadgeTxt, { color: accent }]}>{feature.badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={s.spotTitle}>{feature.title}</Text>
        <Text style={s.spotBody}>{feature.body}</Text>
        <Text style={[s.spotCta, { color: accent }]}>{feature.cta}  →</Text>
      </View>
      <View style={s.spotWidget}>
        <FeatureWidget type={feature.widget} accent={accent} />
      </View>
    </Pressable>
  );
}

// A single subject/book card in the horizontal "Every NCERT chapter" rail.
// Themed to match the site: a faint accent-tinted panel with an accent border,
// a rounded icon tile, and an accent "Explore" button.
function SubjectCard({ item, width, onPress }) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const color = item.color || colors.primary;
  return (
    <Card
      onPress={onPress}
      style={[
        s.subjCard,
        { width, borderColor: hexToRgba(color, 0.3), backgroundColor: hexToRgba(color, 0.06) },
      ]}
    >
      <View style={[s.subjIcon, { backgroundColor: hexToRgba(color, 0.15) }]}>
        <Text style={s.subjIconTxt}>{item.icon || '📚'}</Text>
      </View>
      <Text style={s.subjTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={s.subjMeta}>Class {item.classLevel}</Text>
      <Text style={[s.subjTag, { color }]} numberOfLines={1}>
        {item.tag}
      </Text>
      <Button
        title="Explore →"
        variant="outline"
        size="sm"
        textColor={color}
        onPress={(event) => {
          event.stopPropagation?.();
          onPress();
        }}
        style={[s.subjBtn, { borderColor: hexToRgba(color, 0.6) }]}
      />
    </Card>
  );
}

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

// Left slide-in drawer for the pre-login nav on narrow screens — mirrors the
// post-login MobileDrawer (scrim + full-height left panel that slides in from
// off-screen-left), instead of a dropdown sheet that pushed the page down.
const NAV_DRAWER_W = Math.min(300, Math.round(Dimensions.get('window').width * 0.82));

function NavDrawer({ visible, onClose, onNavigate }) {
  const styles = useThemedStyles(makeStyles);
  const slide = useRef(new Animated.Value(-NAV_DRAWER_W)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const nativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: nativeDriver }),
        Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: nativeDriver }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(slide, { toValue: -NAV_DRAWER_W, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: nativeDriver }),
        Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: nativeDriver }),
      ]).start(({ finished }) => finished && setMounted(false));
    }
  }, [visible, mounted, slide, fade, nativeDriver]);

  if (!mounted) return null;

  const go = (key) => {
    onClose();
    onNavigate(key);
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.navDrawerRoot}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.navDrawerScrim, { opacity: fade }]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close menu" />
        </Animated.View>
        <Animated.View
          style={[styles.navDrawerPanel, { width: NAV_DRAWER_W, transform: [{ translateX: slide }] }]}
        >
          <View style={styles.navDrawerHeader}>
            <Logo size="sm" />
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={styles.navDrawerClose}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
            >
              <Text style={styles.navMenuIcon}>✕</Text>
            </Pressable>
          </View>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.navDrawerList}
            showsVerticalScrollIndicator={false}
          >
            {NAV_LINKS.map((link) => (
              <Pressable key={link.key} onPress={() => go(link.key)} style={styles.navDrawerLink}>
                <Text style={styles.navDrawerLinkText}>{link.label}</Text>
                <Text style={styles.navDrawerChevron}>›</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function NavBar({ navigation, maxWidth, onNavigate, isScrolled }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { isTablet } = useBreakpoint();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the sheet whenever we grow back to the tablet/desktop nav, so it
  // can't be left stuck open behind the inline pills after a rotate/resize.
  useEffect(() => {
    if (isTablet) setMenuOpen(false);
  }, [isTablet]);

  return (
    <View style={[styles.navBar, isScrolled && styles.navBarScrolled]}>
      <RevealOnMount style={[styles.band, styles.navBand, { maxWidth }, styles.navRow]}>
        <Logo size="sm" />

        {isTablet ? (
          <View style={styles.navPills}>
            {NAV_LINKS.map((link) => (
              <NavPill key={link.key} label={link.label} onPress={() => onNavigate(link.key)} />
            ))}
          </View>
        ) : null}

        {isTablet ? (
          <View style={styles.navActions}>
            <ThemeToggle style={styles.navThemeToggle} />
            <Button title="Log in" variant="ghost" onPress={() => navigation.navigate('Login')} />
            <Button
              title="Sign up"
              onPress={() => navigation.navigate('Signup')}
              style={styles.navSignup}
            />
          </View>
        ) : (
          <View style={styles.navActionsMobile}>
            <ThemeToggle style={styles.navThemeToggleMobile} />
            <Button
              title="Log in"
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('Login')}
            />
            <Button
              title="Sign up"
              size="sm"
              onPress={() => navigation.navigate('Signup')}
            />
            <Pressable
              onPress={() => setMenuOpen(true)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Open menu"
              style={styles.navMenuButtonSm}
            >
              <Text style={styles.navMenuIconSm}>☰</Text>
            </Pressable>
          </View>
        )}
      </RevealOnMount>

      {!isTablet ? (
        <NavDrawer
          visible={menuOpen}
          onClose={() => setMenuOpen(false)}
          onNavigate={onNavigate}
        />
      ) : null}

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
  if (accuracy >= 75) return { bg: '#E4F5EC', color: '#18875A', icon: '🎯' };
  if (accuracy >= 50) return { bg: '#FBF0E3', color: '#B4700D', icon: '📘' };
  return { bg: '#FBE7EA', color: '#E63946', icon: '✍️' };
}

function ActivityCard({ activity, compact }) {
  const styles = useThemedStyles(makeStyles);
  const [isHovered, setIsHovered] = useState(false);
  const tint = activityTint(activity.accuracy);

  // Compact (mobile) renders a stacked tile so two fit per row without the
  // long title crowding the time — avatar + time on top, then title, then the
  // score chip + exam. The wide layout keeps the single-row list.
  if (compact) {
    return (
      <Pressable
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={[
          styles.activityCard,
          styles.activityCardCompact,
          { borderLeftColor: tint.color },
          isHovered && styles.activityCardHovered,
        ]}
      >
        <View style={styles.activityCompactTop}>
          <View
            style={[styles.activityAvatar, styles.activityAvatarCompact, { backgroundColor: tint.bg }]}
          >
            <Text style={styles.activityAvatarIconCompact}>{tint.icon}</Text>
          </View>
          <Text style={styles.activityTimeCompact} numberOfLines={1}>
            {timeAgo(activity.completedAt)}
          </Text>
        </View>
        <Text style={styles.activityTitleCompact} numberOfLines={2}>
          {activity.title}
        </Text>
        <View style={styles.activityMetaRowCompact}>
          <View style={[styles.activityScoreChip, { backgroundColor: tint.bg }]}>
            <Text style={[styles.activityScoreText, { color: tint.color }]}>
              {activity.accuracy}%
            </Text>
          </View>
          <Text style={styles.activityMetaCompact} numberOfLines={1}>
            {activity.exam}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.activityCard,
        { borderLeftColor: tint.color },
        isHovered && styles.activityCardHovered,
      ]}
    >
      <View style={[styles.activityAvatar, { backgroundColor: tint.bg }]}>
        <Text style={styles.activityAvatarIcon}>{tint.icon}</Text>
      </View>
      <View style={styles.activityBody}>
        <Text style={styles.activityTitle} numberOfLines={1}>
          {activity.title}
        </Text>
        <View style={styles.activityMetaRow}>
          <View style={[styles.activityScoreChip, { backgroundColor: tint.bg }]}>
            <Text style={[styles.activityScoreText, { color: tint.color }]}>
              {activity.accuracy}%
            </Text>
          </View>
          <Text style={styles.activityMeta} numberOfLines={1}>
            {activity.exam}
          </Text>
        </View>
      </View>
      <Text style={styles.activityTime} numberOfLines={1}>
        {timeAgo(activity.completedAt)}
      </Text>
    </Pressable>
  );
}

// Mobile: an auto-scrolling "live ticker" of recent-activity tiles instead of
// a tall grid — a couple of tiles are visible at a time and the strip glides
// left continuously (two identical copies make the loop seamless), so the
// section stays short and reads as a moving banner.
function ActivityMarquee({ activities, compact }) {
  const styles = useThemedStyles(makeStyles);
  const translateX = useRef(new Animated.Value(0)).current;
  const [setWidth, setSetWidth] = useState(0);

  useEffect(() => {
    if (!setWidth) return undefined;
    translateX.setValue(0);
    const anim = Animated.loop(
      Animated.timing(translateX, {
        toValue: -setWidth,
        // ~45px/sec — slow enough to read, steady like a news ticker.
        duration: (setWidth / 45) * 1000,
        easing: Easing.linear,
        // Web has no native animation driver — translateX animates fine on the
        // JS driver there; keep the native driver for iOS/Android.
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    anim.start();
    return () => anim.stop();
  }, [setWidth, translateX]);

  const renderSet = (prefix, measure) => (
    <View
      style={styles.marqueeSet}
      onLayout={measure ? (e) => setSetWidth(e.nativeEvent.layout.width) : undefined}
    >
      {activities.map((activity, i) => (
        <View
          key={`${prefix}-${i}`}
          style={[styles.marqueeItem, compact ? styles.marqueeItemCompact : styles.marqueeItemWide]}
        >
          <ActivityCard activity={activity} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.marqueeViewport} pointerEvents="none">
      <Animated.View style={[styles.marqueeTrack, { transform: [{ translateX }] }]}>
        {renderSet('a', true)}
        {renderSet('b', false)}
      </Animated.View>
    </View>
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
  const { isTablet } = useBreakpoint();
  return (
    <View style={[styles.section, background && { backgroundColor: background }]} onLayout={onLayout}>
      <View style={[styles.band, !isTablet && styles.bandCompact, { maxWidth }, style]}>
        {children}
      </View>
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
  const isMobile = !isTablet;
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
                  { backgroundColor: 'rgba(230, 120, 170, 0.20)' },
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
      <ScriptAccent text={'growing\nevery day'} visible={!isCompactHero} />
    </LinearGradient>
  );

  const isMentorsActive = activeHeroSlide === 'mentors';

  const renderMentorSlide = () => (
    <LinearGradient
      colors={['#2C0E24', '#6A1E47']}
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
            color="rgba(255, 150, 205, 0.32)"
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
      <ScriptAccent text={'Learn from\nthe Best'} visible={!isCompactHero} />
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
      <ScriptAccent text={'Know your\nrank'} visible={!isCompactHero} />
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
              <View style={styles.activityDot}>
                <PulsingDot />
              </View>
              <View>
                <Text style={styles.activityHeading}>Recent activity</Text>
                <Text style={styles.activitySubhead}>
                  Students practising across Aarambh, right now.
                </Text>
              </View>
            </View>
            <ActivityMarquee activities={stats.recentActivity} compact={isMobile} />
          </Section>
        ) : null}

        <Section maxWidth={maxWidth} onLayout={registerSection('subjects')}>
          <Text style={[typography.h2, isMobile && styles.h2Mobile]}>Every NCERT chapter, mapped to your exam</Text>
          <Text style={[typography.bodyMuted, styles.sectionSubtitle]}>
            Open any book, read a chapter and try the questions — no account needed.
          </Text>
          {(() => {
            const useBooks = textbooksStatus === 'ready' && textbooks.length > 0;
            const items = useBooks
              ? textbooks.map((b) => ({
                  key: b._id,
                  icon: b.icon,
                  title: b.title,
                  classLevel: b.classLevel,
                  tag: b.examTags?.join(' · '),
                  color: b.color,
                  code: b.code,
                }))
              : SUBJECTS.map((sub) => ({
                  key: sub.key,
                  icon: sub.icon,
                  title: sub.title,
                  classLevel: sub.classLevel,
                  tag: sub.tag,
                  color: sub.color,
                }));
            return (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.subjScroll}
              >
                {items.map((item) => (
                  <SubjectCard
                    key={item.key}
                    item={item}
                    width={isMobile ? 160 : 200}
                    onPress={() =>
                      item.code
                        ? navigation.navigate('PublicBookDetail', { code: item.code })
                        : navigation.navigate('Signup')
                    }
                  />
                ))}
              </ScrollView>
            );
          })()}
        </Section>

        <Section background={colors.backgroundElevated} maxWidth={maxWidth} onLayout={registerSection('features')}>
          <Text style={styles.eyebrow}>WHAT'S INSIDE</Text>
          <Text style={[typography.h2, isMobile && styles.h2Mobile]}>Built around how you actually prep</Text>
          {isMobile ? (
            <View style={styles.spotMobileList}>
              {featureRows(FEATURES).map((row) =>
                row.length === 1 && row[0].span === 'full' ? (
                  <FeatureCard
                    key={row[0].key}
                    feature={row[0]}
                    isMobile
                    onPress={() => navigation.navigate('Signup')}
                  />
                ) : (
                  <View key={row.map((f) => f.key).join('-')} style={styles.spotGridRow}>
                    {row.map((feature) => (
                      <View key={feature.key} style={styles.spotGridItem}>
                        <FeatureCard
                          feature={feature}
                          isMobile
                          onPress={() => navigation.navigate('Signup')}
                        />
                      </View>
                    ))}
                  </View>
                )
              )}
            </View>
          ) : (
            <View style={styles.spotList}>
              {FEATURES.map((feature) => (
                <FeatureCard
                  key={feature.key}
                  feature={feature}
                  isMobile={false}
                  onPress={() => navigation.navigate('Signup')}
                />
              ))}
            </View>
          )}
        </Section>

        <Section maxWidth={maxWidth} onLayout={registerSection('predictor')} style={styles.widgetSection}>
          <RankPredictorWidget />
        </Section>

        <Section background={colors.backgroundElevated} maxWidth={maxWidth}>
          <Text style={[typography.h2, isMobile && styles.h2Mobile]}>How it works</Text>
          <View style={styles.grid}>
            {STEPS.map((step, index) => (
              <View key={step.key} style={[styles.gridItem, { flexBasis: `${100 / (isDesktop ? 4 : 2)}%` }]}>
                <View style={[styles.stepCard, isMobile && styles.stepCardCompact]}>
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
          <Text style={[typography.h2, isMobile && styles.h2Mobile]}>Frequently asked</Text>
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
  navActionsMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    flexShrink: 1,
  },
  // Scaled down for the dense mobile bar; negative margins pull neighbours in
  // so the toggle's layout footprint shrinks with its visual size.
  navThemeToggleMobile: {
    transform: [{ scale: 0.78 }],
    marginHorizontal: -6,
  },
  navMenuButtonSm: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  navMenuIconSm: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  navThemeToggle: {
    marginRight: spacing.xs,
  },
  navSignup: {
    minWidth: 110,
  },
  navBand: {
    paddingHorizontal: spacing.md,
  },
  navMenuButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  navMenuIcon: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  navDrawerRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  navDrawerScrim: {
    backgroundColor: 'rgba(8,8,12,0.5)',
  },
  navDrawerPanel: {
    backgroundColor: colors.backgroundElevated,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: Platform.OS === 'web' ? spacing.lg : spacing.xl,
    paddingBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 4, height: 0 },
    elevation: 16,
  },
  navDrawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  navDrawerClose: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  navDrawerList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  navDrawerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  navDrawerLinkText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  navDrawerChevron: {
    fontSize: 20,
    color: colors.textMuted,
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
  // Mobile: far less vertical/horizontal breathing room so sections don't each
  // take a whole screen — the page reads as a tight mobile feed, not a web
  // page zoomed out.
  bandCompact: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  h2Mobile: {
    fontSize: 20,
    lineHeight: 26,
  },
  gradientSlide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Handwritten accent floating over the top-right of a hero banner.
  scriptAccent: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.xl,
    alignItems: 'flex-end',
    transform: [{ rotate: '-7deg' }],
  },
  scriptText: {
    fontFamily: SCRIPT_FONT_FAMILY,
    fontSize: 34,
    lineHeight: 34,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'right',
  },
  scriptArrow: {
    marginTop: spacing.xs,
    marginRight: spacing.lg,
    fontSize: 24,
    color: 'rgba(255,255,255,0.7)',
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
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  activityHeading: {
    ...typography.h3,
  },
  activitySubhead: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
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
  activityDot: {
    marginTop: 7,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
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
  // Mobile marquee — a short, clipped strip of auto-scrolling tiles.
  marqueeViewport: {
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  marqueeTrack: {
    flexDirection: 'row',
  },
  marqueeSet: {
    flexDirection: 'row',
  },
  marqueeItem: {
    marginRight: spacing.sm,
  },
  // Both use the short horizontal card — same look everywhere. Mobile is just
  // a touch narrower so roughly two fit on screen as it scrolls.
  marqueeItemCompact: {
    width: 260,
  },
  marqueeItemWide: {
    width: 300,
  },
  // Mobile tile: small stacked column, shared height floor so the 2-up grid
  // aligns. Kept deliberately compact so two tiles read as neat chips.
  activityCardCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 4,
    padding: spacing.xs,
    borderRadius: radius.md,
    minHeight: 96,
  },
  activityCompactTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityAvatarCompact: {
    width: 26,
    height: 26,
  },
  activityAvatarIconCompact: {
    fontSize: 12,
  },
  activityTimeCompact: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    flexShrink: 0,
    marginLeft: spacing.xs,
  },
  activityTitleCompact: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  activityMetaRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 'auto',
  },
  activityMetaCompact: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    flexShrink: 1,
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
    flexShrink: 0,
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
  activityMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },
  activityScoreChip: {
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  activityScoreText: {
    fontSize: 11,
    fontWeight: '800',
  },
  activityMeta: {
    ...typography.caption,
    color: colors.textMuted,
    flexShrink: 1,
  },
  activityTime: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    flexShrink: 0,
    marginLeft: spacing.xs,
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
  // Mobile: smaller, tighter cards with a shared height floor so the 2-up
  // grid reads as a clean, aligned set instead of ragged stacked boxes.
  subjectCardCompact: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    minHeight: 180,
  },
  subjectIconCompact: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  subjectTitleCompact: {
    fontSize: 15,
    lineHeight: 19,
  },
  subjectIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  subjectTitle: {
    textAlign: 'center',
  },
  subjectMeta: {
    marginTop: spacing.xs,
  },
  subjectTag: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    color: colors.primary,
  },
  exploreButton: {
    borderRadius: radius.pill,
    // `auto` pins the button to the bottom of the (stretched) card, so the
    // CTAs line up across cards whose titles wrap to different heights.
    marginTop: 'auto',
    width: '100%',
  },

  // ---- Horizontal subject rail ----
  subjScroll: {
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingBottom: spacing.sm,
    paddingRight: spacing.md,
  },
  subjCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'flex-start',
    minHeight: 200,
  },
  subjIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  subjIconTxt: {
    fontSize: 22,
  },
  subjTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subjMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  subjTag: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: spacing.md,
  },
  subjBtn: {
    borderRadius: radius.pill,
    width: '100%',
    marginTop: 'auto',
  },
  featureRows: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
  },
  featureCell: {
    flex: 1,
    minWidth: 0,
    // Shared minimum height so every card is the same size across all rows,
    // regardless of how much text it has.
    minHeight: 230,
  },
  featureCellCompact: {
    minHeight: 160,
  },
  featureCard: {
    flex: 1,
    borderWidth: 0,
  },
  featureCardCompact: {
    padding: spacing.sm,
    borderRadius: radius.md,
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
  featureIconBadgeCompact: {
    width: 34,
    height: 34,
    marginBottom: spacing.xs,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureIconCompact: {
    fontSize: 15,
  },
  featureTitleCompact: {
    fontSize: 14,
    lineHeight: 18,
  },
  featureBodyCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
  // These tiles use fixed light pastel backgrounds in both themes, so their
  // text must stay dark (the theme's text color would go near-white in dark
  // mode and vanish on the pastel).
  featureTitle: {
    color: '#17171A',
  },
  featureBody: {
    marginTop: spacing.xs,
  },
  featureBodyOnTint: {
    color: '#45454E',
  },

  // ---- Feature spotlight cards (text + themed mini-mockup) ----
  spotList: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  // Mobile: mixed layout — full-width cards interleaved with 2-up tile rows.
  spotMobileList: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  spotGridRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  spotGridItem: {
    flexBasis: '48%',
    flexGrow: 0,
    minWidth: 0,
  },
  spotM: {
    flex: 1,
    minHeight: 168,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'flex-start',
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  spotMFull: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  spotMFullTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  spotMFullBody: {
    ...typography.bodyMuted,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  spotMFullWidget: {
    marginTop: spacing.md,
  },
  spotMIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  spotMIconTxt: {
    fontSize: 17,
  },
  spotMEyebrow: {
    fontSize: 9,
    marginBottom: 2,
  },
  spotMTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  spotMCta: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 'auto',
    paddingTop: spacing.sm,
  },
  spot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transitionProperty: 'border-color, transform',
        transitionDuration: '160ms',
      },
      default: {},
    }),
  },
  spotMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  spotText: {
    flex: 1,
    minWidth: 0,
  },
  spotEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  spotEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  spotBadge: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  spotBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  spotTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  spotTitleMobile: {
    fontSize: 19,
    lineHeight: 24,
  },
  spotBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    maxWidth: 560,
  },
  spotCta: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: spacing.md,
  },
  spotWidget: {
    width: 320,
    flexShrink: 0,
  },
  spotWidgetMobile: {
    width: '100%',
    marginTop: spacing.xs,
  },

  // ---- Mini-mockup (FeatureWidget) chrome ----
  fwPanel: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  fwPanelMini: {
    padding: spacing.sm,
    gap: spacing.xs,
  },
  fwMonoMini: {
    fontSize: 11,
  },
  fwChipMini: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  fwChipTextMini: {
    fontSize: 10,
  },
  fwCellMini: {
    width: 22,
    height: 22,
  },
  fwCellTxtMini: {
    fontSize: 11,
  },
  fwAvatarMini: {
    width: 30,
    height: 30,
  },
  fwDotMini: {
    width: 16,
    height: 16,
  },
  fwBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  fwMono: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    ...Platform.select({ web: { fontFamily: 'ui-monospace, monospace' }, default: {} }),
  },
  fwStack: {
    gap: spacing.xs,
  },
  fwRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fwRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  fwChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  fwChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fwDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  fwMiniLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.textMuted,
  },
  fwPaletteRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  fwCell: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fwCellTxt: {
    fontSize: 12,
    fontWeight: '800',
  },
  fwAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  fwNote: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.surfaceAlt,
  },
  fwTag: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.xs,
  },
  fwTagTxt: {
    fontSize: 10,
    fontWeight: '800',
  },
  fwNoteTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  fwBubble: {
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 5,
    maxWidth: '85%',
  },
  fwBubbleIn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fwBubbleOut: {
    alignSelf: 'flex-end',
    borderWidth: 1,
  },
  fwSavedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  fwDayChip: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 44,
    alignItems: 'center',
  },
  fwRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  fwRankKey: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  fwRankVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  fwArrow: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  fwDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
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
  // Mobile: tighter padding + a shared height floor so the 2-up steps line up.
  stepCardCompact: {
    padding: spacing.sm,
    minHeight: 150,
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
