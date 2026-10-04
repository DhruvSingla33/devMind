import React, { useMemo } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, shadow, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../theme/responsive';
import Carousel from '../../components/Carousel';
import { CHART } from './dashboardUtils';

// Marketing creative banners — the same screen1/screen2 artwork the public
// site shows in its hero carousel.
const BANNER_NEET_JOURNEY = require('../../images/screen1.jpg');
const BANNER_NCERT_PYQ = require('../../images/screen2.jpg');
const BANNER_RATIO = 1280 / 721;
// On wide/web, bound the banner by HEIGHT and derive its max WIDTH from the
// image ratio. The box then hugs the artwork at every size — no page-filling
// height, and no empty side gutters around a centered image.
const BANNER_MAX_H = 360;
const BANNER_MAX_W = BANNER_MAX_H * BANNER_RATIO;

// Smart tools — the first grid under the hero. Each `target` is resolved by the
// dashboard (section switch or route).
const STUDY_TOOLS = [
  { key: 'ai', icon: '🤖', color: CHART.pink, title: 'Aarambh AI', body: 'Ask anything. Get instant help.', target: 'doubts' },
  { key: 'quiz', icon: '📝', color: CHART.blue, title: 'Quiz Creator', body: 'Create your own custom quiz.', target: 'practice' },
  { key: 'rank', icon: '🧠', color: CHART.purple, title: 'Rank Predictor', body: 'Know your potential and plan better.', target: 'predictor' },
  { key: 'pyq', icon: '🎓', color: CHART.teal, title: 'Chapterwise PYQ', body: 'Topic-wise PYQs with NCERT mapping.', target: 'textbooks' },
  { key: 'notes', icon: '🗒️', color: CHART.amber, title: 'Short Notes', body: 'Quick revision, better retention.', target: 'notes' },
  { key: 'material', icon: '📚', color: CHART.red, title: 'Study Material', body: 'Handwritten notes, PDFs, & more.', target: 'textbooks' },
];

// Practice & performance — a compact row of three.
const PERFORMANCE = [
  { key: 'leaderboard', icon: '🏆', color: CHART.green, title: 'Leaderboard', body: 'Compete. Improve. Grow.', target: 'leaderboard' },
  { key: 'quick', icon: '⚡', color: CHART.blue, title: 'Quick Practice', body: '5 questions · Focused · Result driven', target: 'practice' },
  { key: 'weak', icon: '🎯', color: CHART.red, title: 'Your Weak Areas', body: 'Focus more. Improve faster.', target: 'analytics' },
];

const todayLabel = () =>
  new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

function SectionHeader({ styles, icon, title, subtitle, actionLabel, onAction }) {
  return (
    <View style={styles.sectionHead}>
      <View style={styles.sectionBar} />
      {icon ? <Text style={styles.sectionIcon}>{icon}</Text> : null}
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
      </View>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8} style={({ pressed }) => pressed && { opacity: 0.7 }}>
          <Text style={styles.sectionAction}>{actionLabel} →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ToolCard({ styles, item, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.toolCard,
        { backgroundColor: `${item.color}14`, borderColor: `${item.color}2E` },
        hovered && styles.cardHover,
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={[styles.toolIcon, { backgroundColor: `${item.color}22`, borderColor: `${item.color}55` }]}>
        <Text style={styles.toolIconTxt}>{item.icon}</Text>
      </View>
      <Text style={styles.toolTitle}>{item.title}</Text>
      <Text style={styles.toolBody} numberOfLines={2}>
        {item.body}
      </Text>
      <View style={[styles.toolArrow, { backgroundColor: `${item.color}22` }]}>
        <Text style={[styles.toolArrowTxt, { color: item.color }]}>→</Text>
      </View>
    </Pressable>
  );
}

// Lay out items into equal-width rows of `columns` (flex rows keep card heights
// even, which wrapped-line stretch does not).
function Grid({ items, columns, gap, renderItem }) {
  const rows = [];
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));
  return (
    <View style={{ gap }}>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', alignItems: 'stretch', gap }}>
          {row.map(renderItem)}
          {row.length < columns
            ? Array.from({ length: columns - row.length }).map((_, k) => <View key={`s${k}`} style={{ flex: 1 }} />)
            : null}
        </View>
      ))}
    </View>
  );
}

