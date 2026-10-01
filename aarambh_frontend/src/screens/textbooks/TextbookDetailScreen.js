import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { getTextbook } from '../../api/textbooks.api';
import { extractErrorMessage } from '../../api/client';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

export default function TextbookDetailScreen({ route, navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { code, title } = route.params;
  const [textbook, setTextbook] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getTextbook(code);
      setTextbook(data);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, [code]);

  useEffect(() => {
    navigation.setOptions({ title });
    load();
  }, [load, navigation, title]);

  if (status === 'loading') return <LoadingState label="Loading chapters…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  return (
    <ScreenContainer>
      <Grid
        data={textbook.chapters}
        keyExtractor={(item) => item._id}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<ErrorState message="No chapters published for this textbook yet." />}
        renderItem={({ item }) => (
          <Card
            onPress={() =>
              navigation.navigate('Chapter', {
                code,
                chapterNumber: item.chapterNumber,
                title: item.title,
              })
            }
            style={styles.card}
          >
            <View style={styles.row}>
              <View style={styles.chapterBadge}>
                <Text style={styles.chapterNumber}>{item.chapterNumber}</Text>
              </View>
              <View style={styles.info}>
                <Text style={typography.h3}>{item.title}</Text>
                <Text style={[typography.bodyMuted, styles.meta]}>
                  {item.totalPages} page{item.totalPages === 1 ? '' : 's'}
                  {item.description ? ` · ${item.description}` : ''}
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
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
  meta: {
    marginTop: 2,
  },
});
