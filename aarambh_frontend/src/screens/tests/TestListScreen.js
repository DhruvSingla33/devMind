import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { listTests, startTest } from '../../api/tests.api';
import { extractErrorMessage } from '../../api/client';
import { radius, shadow, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../theme/responsive';

const ICON_COLORS = ['#7C5CFC', '#2FBF71', '#4F86F7', '#E85D9B', '#E0A23C', '#22B8A6'];
const START_BLUE = '#4C57E0';

// Pick an emoji that fits the quiz, mirroring the design's per-card glyphs.
function emojiFor(test) {
  const t = `${test.title || ''}`.toLowerCase();
  if (test.type === 'full_length' || t.includes('mock') || t.includes('cbt')) return '📄';
  if (t.includes('chem')) return '🧪';
  if (t.includes('living') || t.includes('bio') || t.includes('botany') || t.includes('zoology')) return '🌿';
  if (t.includes('custom')) return '⚙️';
  if (t.includes('physic')) return '🧲';
  return '🧪';
}

function MetaItem({ icon, label, styles }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaIcon}>{icon}</Text>
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

function TestCard({ test, index, onStart, starting, styles }) {
  const color = ICON_COLORS[index % ICON_COLORS.length];
  const count = test.questions?.length || 0;
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.cardIcon, { backgroundColor: color }]}>
          <Text style={styles.cardIconTxt}>{emojiFor(test)}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {test.title}
        </Text>
        <Text style={styles.cardArrow}>→</Text>
      </View>

      <View style={styles.metaRow}>
        <MetaItem icon="🎓" label={test.exam || 'NEET'} styles={styles} />
        <MetaItem icon="❓" label={`${count} questions`} styles={styles} />
        <MetaItem icon="🕐" label={`${test.durationMinutes} min`} styles={styles} />
        <MetaItem icon="⭐" label={`${test.totalMarks} marks`} styles={styles} />
      </View>

      <Pressable
        onPress={() => onStart(test)}
        disabled={starting}
        style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.88 }, starting && { opacity: 0.6 }]}
      >
        <Text style={styles.startBtnTxt}>{starting ? 'Starting…' : 'Start test  →'}</Text>
      </Pressable>
    </View>
  );
}

export default function TestListScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { width } = useBreakpoint();
  const [tests, setTests] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);
  const [startingId, setStartingId] = useState(null);

  const columns = width >= 1100 ? 3 : width >= 720 ? 2 : 1;
  const cardBasis = `${100 / columns}%`;

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await listTests();
      setTests(data);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStart = async (test) => {
    setStartingId(test._id);
    try {
      const session = await startTest(test._id);
      navigation.navigate('TestAttempt', { session });
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
    } finally {
      setStartingId(null);
    }
  };

  if (status === 'loading') return <LoadingState label="Loading mock tests…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        {/* New Mix Quiz banner */}
        <LinearGradient
          colors={['#FF6B8A', '#E63946']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.banner}
        >
          <View style={styles.bannerLeft}>
            <View style={styles.bannerBolt}>
              <Text style={{ fontSize: 20 }}>⚡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>New Mix Quiz</Text>
              <Text style={styles.bannerSub}>Get a custom mix of questions across all topics</Text>
            </View>
          </View>
          <Pressable
            onPress={() => navigation.navigate('MixQuizSetup')}
            style={({ pressed }) => [styles.bannerBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.bannerBtnTxt}>⚡ New Mix Quiz  →</Text>
          </Pressable>
        </LinearGradient>

        {tests.length === 0 ? (
          <ErrorState message="No mock tests published yet — start a Mix Quiz above instead." />
        ) : (
          <View style={styles.grid}>
            {tests.map((test, i) => (
              <View key={test._id} style={[styles.cardWrap, { flexBasis: cardBasis, maxWidth: cardBasis }]}>
                <TestCard
                  test={test}
                  index={i}
                  onStart={handleStart}
                  starting={startingId === test._id}
                  styles={styles}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const makeStyles = ({ colors }) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    inner: { width: '100%', maxWidth: 1180, alignSelf: 'center', gap: spacing.lg },

    banner: {
      borderRadius: radius.lg,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      flexWrap: 'wrap',
      ...shadow.card,
    },
    bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1, minWidth: 220 },
    bannerBolt: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bannerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
    bannerSub: { fontSize: 13.5, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
    bannerBtn: {
      backgroundColor: '#fff',
      borderRadius: radius.pill,
      paddingVertical: 11,
      paddingHorizontal: 18,
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    bannerBtnTxt: { color: '#E63946', fontWeight: '800', fontSize: 14 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.sm },
    cardWrap: { paddingHorizontal: spacing.sm, marginBottom: spacing.md },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.md,
      ...shadow.card,
    },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    cardIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    cardIconTxt: { fontSize: 22 },
    cardTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.textPrimary, lineHeight: 21 },
    cardArrow: { fontSize: 18, color: colors.textMuted, marginTop: 2 },

    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingTop: 2 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    metaIcon: { fontSize: 12.5, color: colors.textMuted },
    metaText: { fontSize: 12.5, color: colors.textSecondary, fontWeight: '500' },

    startBtn: {
      backgroundColor: START_BLUE,
      borderRadius: radius.md,
      paddingVertical: 12,
      alignItems: 'center',
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    startBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  });
