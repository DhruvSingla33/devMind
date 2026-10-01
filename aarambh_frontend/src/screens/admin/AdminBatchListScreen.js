import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { listBatches, adminDeleteBatch } from '../../api/batches.api';
import { extractErrorMessage } from '../../api/client';
import { confirmAsync, notify } from '../../utils/alert';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

export default function AdminBatchListScreen({ navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [batches, setBatches] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await listBatches();
      setBatches(data);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const handleDelete = async (batch) => {
    const confirmed = await confirmAsync('Delete batch?', 'This cannot be undone.', 'Delete');
    if (!confirmed) return;
    try {
      await adminDeleteBatch(batch._id);
      setBatches((prev) => prev.filter((b) => b._id !== batch._id));
    } catch (error) {
      notify('Could not delete batch', extractErrorMessage(error));
    }
  };

  if (status === 'loading') return <LoadingState label="Loading batches…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Button title="+ New batch" onPress={() => navigation.navigate('AdminBatchForm')} />
      </View>
      <Grid
        data={batches}
        keyExtractor={(item) => item._id}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<ErrorState message="No batches yet — create one above." />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={typography.h3}>{item.title}</Text>
            <Text style={[typography.bodyMuted, styles.meta]}>
              {item.targetExam} · {item.price > 0 ? `₹${item.price}` : 'Free'}
            </Text>
            <View style={styles.actionRow}>
              <Button
                title="Edit"
                variant="outline"
                onPress={() => navigation.navigate('AdminBatchForm', { batch: item })}
                style={styles.actionButton}
              />
              <Button
                title="Delete"
                variant="outline"
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
  header: {
    paddingVertical: spacing.md,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
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
    flex: 1,
  },
  deleteButton: {
    borderColor: colors.danger,
  },
});
