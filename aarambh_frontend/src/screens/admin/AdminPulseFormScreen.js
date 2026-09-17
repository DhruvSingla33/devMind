import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { adminCreatePulse } from '../../api/pulse.api';
import { extractErrorMessage } from '../../api/client';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminPulseFormScreen() {
  const [date, setDate] = useState(todayIso());
  const [title, setTitle] = useState('Aarambh Daily 5-Minute Memory Workout');
  const [puzzles, setPuzzles] = useState([{ term: '', definition: '', category: 'Formula' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const updatePuzzle = (index, field, value) => {
    setPuzzles((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const addPuzzle = () => {
    setPuzzles((prev) => [...prev, { term: '', definition: '', category: 'Formula' }]);
  };

  const removePuzzle = (index) => {
    setPuzzles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!date.trim()) {
      setError('Date is required (YYYY-MM-DD).');
      return;
    }
    const cleaned = puzzles.filter((p) => p.term.trim() && p.definition.trim());
    if (cleaned.length === 0) {
      setError('Add at least one puzzle with both a term and a definition.');
      return;
    }
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      await adminCreatePulse({
        date: date.trim(),
        title: title.trim(),
        puzzles: cleaned,
      });
      setSuccess(`Published Aarambh Pulse for ${date.trim()}.`);
      setPuzzles([{ term: '', definition: '', category: 'Formula' }]);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer maxWidth={640}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={typography.h2}>Publish Aarambh Pulse</Text>

        <TextField label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <TextField label="Title" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Puzzles</Text>
        {puzzles.map((puzzle, index) => (
          <Card key={index} style={styles.puzzleCard}>
            <TextField
              label="Term"
              value={puzzle.term}
              onChangeText={(value) => updatePuzzle(index, 'term', value)}
              placeholder="e.g. Kreb's cycle"
            />
            <TextField
              label="Definition"
              value={puzzle.definition}
              onChangeText={(value) => updatePuzzle(index, 'definition', value)}
              placeholder="e.g. A series of chemical reactions releasing stored energy…"
              multiline
              numberOfLines={2}
            />
            <TextField
              label="Category"
              value={puzzle.category}
              onChangeText={(value) => updatePuzzle(index, 'category', value)}
              placeholder="Formula / Term / Sequence"
            />
            {puzzles.length > 1 ? (
              <Button
                title="Remove"
                variant="ghost"
                onPress={() => removePuzzle(index)}
                style={styles.removeButton}
              />
            ) : null}
          </Card>
        ))}

        <Button title="+ Add another puzzle" variant="outline" onPress={addPuzzle} style={styles.addButton} />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>✓ {success}</Text> : null}

        <Button title="Publish" onPress={handleSubmit} loading={isSubmitting} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  puzzleCard: {
    marginBottom: spacing.md,
  },
  removeButton: {
    alignSelf: 'flex-start',
  },
  addButton: {
    marginBottom: spacing.lg,
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
});
