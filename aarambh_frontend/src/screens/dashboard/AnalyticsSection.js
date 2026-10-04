import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { radius, shadow, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../theme/responsive';
import Donut from '../../components/charts/Donut';
import LineChart from '../../components/charts/LineChart';
import ProgressBar from '../../components/charts/ProgressBar';
import ScatterPlot from '../../components/charts/ScatterPlot';
import { SectionCard, Pill, LegendRow, Dot } from './DashboardUI';
import {
  CHART,
  accuracyColor,
  difficultyMeta,
  formatSeconds,
  masteryColor,
  subjectColor,
} from './dashboardUtils';

const QI_COLORS = {
  fastCorrect: CHART.green,
  slowCorrect: CHART.blue,
  fastWrong: CHART.amber,
  slowWrong: CHART.red,
};

function Segmented({ options, value, onChange }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, padding: 3 }}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              {
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: radius.pill,
              },
              active && { backgroundColor: colors.primary },
            ]}
          >
            <Text style={{ fontSize: 12.5, fontWeight: '700', color: active ? '#fff' : colors.textSecondary }}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TopicMatrix({ data }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const subjects = useMemo(() => {
    const set = [...new Set((data.topicPerformance || []).map((t) => t.subject))];
    return ['All', ...set];
  }, [data.topicPerformance]);
  const [subject, setSubject] = useState('All');

  const rows = (data.topicPerformance || []).filter((t) => subject === 'All' || t.subject === subject);

  return (
    <SectionCard
      title="Topic Performance Matrix"
      subtitle="Detailed breakdown of your accuracy across all topics"
      right={
        subjects.length > 1 ? (
          <View style={{ maxWidth: 260 }}>
            <Segmented options={subjects.slice(0, 4)} value={subject} onChange={setSubject} />
          </View>
        ) : null
      }
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: 560, flex: 1 }}>
          <View style={[styles.trow, styles.thead]}>
            <Text style={[styles.th, styles.cTopic]}>Topic</Text>
            <Text style={[styles.th, styles.cNum]}>Accuracy</Text>
            <Text style={[styles.th, styles.cNum]}>Avg. Time</Text>
            <Text style={[styles.th, styles.cMid]}>Difficulty</Text>
            <Text style={[styles.th, styles.cNum]}>Attempts</Text>
            <Text style={[styles.th, styles.cMid]}>Mastery</Text>
          </View>
          {rows.map((t) => {
            const diff = difficultyMeta(t.difficulty);
            return (
              <View key={t.topic} style={styles.trow}>
                <View style={[styles.cTopic, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                  <Dot color={subjectColor(t.subject)} />
                  <Text style={styles.tdTopic} numberOfLines={1}>
                    {t.topic}
                  </Text>
                </View>
                <Text style={[styles.td, styles.cNum, { color: accuracyColor(t.accuracy), fontWeight: '800' }]}>
                  {t.accuracy}%
                </Text>
                <Text style={[styles.td, styles.cNum]}>{formatSeconds(t.avgTimeSeconds)}</Text>
                <View style={styles.cMid}>
                  <Pill label={diff.label} color={diff.color} />
                </View>
                <Text style={[styles.td, styles.cNum]}>{t.attempts}</Text>
                <View style={[styles.cMid, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                  <Dot color={masteryColor(t.mastery)} size={7} />
                  <Text style={[styles.td, { color: masteryColor(t.mastery), fontWeight: '700' }]}>{t.mastery}</Text>
                </View>
              </View>
            );
          })}
          {rows.length === 0 && <Text style={styles.empty}>No topic data yet.</Text>}
        </View>
      </ScrollView>
    </SectionCard>
  );
}

function WeaknessMatrix({ data }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { width } = useBreakpoint();
  const twoCol = width >= 1000;
  const points = (data.weaknessMatrix || []).map((p) => ({
    x: p.avgTimeSeconds,
    y: p.accuracy,
    color: masteryColor(p.mastery),
  }));

  const weakest = [...(data.topicPerformance || [])].sort((a, b) => a.accuracy - b.accuracy).slice(0, 2);
  const insight =
    weakest.length > 0
      ? `${weakest.map((t) => t.topic).join(' and ')} ${weakest.length > 1 ? 'are' : 'is'} your biggest ${
          weakest.length > 1 ? 'weaknesses' : 'weakness'
        } — low accuracy and higher time per question.`
      : 'Keep practicing to surface your weak areas.';

  return (
    <View style={[styles.splitRow, !twoCol && { flexDirection: 'column' }]}>
      <SectionCard
        title="2D Weakness Matrix"
        subtitle="Based on accuracy and time taken per question"
        style={twoCol ? { flex: 1.4 } : null}
      >
        <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.axisY}>Accuracy</Text>
              <ScatterPlot
                points={points}
                width={twoCol ? 360 : width - 120}
                height={210}
                textColor={colors.textMuted}
              />
            </View>
            <Text style={styles.axisX}>Time per Question</Text>
          </View>
          <LegendRow
            items={[
              { label: 'Strong', color: CHART.green },
              { label: 'Improve', color: CHART.amber },
              { label: 'Weak', color: CHART.pink },
              { label: 'Critical', color: CHART.red },
            ]}
          />
        </View>
      </SectionCard>

      <SectionCard title="Key Insight" icon="💡" style={twoCol ? { flex: 1 } : null}>
        <Text style={styles.insight}>{insight}</Text>
      </SectionCard>
    </View>
  );
}

function QuestionIntelligence({ data }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { width } = useBreakpoint();
  const twoCol = width >= 1000;
  const qi = data.questionIntelligence || { breakdown: [], overallAccuracy: 0, slowCorrectPercent: 0 };
  const segments = qi.breakdown.map((b) => ({ value: b.count, color: QI_COLORS[b.key] }));

  return (
    <View style={[styles.splitRow, !twoCol && { flexDirection: 'column' }]}>
      <SectionCard
        title="Question Intelligence"
        subtitle="Understand your mistakes and improve faster"
        style={twoCol ? { flex: 1.3 } : null}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, flexWrap: 'wrap' }}>
          <Donut size={150} strokeWidth={16} segments={segments} trackColor={colors.surfaceAlt}>
            <Text style={styles.ringBig}>{qi.overallAccuracy}%</Text>
            <Text style={styles.ringSub}>Overall Accuracy</Text>
          </Donut>
          <View style={{ gap: 12, flex: 1, minWidth: 180 }}>
            {qi.breakdown.map((b) => (
              <View key={b.key} style={styles.qiRow}>
                <Dot color={QI_COLORS[b.key]} />
                <Text style={styles.qiLabel}>{b.label}</Text>
                <Text style={styles.qiPct}>{b.percent}%</Text>
                <Text style={styles.qiCount}>({b.count})</Text>
              </View>
            ))}
          </View>
        </View>
      </SectionCard>

      <SectionCard title="What This Means?" icon="💬" style={twoCol ? { flex: 1 } : null}>
        <Text style={styles.insight}>
          You're doing well with speed and accuracy, but{' '}
          <Text style={{ fontWeight: '800', color: colors.textPrimary }}>{qi.slowCorrectPercent}%</Text> of your correct
          answers are taking too much time. Focus on time management and avoid guessing.
        </Text>
      </SectionCard>
    </View>
  );
}

