import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

export default function BookingConfirmationScreen({ route, navigation }) {
  const { booking } = route.params;
  const start = new Date(booking.slot.startTime);
  const end = new Date(booking.slot.endTime);
  const dateLabel = start.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  const timeLabel = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.check}>✅</Text>
        <Text style={typography.h2}>Session booked!</Text>
      </View>

      <Card style={styles.card}>
        <Text style={typography.h3}>{booking.mentor.name}</Text>
        <Text style={[typography.bodyMuted, styles.meta]}>{booking.mentor.rankInfo}</Text>
        <View style={styles.divider} />
        <Text style={typography.body}>{dateLabel}</Text>
        <Text style={[typography.bodyMuted, styles.meta]}>{timeLabel}</Text>
        <View style={styles.divider} />
        <Text style={typography.bodyMuted}>
          Payment: {booking.paymentType === 'free_streak_credit' ? 'Free streak session' : 'Paid'}
        </Text>
        <Text style={[typography.body, styles.meetingLink]}>{booking.meetingLink}</Text>
      </Card>

      <Button
        title="Back to More"
        onPress={() => navigation.navigate('MoreHub')}
        style={styles.button}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  check: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  card: {
    marginBottom: spacing.lg,
  },
  meta: {
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  meetingLink: {
    color: colors.primary,
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
  },
});
