import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { getMyBookmarks } from '../../api/bookmarks.api';
import { extractErrorMessage } from '../../api/client';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getMyBookmarks();
      setBookmarks(data);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') return <LoadingState label="Loading your bookmarks…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  return (
    <ScreenContainer>
      <Grid
        data={bookmarks}
        keyExtractor={(item) => item._id}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <ErrorState message="No bookmarks yet — tap the ☆ on a question while practicing to save it here." />
        }
        renderItem={({ item }) => {
          const question = item.questionId;
          return (
            <Card style={styles.card}>
              <View style={styles.tagsRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{question?.difficulty}</Text>
                </View>
                {question?.examTags?.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <Text style={typography.body}>{question?.questionText}</Text>
              {item.notes ? (
                <Text style={[typography.bodyMuted, styles.notes]}>Note: {item.notes}</Text>
              ) : null}
            </Card>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primaryMuted,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  notes: {
    marginTop: spacing.sm,
  },
});
