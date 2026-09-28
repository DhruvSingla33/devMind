import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { listTextbooks, getTextbook } from '../../api/textbooks.api';
import { listQuestions, adminDeleteQuestion } from '../../api/questions.api';
import { extractErrorMessage } from '../../api/client';
import { confirmAsync, notify } from '../../utils/alert';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

export default function AdminQuestionListScreen({ navigation }) {
  const [textbooks, setTextbooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    listTextbooks()
      .then((data) => {
        setTextbooks(data);
        setStatus('ready');
      })
      .catch((error) => {
        setErrorMessage(extractErrorMessage(error));
        setStatus('error');
      });
  }, []);

  const selectBook = async (book) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    setQuestions([]);
    try {
      const data = await getTextbook(book.code);
      setChapters(data.chapters || []);
    } catch (error) {
      notify('Could not load chapters', extractErrorMessage(error));
    }
  };

  const loadQuestions = useCallback(async (chapter) => {
    try {
      const data = await listQuestions({ chapterId: chapter._id, limit: 100 });
      setQuestions(data.questions);
    } catch (error) {
      notify('Could not load questions', extractErrorMessage(error));
    }
  }, []);

  const selectChapter = (chapter) => {
    setSelectedChapter(chapter);
    loadQuestions(chapter);
  };

  const handleDelete = async (question) => {
    const confirmed = await confirmAsync('Delete question?', 'This cannot be undone.', 'Delete');
    if (!confirmed) return;
    try {
      await adminDeleteQuestion(question._id);
      setQuestions((prev) => prev.filter((q) => q._id !== question._id));
    } catch (error) {
      notify('Could not delete question', extractErrorMessage(error));
    }
  };

  if (status === 'loading') return <LoadingState label="Loading textbooks…" />;
  if (status === 'error') return <ErrorState message={errorMessage} />;

  return (
    <ScreenContainer>
      <View style={styles.pickerRow}>
        <Text style={styles.label}>Textbook</Text>
        <View style={styles.chipRow}>
          {textbooks.map((book) => (
            <Button
              key={book._id}
              title={book.title}
              variant={selectedBook?._id === book._id ? 'primary' : 'outline'}
              onPress={() => selectBook(book)}
              style={styles.chip}
            />
          ))}
        </View>
      </View>

      {selectedBook ? (
        <>
          <View style={styles.actionsRow}>
            <Button
              title="Upload quiz CSV"
              onPress={() =>
                navigation.navigate('AdminBulkQuestionUpload', {
                  textbookId: selectedBook._id,
                  bookTitle: selectedBook.title,
                })
              }
              style={styles.actionButton}
            />
          </View>

          <View style={styles.pickerRow}>
            <Text style={styles.label}>Chapter</Text>
            <View style={styles.chipRow}>
              {chapters.map((chapter) => (
                <Button
                  key={chapter._id}
                  title={`${chapter.chapterNumber}. ${chapter.title}`}
                  variant={selectedChapter?._id === chapter._id ? 'primary' : 'outline'}
                  onPress={() => selectChapter(chapter)}
                  style={styles.chip}
                />
              ))}
            </View>
          </View>
        </>
      ) : null}

      {selectedChapter ? (
        <>
          <View style={styles.actionsRow}>
            <Button
              title="+ New question"
              onPress={() =>
                navigation.navigate('AdminQuestionForm', {
                  textbookId: selectedBook._id,
                  chapterId: selectedChapter._id,
                })
              }
              style={styles.actionButton}
            />
          </View>

          <Grid
            data={questions}
            keyExtractor={(item) => item._id}
            columns={{ mobile: 1, tablet: 2, desktop: 2 }}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<ErrorState message="No questions yet for this chapter." />}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{item.difficulty}</Text>
                  </View>
                  <Button
                    title="Edit"
                    variant="ghost"
                    onPress={() =>
                      navigation.navigate('AdminQuestionForm', {
                        textbookId: selectedBook._id,
                        chapterId: selectedChapter._id,
                        question: item,
                      })
                    }
                  />
                  <Button title="Delete" variant="ghost" onPress={() => handleDelete(item)} />
                </View>
                <Text style={typography.body} numberOfLines={3}>
                  {item.questionText}
                </Text>
              </Card>
            )}
          />
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pickerRow: {
    marginTop: spacing.md,
  },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    minWidth: 80,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
});