function MistakeAnalysis({ data }) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const rows = data.mistakeAnalysis || [];
  return (
    <SectionCard title="Mistake Analysis" icon="🧩">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: 540, flex: 1 }}>
          <View style={[styles.trow, styles.thead]}>
            <Text style={[styles.th, styles.cTopic]}>Topic</Text>
            <Text style={[styles.th, styles.cNum]}>Total Mistakes</Text>
            <Text style={[styles.th, styles.cMid]}>Most Common Cause</Text>
            <Text style={[styles.th, styles.cMid]}>Action</Text>
          </View>
          {rows.map((m) => (
            <View key={m.topic} style={styles.trow}>
              <View style={[styles.cTopic, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                <Dot color={CHART.red} size={7} />
                <Text style={styles.tdTopic} numberOfLines={1}>
                  {m.topic}
                </Text>
              </View>
              <Text style={[styles.td, styles.cNum, { fontWeight: '800' }]}>{m.totalMistakes}</Text>
              <View style={[styles.cMid, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                <Dot color={CHART.amber} size={7} />
                <Text style={styles.td}>{m.mostCommonCause}</Text>
              </View>
              <View style={styles.cMid}>
                <Pill label={m.action} color={colors.primary} />
              </View>
            </View>
          ))}
          {rows.length === 0 && <Text style={styles.empty}>No mistakes logged yet.</Text>}
        </View>
      </ScrollView>
    </SectionCard>
  );
}

function ProgressRecommendations({ data, onStartPractice }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { width } = useBreakpoint();
  const twoCol = width >= 1000;
  const si = data.scoreImprovement || { from: 0, to: 0, delta: 0, series: [] };
  const series = si.series.length ? si.series.map((s) => s.accuracy) : [si.from, si.to];
  const labels = si.series.length ? si.series.map((s) => s.label) : ['Start', 'Now'];

  return (
    <View style={{ gap: spacing.md }}>
      <View style={[styles.splitRow, !twoCol && { flexDirection: 'column' }]}>
        <SectionCard title="Score Improvement" style={twoCol ? { flex: 1 } : null}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Text style={styles.siBig}>
              {si.from}% → {si.to}%
            </Text>
            <Pill label={`${si.delta >= 0 ? '+' : ''}${si.delta}%`} color={si.delta >= 0 ? CHART.green : CHART.red} />
          </View>
          <LineChart
            data={series}
            xLabels={labels}
            width={twoCol ? 360 : width - 120}
            height={170}
            color={CHART.blue}
            textColor={colors.textMuted}
          />
        </SectionCard>

        <SectionCard title="Subject Wise Progress" style={twoCol ? { flex: 1 } : null}>
          <View style={{ gap: spacing.md }}>
            {(data.subjectProgress || []).map((s) => (
              <View key={s.subject}>
                <View style={styles.spHead}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Dot color={subjectColor(s.subject)} />
                    <Text style={styles.spLabel}>{s.subject}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.spValue}>{s.accuracy}%</Text>
                    <Text style={[styles.spDelta, { color: s.delta >= 0 ? CHART.green : CHART.red }]}>
                      {s.delta >= 0 ? '↑' : '↓'} {Math.abs(s.delta)}%
                    </Text>
                  </View>
                </View>
                <ProgressBar value={s.accuracy} color={subjectColor(s.subject)} track={colors.surfaceAlt} />
              </View>
            ))}
            {(data.subjectProgress || []).length === 0 && <Text style={styles.empty}>No data yet.</Text>}
          </View>
        </SectionCard>
      </View>

      <SectionCard
        title="Recommended Practice Plan"
        icon="🎯"
        subtitle="Based on your weak areas and past performance"
      >
        <View style={styles.planRow}>
          {(data.recommendedPlan || []).map((p) => (
            <View key={p.topic} style={styles.planCard}>
              <Text style={styles.planTopic} numberOfLines={1}>
                {p.topic}
              </Text>
              <Text style={styles.planMeta}>
                {p.mcqCount} MCQs · {difficultyMeta(p.difficulty).label}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 8 }}>
                <Dot color={CHART.amber} size={7} />
                <Text style={styles.planBasis}>{p.basis}</Text>
              </View>
              <Pressable
                onPress={() => onStartPractice?.(p)}
                style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.88 }]}
                accessibilityRole="button"
              >
                <Text style={styles.startBtnTxt}>Start Practice</Text>
              </Pressable>
            </View>
          ))}
          {(data.recommendedPlan || []).length === 0 && (
            <Text style={styles.empty}>No recommendations yet — complete a few tests.</Text>
          )}
        </View>
      </SectionCard>
    </View>
  );
}

