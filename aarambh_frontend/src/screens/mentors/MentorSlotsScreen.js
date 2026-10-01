import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { getMentorSlots, getMyStreak, bookMentorSession } from '../../api/mentors.api';
import { extractErrorMessage } from '../../api/client';
import { radius, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

function formatSlot(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const dateLabel = start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  const startLabel = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endLabel = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${dateLabel} · ${startLabel} – ${endLabel}`;
}

export default function MentorSlotsScreen({ route, navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { mentorId, mentorName } = route.params;
  const [slotsData, setSlotsData] = useState(null);
  const [hasFreeCredit, setHasFreeCredit] = useState(false);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [paymentType, setPaymentType] = useState('paid');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getMentorSlots(mentorId);
      setSlotsData(data);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
      return;
    }
    try {
      const streak = await getMyStreak();
      setHasFreeCredit(!!streak.hasFreeMentorSessionCredit);
    } catch (error) {
      setHasFreeCredit(false);
    }
  }, [mentorId]);

  useEffect(() => {
    navigation.setOptions({ title: mentorName || 'Mentor' });
    load();
  }, [load, navigation, mentorName]);

  if (status === 'loading') return <LoadingState label="Loading available slots…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  const { mentor, slots } = slotsData;
  const availableSlots = slots.filter((slot) => !slot.isBooked);

  const handleBook = async () => {
    if (!selectedSlotId) return;
    setBookingError(null);
    setIsBooking(true);
    try {
      const booking = await bookMentorSession({ mentorId, slotId: selectedSlotId, paymentType });
      navigation.replace('BookingConfirmation', { booking });
    } catch (error) {
      setBookingError(extractErrorMessage(error));
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.mentorCard}>
          <Text style={typography.h3}>{mentor.name}</Text>
          <Text style={[typography.bodyMuted, styles.meta]}>{mentor.rankInfo}</Text>
          <Text style={[typography.bodyMuted, styles.meta]}>{mentor.college}</Text>
          <Text style={styles.rate}>₹{mentor.hourlyRate} / session</Text>
        </Card>

        <Text style={styles.label}>Pick a slot</Text>
        {availableSlots.length === 0 ? (
          <Text style={typography.bodyMuted}>No open slots right now — check back later.</Text>
        ) : (
          availableSlots.map((slot) => {
            const isSelected = selectedSlotId === slot._id;
            return (
              <Card
                key={slot._id}
                onPress={() => setSelectedSlotId(slot._id)}
                style={[styles.slotCard, isSelected && styles.slotCardSelected]}
              >
                <Text style={typography.body}>{formatSlot(slot.startTime, slot.endTime)}</Text>
              </Card>
            );
          })
        )}

        {selectedSlotId ? (
          <>
            <Text style={styles.label}>Payment</Text>
            <View style={styles.paymentRow}>
              <Button
                title="Pay ₹ (Paid)"
                variant={paymentType === 'paid' ? 'primary' : 'outline'}
                onPress={() => setPaymentType('paid')}
                style={styles.paymentButton}
              />
              {hasFreeCredit && (
                <Button
                  title="Use free session"
                  variant={paymentType === 'free_streak_credit' ? 'primary' : 'outline'}
                  onPress={() => setPaymentType('free_streak_credit')}
                  style={styles.paymentButton}
                />
              )}
            </View>

            {bookingError ? <Text style={styles.error}>{bookingError}</Text> : null}

            <Button title="Book session" onPress={handleBook} loading={isBooking} />
          </>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const makeStyles = ({ colors, typography }) => StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  mentorCard: {
    marginBottom: spacing.lg,
  },
  meta: {
    marginTop: 2,
  },
  rate: {
    ...typography.body,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  slotCard: {
    marginBottom: spacing.sm,
  },
  slotCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  paymentButton: {
    flex: 1,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
});
