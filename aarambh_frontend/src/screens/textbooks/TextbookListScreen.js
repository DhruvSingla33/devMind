import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { listTextbooks } from '../../api/textbooks.api';
import { extractErrorMessage } from '../../api/client';
import { radius, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { hexToRgba } from '../../utils/color';

const SUBJECT_ICONS = {
  Biology: '🧬',
  Botany: '🌿',
  Zoology: '🦋',
  Physics: '⚡',
  Chemistry: '⚗️',
  Maths: '📐',
};

const SUBJECT_COLORS = {
  Biology: '#3DD68C',
  Botany: '#22A04B',
  Zoology: '#0EA5B7',
  Physics: '#5B8CFF',
  Chemistry: '#F5A623',
  Maths: '#E63946',
};

export default function TextbookListScreen({ navigation, subject, onClearSubject }) {
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [textbooks, setTextbooks] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await listTextbooks(subject ? { subject } : {});
      setTextbooks(data);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, [subject]);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') return <LoadingState label="Loading textbooks…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  return (
    <ScreenContainer>
      <Grid
        data={textbooks}
        keyExtractor={(item) => item._id}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          subject ? (
            <View style={styles.filterRow}>
              <Text style={typography.h3}>{subject} books</Text>
              {onClearSubject ? (
                <Pressable onPress={onClearSubject} hitSlop={8} style={styles.filterClear}>
                  <Text style={[styles.filterClearText, { color: colors.primary }]}>Show all subjects ✕</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <ErrorState message={subject ? `No ${subject} books published yet.` : 'No textbooks published yet.'} />
        }
        renderItem={({ item }) => {
          const tint = SUBJECT_COLORS[item.subject] || colors.primary;
          return (
            <Card style={[styles.card, { borderTopColor: tint }]}>
              <Text style={styles.icon}>{SUBJECT_ICONS[item.subject] || item.icon}</Text>
              <Text style={typography.h3}>{item.title}</Text>
              <Text style={[typography.bodyMuted, styles.meta]}>
                Class {item.classLevel} · {item.subject}
              </Text>
              <View style={styles.tagsRow}>
                {item.examTags?.map((tag) => (
                  <View key={tag} style={[styles.tag, { borderColor: hexToRgba(tint, 0.5) }]}>
                    <Text style={[styles.tagText, { color: tint }]}>{tag}</Text>
                  </View>
                ))}
              </View>

              <Button
                title="Explore →"
                variant="outline"
                textColor={tint}
                onPress={() => navigation.navigate('TextbookDetail', { code: item.code, title: item.title })}
                style={[styles.exploreButton, { borderColor: tint }]}
              />
              <Button
                title="Mix Quiz →"
                onPress={() =>
                  navigation.navigate('TestsTab', {
                    screen: 'MixQuizSetup',
                    params: { chapterTitle: item.title },
                  })
                }
                style={[styles.quizButton, { backgroundColor: tint, borderColor: tint }]}
              />
            </Card>
          );
        }}
      />
    </ScreenContainer>
  );
}

const makeStyles = () => StyleSheet.create({
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  filterClear: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  filterClearText: {
    fontWeight: '700',
    fontSize: 13,
  },
  card: {
    marginBottom: spacing.md,
    borderTopWidth: 3,
  },
  icon: {
    fontSize: 30,
    marginBottom: spacing.sm,
  },
  meta: {
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  tag: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  exploreButton: {
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  quizButton: {
    borderRadius: radius.pill,
  },
});
