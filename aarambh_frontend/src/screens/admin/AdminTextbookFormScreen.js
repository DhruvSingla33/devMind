import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import FilePickerButton from '../../components/FilePickerButton';
import { adminCreateTextbook, adminUpdateTextbook } from '../../api/textbooks.api';
import { extractErrorMessage } from '../../api/client';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

const SUBJECTS = ['Biology', 'Physics', 'Chemistry', 'Maths'];
const CLASS_LEVELS = ['XI', 'XII'];
const EXAM_TAGS = ['NEET', 'JEE', 'BOARDS'];

export default function AdminTextbookFormScreen({ route, navigation }) {
  const existing = route.params?.textbook;
  const isEditing = !!existing;

  const [title, setTitle] = useState(existing?.title || '');
  const [code, setCode] = useState(existing?.code || '');
  const [subject, setSubject] = useState(existing?.subject || SUBJECTS[0]);
  const [classLevel, setClassLevel] = useState(existing?.classLevel || CLASS_LEVELS[0]);
  const [publisher, setPublisher] = useState(existing?.publisher || 'NCERT');
  const [icon, setIcon] = useState(existing?.icon || '');
  const [color, setColor] = useState(existing?.color || '');
  const [examTags, setExamTags] = useState(existing?.examTags || ['NEET']);
  const [pdf, setPdf] = useState({ pdfUrl: existing?.pdfUrl, pdfFileKey: existing?.pdfFileKey });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const toggleExamTag = (tag) => {
    setExamTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !code.trim()) {
      setError('Title and code are required.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    const payload = {
      title: title.trim(),
      code: code.trim().toLowerCase(),
      subject,
      classLevel,
      publisher: publisher.trim() || 'NCERT',
      icon: icon.trim(),
      color: color.trim(),
      examTags,
      pdfUrl: pdf.pdfUrl || '',
      pdfFileKey: pdf.pdfFileKey || '',
    };
    try {
      if (isEditing) {
        await adminUpdateTextbook(existing._id, payload);
      } else {
        await adminCreateTextbook(payload);
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
        <Text style={typography.h2}>{isEditing ? 'Edit textbook' : 'New textbook'}</Text>

        <TextField label="Title" value={title} onChangeText={setTitle} placeholder="Biology 11th" />
        <TextField
          label="Code (unique, lowercase)"
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          placeholder="biology-11"
        />

        <Text style={styles.label}>Subject</Text>
        <View style={styles.row}>
          {SUBJECTS.map((value) => (
            <Button
              key={value}
              title={value}
              variant={subject === value ? 'primary' : 'outline'}
              onPress={() => setSubject(value)}
              style={styles.rowButton}
            />
          ))}
        </View>

        <Text style={styles.label}>Class level</Text>
        <View style={styles.row}>
          {CLASS_LEVELS.map((value) => (
            <Button
              key={value}
              title={value}
              variant={classLevel === value ? 'primary' : 'outline'}
              onPress={() => setClassLevel(value)}
              style={styles.rowButton}
            />
          ))}
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

        <TextField label="Publisher" value={publisher} onChangeText={setPublisher} />
        <TextField label="Icon (emoji, optional)" value={icon} onChangeText={setIcon} placeholder="🧬" />
        <TextField
          label="Accent color (hex, optional)"
          value={color}
          onChangeText={setColor}
          placeholder="#3dd68c"
        />

        <Text style={styles.label}>Textbook PDF</Text>
        <FilePickerButton
          label="Upload textbook PDF"
          accept="application/pdf"
          folder="textbooks"
          value={pdf.pdfUrl}
          onUploaded={({ fileKey, publicUrl }) => setPdf({ pdfFileKey: fileKey, pdfUrl: publicUrl })}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title={isEditing ? 'Save changes' : 'Create textbook'}
          onPress={handleSubmit}
          loading={isSubmitting}
        />
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
});
