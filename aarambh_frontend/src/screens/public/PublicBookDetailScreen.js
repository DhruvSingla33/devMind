import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { getTextbook } from '../../api/textbooks.api';
import { extractErrorMessage } from '../../api/client';
import { radius, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { hexToRgba } from '../../utils/color';

export default function PublicBookDetailScreen({ route, navigation }) {
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { code } = route.params;
  const [book, setBook] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getTextbook(code);
      setBook(data);
      navigation.setOptions({ title: data.title });
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, [code, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') return <LoadingState label="Loading textbook…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  const tint = book.color || colors.primary;

  return (
    <ScreenContainer noPadding>
      <Grid
        data={book.chapters || []}
        keyExtractor={(item) => item._id}
        columns={{ mobile: 1, tablet: 2, desktop: 2 }}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={[styles.hero, { backgroundColor: hexToRgba(tint, 0.1) }]}>
              <View style={[styles.iconBadge, { backgroundColor: hexToRgba(tint, 0.16), borderColor: hexToRgba(tint, 0.4) }]}>
                <Text style={styles.icon}>{book.icon || '📚'}</Text>
              </View>
              <Text style={typography.h1}>{book.title}</Text>
              <View style={styles.metaRow}>
                <View style={[styles.metaPill, { borderColor: hexToRgba(tint, 0.4) }]}>
                  <Text style={[styles.metaPillText, { color: tint }]}>Class {book.classLevel}</Text>
                </View>
                {book.examTags?.map((tag) => (
                  <View key={tag} style={[styles.metaPill, { borderColor: hexToRgba(tint, 0.4) }]}>
                    <Text style={[styles.metaPillText, { color: tint }]}>{tag}</Text>
                  </View>
                ))}
              </View>

              <Button
                title="Sign up to take a full mock test →"
                onPress={() => navigation.navigate('Signup')}
                style={styles.cta}
              />
            </View>

            <View style={styles.chaptersHeader}>
              <Text style={typography.h3}>Chapters ({book.chapters?.length || 0})</Text>
              <Text style={[typography.bodyMuted, styles.chaptersSubtitle]}>
                Open any chapter to read it and practice questions instantly — no account needed.
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <Card
            onPress={() =>
              navigation.navigate('PublicChapterReader', {
                code,
                chapterNumber: item.chapterNumber,
                title: item.title,
              })
            }
            style={[styles.chapterCard, { borderLeftColor: tint }]}
          >
            <View style={styles.row}>
              <View style={[styles.chapterBadge, { backgroundColor: hexToRgba(tint, 0.14) }]}>
                <Text style={[styles.chapterNumber, { color: tint }]}>{item.chapterNumber}</Text>
              </View>
              <View style={styles.info}>
                <Text style={typography.h3}>{item.title}</Text>
                <Text style={[typography.bodyMuted, styles.pages]}>
                  {item.totalPages} page{item.totalPages === 1 ? '' : 's'}
                </Text>
              </View>
              <Text style={[styles.chevron, { color: tint }]}>→</Text>
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const makeStyles = () => StyleSheet.create({
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    marginHorizontal: -spacing.md,
    marginBottom: spacing.lg,
  },
  iconBadge: {
    width: 84,
    height: 84,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 44,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  metaPill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cta: {
    minWidth: 280,
  },
  chaptersHeader: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  chaptersSubtitle: {
    marginTop: spacing.xs,
  },
  chapterCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  chapterNumber: {
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  pages: {
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
});
