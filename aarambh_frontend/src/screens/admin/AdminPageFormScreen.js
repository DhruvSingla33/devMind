import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { adminCreatePage, adminUpdatePage } from '../../api/textbooks.api';
import { extractErrorMessage } from '../../api/client';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

const BLOCK_TYPES = ['text', 'image', 'table'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

// A fresh content block with all fields present, so switching `type` never
// leaves an undefined field bound to a TextInput.
const newBlock = (type = 'text') => ({
  type,
  textBody: '',
  imageUrl: '',
  imageCaption: '',
  imageAlt: '',
  tableCaption: '',
  tableRaw: '',
});

const newSection = () => ({ heading: '', contents: [newBlock('text')] });

const newQuestion = () => ({
  questionText: '',
  options: ['', '', '', ''],
  correctOptionIndex: null,
  explanation: '',
  difficulty: 'medium',
});

// "a | b | c" per line -> [["a","b","c"], ...]
const parseTable = (raw) =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split('|').map((cell) => cell.trim()));

// --- Server shape -> editable form state (edit mode) ---
const mapServerBlock = (c) => ({
  ...newBlock(c.type || 'text'),
  textBody: c.text?.body || '',
  imageUrl: c.image?.url || '',
  imageCaption: c.image?.caption || '',
  imageAlt: c.image?.alt || '',
  tableCaption: c.table?.caption || '',
  tableRaw: (c.table?.rows || []).map((row) => row.join(' | ')).join('\n'),
});

const mapServerSection = (s) => ({
  heading: s.heading || '',
  contents: s.contents?.length ? s.contents.map(mapServerBlock) : [newBlock('text')],
});

const mapServerQuestion = (q) => ({
  questionText: q.questionText || '',
  options: [0, 1, 2, 3].map((i) => q.options?.[i]?.text || ''),
  correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : null,
  explanation: q.explanation || '',
  difficulty: q.difficulty || 'medium',
});

