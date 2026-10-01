import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { getBatch, enrollBatch } from '../../api/batches.api';
import { extractErrorMessage } from '../../api/client';
import { notify } from '../../utils/alert';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

export default function BatchDetailScreen({ route, navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { batchId } = route.params;
  const [batch, setBatch] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getBatch(batchId);
      setBatch(data);
      navigation.setOptions({ title: data.title });
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, [batchId, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      await enrollBatch(batchId);
      setIsEnrolled(true);
      setBatch((prev) => (prev ? { ...prev, enrolledStudentsCount: prev.enrolledStudentsCount + 1 } : prev));
    } catch (error) {
      notify('Could not enroll', extractErrorMessage(error));
    } finally {
      setIsEnrolling(false);
    }
  };

  if (status === 'loading') return <LoadingState label="Loading batch…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.h2}>{batch.title}</Text>
        <Text style={[typography.bodyMuted, styles.description]}>{batch.description}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{batch.price > 0 ? `₹${batch.price}` : 'Free'}</Text>
          {batch.originalPrice > batch.price ? (
            <Text style={styles.originalPrice}>₹{batch.originalPrice}</Text>
          ) : null}
        </View>

        {batch.features?.length ? (
          <Card style={styles.card}>
            <Text style={typography.h3}>What's included</Text>
            {batch.features.map((feature) => (
              <Text key={feature} style={[typography.body, styles.listItem]}>
                • {feature}
              </Text>
            ))}
          </Card>
        ) : null}

        {batch.teachers?.length ? (
          <Card style={styles.card}>
            <Text style={typography.h3}>Teachers</Text>
            {batch.teachers.map((teacher, index) => (
              <View key={`${teacher.name}-${index}`} style={styles.teacherRow}>
                <Text style={typography.body}>{teacher.name}</Text>
                <Text style={typography.bodyMuted}>
                  {teacher.subject} · {teacher.experience}
                </Text>
              </View>
            ))}
          </Card>
        ) : null}

        {batch.schedule?.length ? (
          <Card style={styles.card}>
            <Text style={typography.h3}>Schedule</Text>
            {batch.schedule.map((slot, index) => (
              <Text key={index} style={[typography.bodyMuted, styles.listItem]}>
                {slot.day} · {slot.subject} ({slot.topic}) — {slot.time}
              </Text>
            ))}
          </Card>
        ) : null}

        <Text style={[typography.caption, styles.enrolled]}>
          {batch.enrolledStudentsCount} students enrolled
        </Text>

        <Button
          title={isEnrolled ? 'Enrolled ✓' : 'Enroll now'}
          onPress={handleEnroll}
          loading={isEnrolling}
          disabled={isEnrolled}
          style={styles.enrollButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const makeStyles = ({ colors, typography }) => StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  description: {
    marginTop: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  originalPrice: {
    ...typography.bodyMuted,
    textDecorationLine: 'line-through',
  },
  card: {
    marginTop: spacing.lg,
  },
  listItem: {
    marginTop: spacing.xs,
  },
  teacherRow: {
    marginTop: spacing.sm,
  },
  enrolled: {
    marginTop: spacing.lg,
    color: colors.textMuted,
  },
  enrollButton: {
    marginTop: spacing.md,
  },
});
