import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { submitDoubt } from '../../api/doubts.api';
import { extractErrorMessage } from '../../api/client';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Botany', 'Zoology', 'Mathematics'];

export default function AskDoubtScreen({ navigation }) {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [chapter, setChapter] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!chapter.trim() || !questionText.trim()) {
      setError('Please fill in the chapter and your question.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const doubt = await submitDoubt({ subject, chapter: chapter.trim(), questionText: questionText.trim() });
      navigation.replace('DoubtDetail', { doubtId: doubt._id });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Subject</Text>
        <View style={styles.subjectRow}>
          {SUBJECTS.map((value) => (
            <Button
              key={value}
              title={value}
              variant={subject === value ? 'primary' : 'outline'}
              onPress={() => setSubject(value)}
              style={styles.subjectButton}
            />
          ))}
        </View>

        <TextField
          label="Chapter"
          value={chapter}
          onChangeText={setChapter}
          placeholder="e.g. Human Reproduction"
        />
        <TextField
          label="Your doubt"
          value={questionText}
          onChangeText={setQuestionText}
          placeholder="Describe exactly what's confusing you…"
          multiline
          numberOfLines={5}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Submit doubt" onPress={handleSubmit} loading={isSubmitting} />
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
  },
  subjectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  subjectButton: {
    minWidth: 110,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
});
