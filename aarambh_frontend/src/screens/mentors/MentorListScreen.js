import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { listMentors } from '../../api/mentors.api';
import { extractErrorMessage } from '../../api/client';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';
import { hexToRgba } from '../../utils/color';

export default function MentorListScreen({ navigation }) {
  const [mentors, setMentors] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await listMentors();
      setMentors(data);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') return <LoadingState label="Loading mentors…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  return (
    <ScreenContainer>
      <Grid
        data={mentors}
        keyExtractor={(item) => item._id}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<ErrorState message="No mentors available right now." />}
        renderItem={({ item }) => (
          <Card
            onPress={() => navigation.navigate('MentorSlots', { mentorId: item._id, mentorName: item.name })}
            style={styles.card}
          >
            <View style={styles.row}>
              <View style={styles.avatarBadge}>
                <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
              </View>
              <View style={styles.info}>
                <Text style={typography.h3}>{item.name}</Text>
                <Text style={[typography.bodyMuted, styles.meta]}>{item.rankInfo}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>★ {item.rating}</Text>
              </View>
            </View>

            <Text style={[typography.bodyMuted, styles.college]}>{item.college}</Text>

            <View style={styles.tagsRow}>
              {item.subjects?.map((subject) => (
                <View key={subject} style={styles.tag}>
                  <Text style={styles.tagText}>{subject}</Text>
                </View>
              ))}
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.rate}>₹{item.hourlyRate} / session</Text>
              <Text style={styles.viewSlots}>View slots →</Text>
            </View>
          </Card>
        )}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    color: colors.textOnDark,
    fontWeight: '700',
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  meta: {
    marginTop: 2,
  },
  ratingBadge: {
    backgroundColor: hexToRgba(colors.warning, 0.14),
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  ratingText: {
    color: colors.warning,
    fontWeight: '700',
    fontSize: 12,
  },
  college: {
    marginTop: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
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
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rate: {
    ...typography.body,
    fontWeight: '700',
  },
  viewSlots: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
});
