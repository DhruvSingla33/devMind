import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, shadow, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../theme/responsive';
import Donut from '../../components/charts/Donut';
import LineChart from '../../components/charts/LineChart';
import ProgressBar from '../../components/charts/ProgressBar';
import { SectionCard, Pill } from './DashboardUI';
import {
  CHART,
  accuracyColor,
  firstName,
  formatSeconds,
  greeting,
  subjectColor,
} from './dashboardUtils';

function Delta({ value, suffix = '% vs last week', styles, colors }) {
  if (value === null || value === undefined) return null;
  const up = value >= 0;
  return (
    <Text style={[styles.delta, { color: up ? CHART.green : CHART.red }]}>
      {up ? '↑' : '↓'} {Math.abs(value)}
      {suffix}
    </Text>
  );
}

function StatTile({ children, style }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.tile, style]}>{children}</View>;
}

export default function OverviewSection({ data, user, onViewFocus, showGreeting = true }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { width } = useBreakpoint();
  const twoCol = width >= 900;
  const o = data.overview;

  const trend = (data.performanceTrend || []).map((p) => p.accuracy);
  const trendLabels = (data.performanceTrend || []).map((p) =>
    p.date ? new Date(p.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : ''
  );
  const chartW = twoCol ? Math.min(560, (width - 320) * 0.58) : width - 80;

  return (
    <View style={{ gap: spacing.md }}>
      {/* Greeting (hidden when embedded under Analytics) */}
      {showGreeting && (
        <View style={styles.greetRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetTitle}>
              {greeting()}, {firstName(user?.name)} <Text style={{ fontSize: 22 }}>👋</Text>
            </Text>
            <Text style={styles.greetSub}>Here's your performance overview</Text>
          </View>
          <Pill label="Last 7 Days" color={colors.textSecondary} />
        </View>
      )}

      {/* Stat tiles */}
      <View style={styles.tileRow}>
        <StatTile>
          <Donut
            size={92}
            strokeWidth={9}
            value={o.overallAccuracyPercent}
            color={CHART.green}
            trackColor={colors.surfaceAlt}
          >
            <Text style={styles.ringValue}>{o.overallAccuracyPercent}%</Text>
          </Donut>
          <Text style={styles.tileLabel}>Overall Accuracy</Text>
          <Delta value={o.overallAccuracyDelta} styles={styles} colors={colors} />
        </StatTile>

        <StatTile>
          <View style={[styles.iconBadge, { backgroundColor: `${CHART.blue}22` }]}>
            <Text style={[styles.iconBadgeTxt, { color: CHART.blue }]}>👥</Text>
          </View>
          <Text style={styles.tileBig}>{o.totalQuestionsAttempted.toLocaleString()}</Text>
          <Text style={styles.tileLabel}>Total MCQs Attempted</Text>
          <Delta
            value={
              o.totalQuestionsLastWeek
                ? Math.round(((o.totalQuestionsThisWeek - o.totalQuestionsLastWeek) / o.totalQuestionsLastWeek) * 100)
                : null
            }
            styles={styles}
            colors={colors}
          />
        </StatTile>

        <StatTile>
          <View style={[styles.iconBadge, { backgroundColor: `${CHART.amber}22` }]}>
            <Text style={[styles.iconBadgeTxt, { color: CHART.amber }]}>🏆</Text>
          </View>
          <Text style={styles.tileBig}>{o.percentile}%</Text>
          <Text style={styles.tileLabel}>Percentile</Text>
          <Text style={styles.tileFoot}>{o.totalTestsCompleted} tests completed</Text>
        </StatTile>

        <StatTile>
          <View style={[styles.iconBadge, { backgroundColor: `${CHART.purple}22` }]}>
            <Text style={[styles.iconBadgeTxt, { color: CHART.purple }]}>⏱</Text>
          </View>
          <Text style={styles.tileBig}>{o.avgTimePerQuizLabel}</Text>
          <Text style={styles.tileLabel}>Avg. Time / Quiz</Text>
          <Text style={styles.tileFoot}>{formatSeconds(o.avgTimePerQuestionSeconds)} / question</Text>
        </StatTile>
      </View>

      {/* Trend + subject performance */}
      <View style={[styles.splitRow, !twoCol && { flexDirection: 'column' }]}>
        <SectionCard title="Performance Trend" style={twoCol ? { flex: 1.5 } : null}>
          {trend.length > 0 ? (
            <LineChart
              data={trend}
              xLabels={trendLabels}
              width={chartW}
              height={200}
              color={CHART.blue}
              target={Math.max(...trend, 80)}
              textColor={colors.textMuted}
              showPeak
            />
          ) : (
            <Text style={styles.empty}>Complete a few tests to see your trend.</Text>
          )}
        </SectionCard>

        <SectionCard title="Subject Performance" style={twoCol ? { flex: 1 } : null}>
          <View style={{ gap: spacing.md }}>
            {(data.subjectPerformance || []).map((s) => (
              <View key={s.subject}>
                <View style={styles.barHead}>
                  <Text style={styles.barLabel}>{s.subject}</Text>
                  <Text style={[styles.barValue, { color: colors.textPrimary }]}>{s.accuracy}%</Text>
                </View>
                <ProgressBar value={s.accuracy} color={subjectColor(s.subject)} track={colors.surfaceAlt} />
              </View>
            ))}
            {(data.subjectPerformance || []).length === 0 && (
              <Text style={styles.empty}>No subject data yet.</Text>
            )}
          </View>
        </SectionCard>
      </View>

      {/* Focus areas */}
      <SectionCard
        title="Focus Areas"
        icon="🎯"
        subtitle="Concentrate on these topics to improve your score"
      >
        <View style={styles.focusRow}>
          {(data.focusAreas || []).map((f) => (
            <View key={f.topic} style={styles.focusCard}>
              <View style={styles.focusTop}>
                <Text style={styles.focusTopic} numberOfLines={1}>
                  {f.topic}
                </Text>
              </View>
              <Text style={[styles.focusAcc, { color: accuracyColor(f.accuracy) }]}>
                {f.accuracy}% <Text style={styles.focusAccLbl}>accuracy</Text>
              </Text>
              <Text style={styles.focusTime}>{formatSeconds(f.avgTimeSeconds)} / question</Text>
              <Pill
                label={f.severity}
                color={f.severity === 'Critical' ? CHART.red : CHART.orange}
              />
            </View>
          ))}
          {(data.focusAreas || []).length === 0 && (
            <Text style={styles.empty}>No weak areas detected yet — keep practicing!</Text>
          )}
        </View>
      </SectionCard>
    </View>
  );
}

const makeStyles = ({ colors }) =>
  StyleSheet.create({
    greetRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    greetTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
    greetSub: { fontSize: 13.5, color: colors.textSecondary, marginTop: 4 },

    tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    tile: {
      flexGrow: 1,
      flexBasis: 170,
      minWidth: 150,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      alignItems: 'flex-start',
      gap: 6,
      ...shadow.card,
    },
    ringValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
    iconBadge: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    iconBadgeTxt: { fontSize: 18 },
    tileBig: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginTop: 2 },
    tileLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
    tileFoot: { fontSize: 11.5, color: colors.textMuted },
    delta: { fontSize: 11.5, fontWeight: '700' },

    splitRow: { flexDirection: 'row', gap: spacing.md },
    barHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    barLabel: { fontSize: 13.5, color: colors.textSecondary, fontWeight: '600' },
    barValue: { fontSize: 13.5, fontWeight: '700' },

    focusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    focusCard: {
      flexGrow: 1,
      flexBasis: 200,
      minWidth: 170,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: 6,
    },
    focusTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    focusTopic: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, flex: 1 },
    focusAcc: { fontSize: 20, fontWeight: '800' },
    focusAccLbl: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    focusTime: { fontSize: 12, color: colors.textMuted },
    empty: { fontSize: 13, color: colors.textMuted, paddingVertical: spacing.sm },
  });
