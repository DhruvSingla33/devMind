import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { adminListChapterPages, adminDeletePage } from '../../api/textbooks.api';
import { extractErrorMessage } from '../../api/client';
import { confirmAsync, notify } from '../../utils/alert';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

export default function AdminChapterPagesScreen({ route, navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { chapterId, textbookId, chapterTitle } = route.params;
  const [pages, setPages] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await adminListChapterPages(chapterId);
      setPages(data || []);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, [chapterId]);

  // Reload on focus so a page added on the form screen shows up on return.
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const handleDelete = async (page) => {
    const confirmed = await confirmAsync(
      `Delete page ${page.pageNumber}?`,
      'This also deletes its sections and quiz questions. This cannot be undone.',
      'Delete'
    );
    if (!confirmed) return;
    setDeletingId(page._id);
    try {
      await adminDeletePage(page._id);
      setPages((prev) => prev.filter((p) => p._id !== page._id));
    } catch (error) {
      notify('Could not delete page', extractErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  if (status === 'loading') return <LoadingState label="Loading pages…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  return (
    <ScreenContainer>
      <Grid
        data={pages}
        keyExtractor={(item) => item._id}
        columns={{ mobile: 1, tablet: 2, desktop: 2 }}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={typography.h2}>Content pages</Text>
            {chapterTitle ? (
              <Text style={[typography.bodyMuted, styles.meta]}>{chapterTitle}</Text>
            ) : null}
            <Button
              title="+ New page"
              onPress={() =>
                navigation.navigate('AdminPageForm', { chapterId, textbookId })
              }
              style={styles.newButton}
            />
          </View>
        }
        ListEmptyComponent={<ErrorState message="No pages yet — add one above." />}
        renderItem={({ item }) => (
          <Card style={styles.pageCard}>
            <View style={styles.row}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.pageNumber}</Text>
              </View>
              <View style={styles.info}>
                <Text style={typography.h3}>{item.title || `Page ${item.pageNumber}`}</Text>
                <Text style={[typography.bodyMuted, styles.counts]}>
                  {item.sections?.length || 0} section{item.sections?.length === 1 ? '' : 's'} ·{' '}
                  {item.quiz?.length || 0} quiz question{item.quiz?.length === 1 ? '' : 's'}
                </Text>
              </View>
            </View>
            <View style={styles.actionRow}>
              <Button
                title="Edit"
                onPress={() =>
                  navigation.navigate('AdminPageForm', {
                    chapterId,
                    textbookId,
                    page: item,
                  })
                }
                style={styles.actionButton}
              />
              <Button
                title="Delete"
                variant="outline"
                loading={deletingId === item._id}
                onPress={() => handleDelete(item)}
                style={[styles.actionButton, styles.deleteButton]}
              />
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  list: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingVertical: spacing.lg,
  },
  meta: {
    marginTop: spacing.xs,
  },
  newButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    minWidth: 160,
  },
  pageCard: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  badgeText: {
    color: colors.primary,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  counts: {
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    borderColor: colors.danger,
  },
});
