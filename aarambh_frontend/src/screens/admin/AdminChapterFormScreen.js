import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import {
  adminCreateChapter,
  adminUpdateChapter,
  adminDeleteChapter,
} from '../../api/textbooks.api';
import { extractErrorMessage } from '../../api/client';
import { confirmAsync } from '../../utils/alert';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

const EXAM_TAGS = ['NEET', 'JEE', 'BOARDS'];

export default function AdminChapterFormScreen({ route, navigation }) {
  const { textbookId, chapter: existing } = route.params;
  const isEditing = !!existing;

  const [chapterNumber, setChapterNumber] = useState(String(existing?.chapterNumber || ''));
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [startPage, setStartPage] = useState(existing?.startPage ? String(existing.startPage) : '');
  const [endPage, setEndPage] = useState(existing?.endPage ? String(existing.endPage) : '');
  const [examTags, setExamTags] = useState(existing?.examTags || ['NEET']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const toggleExamTag = (tag) => {
    setExamTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !chapterNumber) {
      setError('Chapter number and title are required.');
      return;
    }
    const parsedChapterNumber = Number(chapterNumber);
    if (!Number.isInteger(parsedChapterNumber) || parsedChapterNumber < 1) {
      setError('Chapter number must be a whole number, e.g. 1, 2, 3…');
      return;
    }

    const parsedStart = startPage ? Number(startPage) : null;
    const parsedEnd = endPage ? Number(endPage) : null;
    if ((parsedStart && !parsedEnd) || (!parsedStart && parsedEnd)) {
      setError('Fill in both the start page and end page, or leave both blank.');
      return;
    }
    if (parsedStart && parsedEnd && (!Number.isInteger(parsedStart) || !Number.isInteger(parsedEnd) || parsedStart < 1 || parsedEnd < parsedStart)) {
      setError('Start/end page must be whole numbers, with end page ≥ start page.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const payload = {
      chapterNumber: parsedChapterNumber,
      title: title.trim(),
      description: description.trim(),
      startPage: parsedStart,
      endPage: parsedEnd,
      totalPages: parsedStart && parsedEnd ? parsedEnd - parsedStart + 1 : 1,
      examTags,
    };
    try {
      if (isEditing) {
        await adminUpdateChapter(existing._id, payload);
      } else {
        await adminCreateChapter(textbookId, payload);
      }
      navigation.goBack();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirmAsync('Delete chapter?', 'This cannot be undone.', 'Delete');
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      await adminDeleteChapter(existing._id);
      navigation.goBack();
    } catch (err) {
      setError(extractErrorMessage(err));
      setIsDeleting(false);
    }
  };

  return (
    <ScreenContainer maxWidth={640}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={typography.h2}>{isEditing ? 'Edit chapter' : 'New chapter'}</Text>

        <TextField
          label="Chapter number"
          value={chapterNumber}
          onChangeText={setChapterNumber}
          keyboardType="number-pad"
          placeholder="1"
        />
        <TextField label="Title" value={title} onChangeText={setTitle} placeholder="The Living World" />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Diversity in living organisms…"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Pages in the textbook PDF</Text>
        <Text style={[typography.bodyMuted, styles.hint]}>
          No need to upload a separate PDF for this chapter — set which pages of the textbook's
          PDF belong to it, and readers will see just those pages.
        </Text>
        <View style={styles.inlineRow}>
          <TextField
            label="Start page"
            value={startPage}
            onChangeText={setStartPage}
            keyboardType="number-pad"
            placeholder="1"
            style={styles.inlineField}
          />
          <TextField
            label="End page"
            value={endPage}
            onChangeText={setEndPage}
            keyboardType="number-pad"
            placeholder="14"
            style={styles.inlineField}
          />
        </View>

        <Text style={styles.label}>Exam tags</Text>
        <View style={styles.row}>
          {EXAM_TAGS.map((tag) => (
            <Button
              key={tag}
              title={tag}
              variant={examTags.includes(tag) ? 'primary' : 'outline'}
              onPress={() => toggleExamTag(tag)}
              style={styles.rowButton}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title={isEditing ? 'Save changes' : 'Create chapter'}
          onPress={handleSubmit}
          loading={isSubmitting}
        />

        {isEditing ? (
          <>
            <Button
              title="Manage content pages"
              variant="outline"
              onPress={() =>
                navigation.navigate('AdminChapterPages', {
                  chapterId: existing._id,
                  textbookId,
                  chapterTitle: existing.title,
                })
              }
              style={styles.pagesButton}
            />
            <Button
              title="Delete chapter"
              variant="outline"
              loading={isDeleting}
              onPress={handleDelete}
              style={styles.deleteButton}
            />
          </>
        ) : null}
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
  hint: {
    marginBottom: spacing.sm,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inlineField: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  rowButton: {
    minWidth: 90,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
  pagesButton: {
    marginTop: spacing.md,
  },
  deleteButton: {
    marginTop: spacing.md,
    borderColor: colors.danger,
  },
});
