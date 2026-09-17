import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { getMyDoubts } from '../../api/doubts.api';
import { extractErrorMessage } from '../../api/client';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

const STATUS_COLORS = {
  PENDING: colors.warning,
  IN_PROGRESS: colors.primary,
  RESOLVED: colors.success,
};

export default function MyDoubtsScreen({ navigation }) {
  const [doubts, setDoubts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getMyDoubts();
      setDoubts(data);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') return <LoadingState label="Loading your doubts…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Button title="+ Ask a doubt" onPress={() => navigation.navigate('AskDoubt')} />
      </View>
      <Grid
        data={doubts}
        keyExtractor={(item) => item._id}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <ErrorState message="No doubts yet — ask one above whenever you're stuck." />
        }
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate('DoubtDetail', { doubtId: item._id })} style={styles.card}>
            <View style={styles.row}>
              <Text style={[typography.caption, { color: STATUS_COLORS[item.status] }]}>
                {item.status?.replace('_', ' ')}
              </Text>
            </View>
            <Text style={typography.h3}>{item.subject} · {item.chapter}</Text>
            <Text style={[typography.bodyMuted, styles.meta]} numberOfLines={2}>
              {item.questionText}
            </Text>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: spacing.md,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    marginTop: spacing.xs,
  },
});
