import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { listBatches } from '../../api/batches.api';
import { extractErrorMessage } from '../../api/client';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

const EXAM_FILTERS = [
  { value: undefined, label: 'All' },
  { value: 'NEET', label: 'NEET' },
  { value: 'JEE_MAIN', label: 'JEE Main' },
  { value: 'JEE_ADVANCED', label: 'JEE Advanced' },
  { value: 'BOARD_12', label: 'Board XII' },
  { value: 'BOARD_10', label: 'Board X' },
];

export default function BatchListScreen({ navigation }) {
  const [exam, setExam] = useState(undefined);
  const [batches, setBatches] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);

  const load = useCallback(async (targetExam) => {
    setStatus('loading');
    try {
      const data = await listBatches(targetExam ? { targetExam } : {});
      setBatches(data);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load(exam);
  }, [load, exam]);

  return (
    <ScreenContainer>
      <View style={styles.filterRow}>
        {EXAM_FILTERS.map((filter) => (
          <Button
            key={filter.label}
            title={filter.label}
            variant={exam === filter.value ? 'primary' : 'outline'}
            onPress={() => setExam(filter.value)}
            style={styles.filterButton}
          />
        ))}
      </View>

      {status === 'loading' ? (
        <LoadingState label="Loading batches…" />
      ) : status === 'error' ? (
        <ErrorState message={errorMessage} onRetry={() => load(exam)} />
      ) : (
        <Grid
          data={batches}
          keyExtractor={(item) => item._id}
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<ErrorState message="No batches published for this exam yet." />}
          renderItem={({ item }) => (
            <Card onPress={() => navigation.navigate('BatchDetail', { batchId: item._id })} style={styles.card}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.targetExam?.replace('_', ' ')}</Text>
              </View>
              <Text style={typography.h3}>{item.title}</Text>
              <Text style={[typography.bodyMuted, styles.meta]} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.row}>
                <Text style={styles.price}>{item.price > 0 ? `₹${item.price}` : 'Free'}</Text>
                <Text style={[typography.caption, styles.enrolled]}>
                  {item.enrolledStudentsCount} enrolled
                </Text>
              </View>
            </Card>
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  filterButton: {
    minWidth: 90,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.sm,
  },
  tagText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  meta: {
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  price: {
    ...typography.body,
    fontWeight: '700',
  },
  enrolled: {
    color: colors.textMuted,
  },
});