export default function HomeSection({ data, onFeature }) {
  const styles = useThemedStyles(makeStyles);
  const { isDark, colors } = useTheme();
  const { width } = useBreakpoint();

  const toolCols = width >= 1000 ? 3 : 2;

  // Real weak areas from analytics when available (lowest-accuracy topics).
  const weakAreas = useMemo(() => {
    const topics = data?.topicPerformance || [];
    return [...topics].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);
  }, [data]);

  const chipColor = (a) => (a >= 70 ? CHART.green : a >= 50 ? CHART.amber : CHART.red);

  // Soft accent surfaces read well in light mode, but a red wash on the dark
  // canvas looks heavy — use a neutral elevated surface in dark instead.
  const softCard = isDark
    ? { backgroundColor: colors.surface, borderColor: colors.border }
    : { backgroundColor: colors.primaryMuted, borderColor: `${colors.primary}2E` };

  return (
    <View style={{ gap: spacing.lg }}>
      {/* Hero — marketing banner carousel (screen1 / screen2 artwork).
          Full-width but height-capped: `contain` keeps the whole artwork visible
          (centered, backdrop gutters) instead of cropping or filling the page. */}
      <View style={styles.bannerWrap}>
      <Carousel
        aspectRatio={BANNER_RATIO}
        maxHeight={BANNER_MAX_H}
        autoAdvanceMs={5500}
        slides={[
          {
            key: 'neet-journey',
            render: () => (
              <Pressable onPress={() => onFeature?.('textbooks')} style={styles.bannerSlide}>
                <Image source={BANNER_NEET_JOURNEY} style={styles.bannerImg} resizeMode="contain" />
              </Pressable>
            ),
          },
          {
            key: 'ncert-pyq',
            render: () => (
              <Pressable onPress={() => onFeature?.('practice')} style={styles.bannerSlide}>
                <Image source={BANNER_NCERT_PYQ} style={styles.bannerImg} resizeMode="contain" />
              </Pressable>
            ),
          },
        ]}
      />
      </View>

      {/* Daily Mission */}
      <View style={[styles.missionCard, softCard]}>
        <View style={styles.missionIcon}>
          <Text style={{ fontSize: 22 }}>🎯</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.missionTitle}>Daily Mission</Text>
          <Text style={styles.missionSub}>Small steps. Big results.</Text>
        </View>
        <View style={styles.datePill}>
          <Text style={styles.datePillTxt}>📅 {todayLabel()}</Text>
        </View>
      </View>

      {/* Study Tools */}
      <View style={{ gap: spacing.md }}>
        <SectionHeader
          styles={styles}
          icon="📖"
          title="Study Tools"
          subtitle="Smart tools for smarter preparation."
          actionLabel="View All"
          onAction={() => onFeature?.('practice')}
        />
        <Grid
          items={STUDY_TOOLS}
          columns={toolCols}
          gap={spacing.md}
          renderItem={(item) => (
            <ToolCard key={item.key} styles={styles} item={item} onPress={() => onFeature?.(item.target)} />
          )}
        />
      </View>

      {/* Practice & Performance */}
      <View style={{ gap: spacing.md }}>
        <SectionHeader styles={styles} icon="🎯" title="Practice & Performance" subtitle="Track. Improve. Get ahead." />
        <Grid
          items={PERFORMANCE}
          columns={3}
          gap={spacing.sm}
          renderItem={(item) => (
            <Pressable
              key={item.key}
              onPress={() => onFeature?.(item.target)}
              style={({ hovered, pressed }) => [
                styles.perfCard,
                { backgroundColor: `${item.color}14`, borderColor: `${item.color}2E` },
                hovered && styles.cardHover,
                pressed && { opacity: 0.9 },
              ]}
            >
              <View style={[styles.perfIcon, { backgroundColor: `${item.color}22` }]}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              </View>
              <Text style={styles.perfTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.perfBody} numberOfLines={3}>
                {item.body}
              </Text>
            </Pressable>
          )}
        />

        {/* Weak areas summary */}
        <Pressable
          onPress={() => onFeature?.('analytics')}
          style={({ pressed }) => [styles.weakCard, softCard, pressed && { opacity: 0.92 }]}
        >
          <View style={styles.weakHeadRow}>
            <View style={styles.weakIcon}>
              <Text style={{ fontSize: 18 }}>🎯</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.weakTitle}>Your Weak Areas</Text>
              <Text style={styles.weakSub}>Focus more. Improve faster.</Text>
            </View>
            <Text style={styles.weakAction}>View Analysis →</Text>
          </View>
          {weakAreas.length > 0 ? (
            <View style={styles.chipRow}>
              {weakAreas.map((t) => (
                <View key={t.topic} style={[styles.chip, { backgroundColor: `${chipColor(t.accuracy)}1A` }]}>
                  <Text style={[styles.chipTxt, { color: chipColor(t.accuracy) }]} numberOfLines={1}>
                    {t.topic}  {t.accuracy}%
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.weakEmpty}>Practice a few questions to surface your weak areas.</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = ({ colors }) =>
  StyleSheet.create({
    // Hero banner
    bannerWrap: { width: '100%', maxWidth: BANNER_MAX_W, alignSelf: 'center' },
    bannerSlide: {
      flex: 1,
      borderRadius: radius.lg,
      overflow: 'hidden',
      ...shadow.card,
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    bannerImg: { width: '100%', height: '100%' },

    // Daily Mission
    missionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.primaryMuted,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: `${colors.primary}2E`,
      padding: spacing.md,
    },
    missionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    missionTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
    missionSub: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
    datePill: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.pill,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    datePillTxt: { fontSize: 12, fontWeight: '700', color: colors.primary },

    // Section header
    sectionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    sectionBar: { width: 4, height: 28, borderRadius: 2, backgroundColor: colors.primary },
    sectionIcon: { fontSize: 22 },
    sectionTitle: { fontSize: 20, fontWeight: '900', color: colors.textPrimary },
    sectionSub: { fontSize: 12.5, color: colors.textSecondary, marginTop: 1 },
    sectionAction: { fontSize: 13, fontWeight: '800', color: colors.primary },

    // Tool cards
    toolCard: {
      flex: 1,
      minWidth: 0,
      minHeight: 150,
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: spacing.md,
      gap: 6,
      ...Platform.select({
        web: { cursor: 'pointer', transitionProperty: 'transform, border-color', transitionDuration: '140ms' },
        default: {},
      }),
    },
    cardHover: Platform.select({ web: { transform: [{ translateY: -3 }] }, default: {} }),
    toolIcon: {
      width: 46,
      height: 46,
      borderRadius: 23,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    toolIconTxt: { fontSize: 22 },
    toolTitle: { fontSize: 15.5, fontWeight: '800', color: colors.textPrimary },
    toolBody: { fontSize: 12.5, lineHeight: 17, color: colors.textSecondary, flex: 1 },
    toolArrow: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-end',
    },
    toolArrowTxt: { fontSize: 14, fontWeight: '800' },

    // Performance cards
    perfCard: {
      flex: 1,
      minWidth: 0,
      minHeight: 130,
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: spacing.sm + 2,
      gap: 6,
      ...Platform.select({
        web: { cursor: 'pointer', transitionProperty: 'transform', transitionDuration: '140ms' },
        default: {},
      }),
    },
    perfIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
    },
    perfTitle: { fontSize: 13.5, fontWeight: '800', color: colors.textPrimary },
    perfBody: { fontSize: 11, lineHeight: 15, color: colors.textSecondary },

    // Weak areas
    weakCard: {
      backgroundColor: colors.primaryMuted,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: `${colors.primary}2E`,
      padding: spacing.md,
      gap: spacing.sm,
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    weakHeadRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    weakIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weakTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
    weakSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
    weakAction: { fontSize: 12.5, fontWeight: '800', color: colors.primary },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    chip: { borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 12 },
    chipTxt: { fontSize: 12, fontWeight: '700' },
    weakEmpty: { fontSize: 12.5, color: colors.textSecondary },
  });
