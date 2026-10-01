import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { listMentors, adminCreateMentor, adminAddMentorSlots } from '../../api/mentors.api';
import { extractErrorMessage } from '../../api/client';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

export default function AdminMentorFormScreen() {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  // --- create mentor ---
  const [name, setName] = useState('');
  const [rankInfo, setRankInfo] = useState('');
  const [college, setCollege] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('499');
  const [subjectsText, setSubjectsText] = useState('NEET Strategy, Physics, Biology');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(null);

  // --- add slots to existing mentor ---
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [slotDate, setSlotDate] = useState('');
  const [slotStart, setSlotStart] = useState('');
  const [slotEnd, setSlotEnd] = useState('');
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [slotError, setSlotError] = useState(null);
  const [slotSuccess, setSlotSuccess] = useState(null);

  const loadMentors = () => listMentors().then(setMentors).catch(() => setMentors([]));

  useEffect(() => {
    loadMentors();
  }, []);

  const handleCreateMentor = async () => {
    if (!name.trim() || !rankInfo.trim() || !college.trim()) {
      setCreateError('Name, rank info, and college are required.');
      return;
    }
    setCreateError(null);
    setCreateSuccess(null);
    setIsCreating(true);
    try {
      await adminCreateMentor({
        name: name.trim(),
        rankInfo: rankInfo.trim(),
        college: college.trim(),
        bio: bio.trim(),
        hourlyRate: Number(hourlyRate) || 499,
        subjects: subjectsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setCreateSuccess(`Mentor "${name.trim()}" created.`);
      setName('');
      setRankInfo('');
      setCollege('');
      setBio('');
      loadMentors();
    } catch (err) {
      setCreateError(extractErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddSlot = async () => {
    if (!selectedMentor || !slotDate || !slotStart || !slotEnd) {
      setSlotError('Pick a mentor and fill in date, start time, and end time.');
      return;
    }
    const startTime = new Date(`${slotDate}T${slotStart}:00`);
    const endTime = new Date(`${slotDate}T${slotEnd}:00`);
    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      setSlotError('Use date as YYYY-MM-DD and time as HH:MM (24-hour).');
      return;
    }
    setSlotError(null);
    setSlotSuccess(null);
    setIsAddingSlot(true);
    try {
      await adminAddMentorSlots(selectedMentor._id, [
        { startTime: startTime.toISOString(), endTime: endTime.toISOString() },
      ]);
      setSlotSuccess('Slot added.');
      setSlotDate('');
      setSlotStart('');
      setSlotEnd('');
    } catch (err) {
      setSlotError(extractErrorMessage(err));
    } finally {
      setIsAddingSlot(false);
    }
  };

  return (
    <ScreenContainer maxWidth={640}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={typography.h2}>New mentor</Text>
        <TextField label="Name" value={name} onChangeText={setName} placeholder="Dr. Aisha Khan" />
        <TextField
          label="Rank info"
          value={rankInfo}
          onChangeText={setRankInfo}
          placeholder="NEET 2024 AIR 142"
        />
        <TextField label="College" value={college} onChangeText={setCollege} placeholder="AIIMS New Delhi" />
        <TextField label="Bio (optional)" value={bio} onChangeText={setBio} multiline numberOfLines={2} />
        <TextField
          label="Hourly rate (₹)"
          value={hourlyRate}
          onChangeText={setHourlyRate}
          keyboardType="number-pad"
        />
        <TextField
          label="Subjects (comma separated)"
          value={subjectsText}
          onChangeText={setSubjectsText}
        />
        {createError ? <Text style={styles.error}>{createError}</Text> : null}
        {createSuccess ? <Text style={styles.success}>✓ {createSuccess}</Text> : null}
        <Button title="Create mentor" onPress={handleCreateMentor} loading={isCreating} />

        <View style={styles.divider} />

        <Text style={typography.h2}>Add a booking slot</Text>
        <Text style={[typography.bodyMuted, styles.subtitle]}>Pick a mentor</Text>
        <View style={styles.mentorRow}>
          {mentors.map((mentor) => (
            <Button
              key={mentor._id}
              title={mentor.name}
              variant={selectedMentor?._id === mentor._id ? 'primary' : 'outline'}
              onPress={() => setSelectedMentor(mentor)}
              style={styles.mentorChip}
            />
          ))}
        </View>

        {selectedMentor ? (
          <Card style={styles.slotCard}>
            <TextField label="Date (YYYY-MM-DD)" value={slotDate} onChangeText={setSlotDate} placeholder="2026-09-20" />
            <View style={styles.inlineRow}>
              <TextField
                label="Start (HH:MM)"
                value={slotStart}
                onChangeText={setSlotStart}
                placeholder="18:00"
                style={styles.inlineField}
              />
              <TextField
                label="End (HH:MM)"
                value={slotEnd}
                onChangeText={setSlotEnd}
                placeholder="18:30"
                style={styles.inlineField}
              />
            </View>
            {slotError ? <Text style={styles.error}>{slotError}</Text> : null}
            {slotSuccess ? <Text style={styles.success}>✓ {slotSuccess}</Text> : null}
            <Button title="Add slot" onPress={handleAddSlot} loading={isAddingSlot} />
          </Card>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
  success: {
    color: colors.success,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xl,
  },
  subtitle: {
    marginBottom: spacing.sm,
  },
  mentorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  mentorChip: {
    minWidth: 100,
  },
  slotCard: {
    marginTop: spacing.sm,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inlineField: {
    flex: 1,
  },
});