export default function AnalyticsSection({ data, onStartPractice }) {
  return (
    <View style={{ gap: spacing.md }}>
      <TopicMatrix data={data} />
      <WeaknessMatrix data={data} />
      <QuestionIntelligence data={data} />
      <MistakeAnalysis data={data} />
      <ProgressRecommendations data={data} onStartPractice={onStartPractice} />
    </View>
  );
}

const makeStyles = ({ colors }) =>
  StyleSheet.create({
    splitRow: { flexDirection: 'row', gap: spacing.md },

    // table
    trow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 11,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    thead: { borderBottomWidth: 1, borderBottomColor: colors.border },
    th: { fontSize: 11.5, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
    td: { fontSize: 13.5, color: colors.textSecondary },
    tdTopic: { fontSize: 13.5, color: colors.textPrimary, fontWeight: '600', flexShrink: 1 },
    cTopic: { flex: 2.2, paddingRight: 8 },
    cNum: { flex: 1, textAlign: 'left' },
    cMid: { flex: 1.2 },
    empty: { fontSize: 13, color: colors.textMuted, paddingVertical: spacing.md },

    axisY: { fontSize: 10, color: colors.textMuted, transform: [{ rotate: '-90deg' }], width: 14, alignSelf: 'center' },
    axisX: { fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
    insight: { fontSize: 14, lineHeight: 21, color: colors.textSecondary },

    ringBig: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
    ringSub: { fontSize: 10.5, color: colors.textMuted },
    qiRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    qiLabel: { fontSize: 13.5, color: colors.textSecondary, flex: 1 },
    qiPct: { fontSize: 13.5, fontWeight: '800', color: colors.textPrimary },
    qiCount: { fontSize: 12, color: colors.textMuted, width: 48 },

    siBig: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },

    spHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    spLabel: { fontSize: 13.5, color: colors.textSecondary, fontWeight: '600' },
    spValue: { fontSize: 13.5, fontWeight: '700', color: colors.textPrimary },
    spDelta: { fontSize: 12, fontWeight: '700' },

    planRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    planCard: {
      flexGrow: 1,
      flexBasis: 200,
      minWidth: 180,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
    },
    planTopic: { fontSize: 14.5, fontWeight: '700', color: colors.textPrimary },
    planMeta: { fontSize: 12.5, color: colors.textSecondary, marginTop: 4 },
    planBasis: { fontSize: 12.5, color: colors.textSecondary },
    startBtn: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: 9,
      alignItems: 'center',
      marginTop: 4,
    },
    startBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  });