export default function AdminPageFormScreen({ route, navigation }) {
  const { chapterId, textbookId, page: existing } = route.params;
  const isEditing = !!existing;

  const [pageNumber, setPageNumber] = useState(
    existing?.pageNumber ? String(existing.pageNumber) : ''
  );
  const [title, setTitle] = useState(existing?.title || '');
  const [sections, setSections] = useState(
    existing?.sections?.length ? existing.sections.map(mapServerSection) : [newSection()]
  );
  const [quiz, setQuiz] = useState(
    existing?.quiz?.length ? existing.quiz.map(mapServerQuestion) : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- Section + block mutations ---
  const updateSection = (si, patch) =>
    setSections((prev) => prev.map((s, i) => (i === si ? { ...s, ...patch } : s)));

  const addSection = () => setSections((prev) => [...prev, newSection()]);
  const removeSection = (si) => setSections((prev) => prev.filter((_, i) => i !== si));

  const updateBlock = (si, bi, patch) =>
    setSections((prev) =>
      prev.map((s, i) =>
        i === si
          ? { ...s, contents: s.contents.map((b, j) => (j === bi ? { ...b, ...patch } : b)) }
          : s
      )
    );

  const addBlock = (si, type) =>
    setSections((prev) =>
      prev.map((s, i) => (i === si ? { ...s, contents: [...s.contents, newBlock(type)] } : s))
    );

  const removeBlock = (si, bi) =>
    setSections((prev) =>
      prev.map((s, i) =>
        i === si ? { ...s, contents: s.contents.filter((_, j) => j !== bi) } : s
      )
    );

  // --- Quiz mutations ---
  const addQuestion = () => setQuiz((prev) => [...prev, newQuestion()]);
  const removeQuestion = (qi) => setQuiz((prev) => prev.filter((_, i) => i !== qi));
  const updateQuestion = (qi, patch) =>
    setQuiz((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
  const updateOption = (qi, oi, value) =>
    setQuiz((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) } : q
      )
    );

  const buildPayload = () => {
    const sectionsPayload = sections.map((s) => ({
      heading: s.heading.trim(),
      contents: s.contents
        .map((b) => {
          if (b.type === 'text') {
            return b.textBody.trim() ? { type: 'text', text: { body: b.textBody.trim() } } : null;
          }
          if (b.type === 'image') {
            return b.imageUrl.trim()
              ? {
                  type: 'image',
                  image: {
                    url: b.imageUrl.trim(),
                    caption: b.imageCaption.trim(),
                    alt: b.imageAlt.trim(),
                  },
                }
              : null;
          }
          const rows = parseTable(b.tableRaw);
          return rows.length
            ? { type: 'table', table: { caption: b.tableCaption.trim(), rows } }
            : null;
        })
        .filter(Boolean),
    }));

    const quizPayload = quiz.map((q) => ({
      questionText: q.questionText.trim(),
      options: q.options.map((text) => ({ text: text.trim() })),
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation.trim(),
      difficulty: q.difficulty,
    }));

    return { sectionsPayload, quizPayload };
  };

  const validate = ({ sectionsPayload, quizPayload }) => {
    const hasSectionContent = sectionsPayload.some((s) => s.contents.length > 0);
    if (!hasSectionContent && quizPayload.length === 0) {
      return 'Add at least one content block or quiz question before saving.';
    }
    for (let i = 0; i < quizPayload.length; i += 1) {
      const q = quizPayload[i];
      if (!q.questionText || q.options.some((o) => !o.text)) {
        return `Quiz question ${i + 1}: fill in the question and all 4 options.`;
      }
      if (q.correctOptionIndex === null || q.correctOptionIndex === undefined) {
        return `Quiz question ${i + 1}: pick the correct option.`;
      }
      if (!q.explanation) {
        return `Quiz question ${i + 1}: add an explanation.`;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const { sectionsPayload, quizPayload } = buildPayload();
    const validationError = validate({ sectionsPayload, quizPayload });
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const payload = {
      title: title.trim(),
      // Blank -> backend auto-assigns the next page number in the book.
      ...(pageNumber ? { pageNumber: Number(pageNumber) } : {}),
      sections: sectionsPayload,
      quiz: quizPayload,
    };
    try {
      if (isEditing) {
        await adminUpdatePage(existing._id, payload);
      } else {
        await adminCreatePage(textbookId, payload);
      }
      navigation.goBack();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer maxWidth={720}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={typography.h2}>{isEditing ? 'Edit page' : 'New page'}</Text>
        <Text style={[typography.bodyMuted, styles.intro]}>
          Build a page with any number of sections and quiz questions.
        </Text>

        <View style={styles.inlineRow}>
          <TextField
            label="Page number (optional)"
            value={pageNumber}
            onChangeText={setPageNumber}
            keyboardType="number-pad"
            placeholder="auto"
            style={styles.inlineField}
          />
          <TextField
            label="Page title (optional)"
            value={title}
            onChangeText={setTitle}
            placeholder="Introduction"
            style={styles.inlineFieldWide}
          />
        </View>

        {/* --- Sections --- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={typography.h3}>Sections</Text>
          <Button title="+ Section" variant="outline" onPress={addSection} style={styles.smallBtn} />
        </View>

        {sections.map((section, si) => (
          <Card key={si} style={styles.blockCard}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Section {si + 1}</Text>
              {sections.length > 1 ? (
                <Button
                  title="Remove"
                  variant="ghost"
                  onPress={() => removeSection(si)}
                  textColor={colors.danger}
                  style={styles.removeBtn}
                />
              ) : null}
            </View>

            <TextField
              label="Heading (optional)"
              value={section.heading}
              onChangeText={(v) => updateSection(si, { heading: v })}
              placeholder="What is biology?"
            />

            {section.contents.map((block, bi) => (
              <View key={bi} style={styles.blockInner}>
                <View style={styles.blockTypeRow}>
                  {BLOCK_TYPES.map((t) => (
                    <Button
                      key={t}
                      title={t}
                      variant={block.type === t ? 'primary' : 'outline'}
                      onPress={() => updateBlock(si, bi, { type: t })}
                      style={styles.typeBtn}
                    />
                  ))}
                  {section.contents.length > 1 ? (
                    <Button
                      title="✕"
                      variant="ghost"
                      onPress={() => removeBlock(si, bi)}
                      textColor={colors.danger}
                      style={styles.removeBtn}
                    />
                  ) : null}
                </View>

                {block.type === 'text' ? (
                  <TextField
                    value={block.textBody}
                    onChangeText={(v) => updateBlock(si, bi, { textBody: v })}
                    placeholder="Paragraph text…"
                    multiline
                    numberOfLines={4}
                  />
                ) : null}

                {block.type === 'image' ? (
                  <>
                    <TextField
                      label="Image URL"
                      value={block.imageUrl}
                      onChangeText={(v) => updateBlock(si, bi, { imageUrl: v })}
                      placeholder="https://…/diagram.png"
                      autoCapitalize="none"
                    />
                    <TextField
                      label="Caption (optional)"
                      value={block.imageCaption}
                      onChangeText={(v) => updateBlock(si, bi, { imageCaption: v })}
                      placeholder="Fig 1.1 — The cell"
                    />
                    <TextField
                      label="Alt text (optional)"
                      value={block.imageAlt}
                      onChangeText={(v) => updateBlock(si, bi, { imageAlt: v })}
                      placeholder="Labelled cell diagram"
                    />
                  </>
                ) : null}

                {block.type === 'table' ? (
                  <>
                    <TextField
                      label="Table caption (optional)"
                      value={block.tableCaption}
                      onChangeText={(v) => updateBlock(si, bi, { tableCaption: v })}
                      placeholder="Comparison of cell types"
                    />
                    <TextField
                      label="Rows (one per line, cells split by | )"
                      value={block.tableRaw}
                      onChangeText={(v) => updateBlock(si, bi, { tableRaw: v })}
                      placeholder={'Feature | Plant | Animal\nCell wall | Yes | No'}
                      multiline
                      numberOfLines={4}
                    />
                  </>
                ) : null}
              </View>
            ))}

            <View style={styles.addBlockRow}>
              {BLOCK_TYPES.map((t) => (
                <Button
                  key={t}
                  title={`+ ${t}`}
                  variant="outline"
                  onPress={() => addBlock(si, t)}
                  style={styles.typeBtn}
                />
              ))}
            </View>
          </Card>
        ))}

        {/* --- Quiz --- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={typography.h3}>Quiz questions ({quiz.length})</Text>
          <Button title="+ Question" variant="outline" onPress={addQuestion} style={styles.smallBtn} />
        </View>

        {quiz.map((q, qi) => (
          <Card key={qi} style={styles.blockCard}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Question {qi + 1}</Text>
              <Button
                title="Remove"
                variant="ghost"
                onPress={() => removeQuestion(qi)}
                textColor={colors.danger}
                style={styles.removeBtn}
              />
            </View>

            <TextField
              value={q.questionText}
              onChangeText={(v) => updateQuestion(qi, { questionText: v })}
              placeholder="Which of the following…"
              multiline
              numberOfLines={2}
            />

            <Text style={styles.label}>Options (tap the letter to mark it correct)</Text>
            {q.options.map((option, oi) => (
              <View key={oi} style={styles.optionRow}>
                <Button
                  title={OPTION_LETTERS[oi]}
                  variant={q.correctOptionIndex === oi ? 'primary' : 'outline'}
                  onPress={() => updateQuestion(qi, { correctOptionIndex: oi })}
                  style={styles.optionLetterBtn}
                />
                <TextField
                  value={option}
                  onChangeText={(v) => updateOption(qi, oi, v)}
                  placeholder={`Option ${OPTION_LETTERS[oi]}`}
                  style={styles.optionInput}
                />
              </View>
            ))}

            <TextField
              label="Explanation"
              value={q.explanation}
              onChangeText={(v) => updateQuestion(qi, { explanation: v })}
              placeholder="Why this option is correct…"
              multiline
              numberOfLines={2}
            />

            <Text style={styles.label}>Difficulty</Text>
            <View style={styles.rowWrap}>
              {DIFFICULTIES.map((d) => (
                <Button
                  key={d}
                  title={d}
                  variant={q.difficulty === d ? 'primary' : 'outline'}
                  onPress={() => updateQuestion(qi, { difficulty: d })}
                  style={styles.typeBtn}
                />
              ))}
            </View>
          </Card>
        ))}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title={isEditing ? 'Save changes' : 'Create page'}
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.submitBtn}
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
  intro: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inlineField: {
    flex: 1,
  },
  inlineFieldWide: {
    flex: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  smallBtn: {
    minWidth: 120,
  },
  blockCard: {
    marginBottom: spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.h3,
    fontSize: 16,
  },
  blockInner: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  blockTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  addBlockRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  typeBtn: {
    minWidth: 72,
  },
  removeBtn: {
    minWidth: 56,
    paddingVertical: 0,
  },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionLetterBtn: {
    minWidth: 48,
    marginBottom: spacing.md,
  },
  optionInput: {
    flex: 1,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
});
