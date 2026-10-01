import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { getTextbook, adminDeleteTextbook } from '../../api/textbooks.api';
import { extractErrorMessage } from '../../api/client';
import { confirmAsync, notify } from '../../utils/alert';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

export default function AdminTextbookDetailScreen({ route, navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { code } = route.params;
  const [book, setBook] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const handleDelete = async () => {
    const confirmed = await confirmAsync(
      'Delete textbook?',
      'This also deletes all of its chapters. This cannot be undone.',
      'Delete'
    );
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      await adminDeleteTextbook(book._id);
      navigation.goBack();
    } catch (error) {
      notify('Could not delete textbook', extractErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === 'loading') return <LoadingState label="Loading textbook…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  return (
    <ScreenContainer>
      <Grid
        data={book.chapters || []}
        keyExtractor={(item) => item._id}
        columns={{ mobile: 1, tablet: 2, desktop: 2 }}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.icon}>{book.icon || '📚'}</Text>
              <Text style={typography.h2}>{book.title}</Text>
              <Text style={[typography.bodyMuted, styles.meta]}>
                {book.code} · Class {book.classLevel} · {book.subject}
              </Text>
              <View style={styles.actionRow}>
                <Button
                  title="Edit textbook"
                  variant="outline"
                  onPress={() => navigation.navigate('AdminTextbookForm', { textbook: book })}
                  style={styles.actionButton}
                />
                <Button
                  title="Delete"
                  variant="outline"
                  loading={isDeleting}
                  onPress={handleDelete}
                  style={[styles.actionButton, styles.deleteButton]}
                />
              </View>
            </View>

            <View style={styles.chaptersHeader}>
              <Text style={typography.h3}>Chapters ({book.chapters?.length || 0})</Text>
              <Button
                title="+ New chapter"
                onPress={() =>
                  navigation.navigate('AdminChapterForm', { textbookId: book._id, code })
                }
              />
            </View>
          </>
        }
        ListEmptyComponent={<ErrorState message="No chapters yet — add one above." />}
        renderItem={({ item }) => (
          <Card
            onPress={() =>
              navigation.navigate('AdminChapterForm', {
                textbookId: book._id,
                code,
                chapter: item,
              })
            }
            style={styles.chapterCard}
          >
            <View style={styles.row}>
              <View style={styles.chapterBadge}>
                <Text style={styles.chapterNumber}>{item.chapterNumber}</Text>
              </View>
              <View style={styles.info}>
                <Text style={typography.h3}>{item.title}</Text>
                <Text style={[typography.bodyMuted, styles.pages]}>
                  {item.startPage && item.endPage
                    ? `Pages ${item.startPage}–${item.endPage}`
                    : 'Page range not set yet'}
                </Text>
              </View>
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
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  icon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  meta: {
    marginTop: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    minWidth: 130,
  },
  deleteButton: {
    borderColor: colors.danger,
  },
  chaptersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chapterCard: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  chapterNumber: {
    color: colors.primary,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  pages: {
    marginTop: 2,
  },
});
