import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { adminCreateBatch, adminUpdateBatch } from '../../api/batches.api';
import { extractErrorMessage } from '../../api/client';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

const TARGET_EXAMS = ['NEET', 'JEE_MAIN', 'JEE_ADVANCED', 'BOARD_12', 'BOARD_10'];

export default function AdminBatchFormScreen({ route, navigation }) {
  const existing = route.params?.batch;
  const isEditing = !!existing;

  const [title, setTitle] = useState(existing?.title || '');
  const [targetExam, setTargetExam] = useState(existing?.targetExam || TARGET_EXAMS[0]);
  const [targetYear, setTargetYear] = useState(String(existing?.targetYear || '2026'));
  const [description, setDescription] = useState(existing?.description || '');
  const [price, setPrice] = useState(String(existing?.price ?? '0'));
  const [originalPrice, setOriginalPrice] = useState(String(existing?.originalPrice ?? '0'));
  const [featuresText, setFeaturesText] = useState((existing?.features || []).join('\n'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    const payload = {
      title: title.trim(),
      targetExam,
      targetYear: Number(targetYear) || 2026,
      description: description.trim(),
      price: Number(price) || 0,
      originalPrice: Number(originalPrice) || 0,
      features: featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
    };
    try {
      if (isEditing) {
        await adminUpdateBatch(existing._id, payload);
      } else {
        await adminCreateBatch(payload);
      }
      navigation.goBack();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer maxWidth={640}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={typography.h2}>{isEditing ? 'Edit batch' : 'New batch'}</Text>

        <TextField label="Title" value={title} onChangeText={setTitle} placeholder="NEET 2026 Crash Course" />

        <Text style={styles.label}>Target exam</Text>
        <View style={styles.row}>
          {TARGET_EXAMS.map((value) => (
            <Button
              key={value}
              title={value.replace('_', ' ')}
              variant={targetExam === value ? 'primary' : 'outline'}
              onPress={() => setTargetExam(value)}
              style={styles.rowButton}
            />
          ))}
        </View>

        <TextField label="Target year" value={targetYear} onChangeText={setTargetYear} keyboardType="number-pad" />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
        <View style={styles.inlineRow}>
          <TextField label="Price (₹)" value={price} onChangeText={setPrice} keyboardType="number-pad" style={styles.inlineField} />
          <TextField
            label="Original price (₹)"
            value={originalPrice}
            onChangeText={setOriginalPrice}
            keyboardType="number-pad"
            style={styles.inlineField}
          />
        </View>
        <TextField
          label="Features (one per line)"
          value={featuresText}
          onChangeText={setFeaturesText}
          multiline
          numberOfLines={4}
          placeholder={'Daily live classes\nWeekly mock tests\n1:1 doubt sessions'}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title={isEditing ? 'Save changes' : 'Create batch'} onPress={handleSubmit} loading={isSubmitting} />
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  rowButton: {
    minWidth: 100,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inlineField: {
    flex: 1,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
});
