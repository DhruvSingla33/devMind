import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import StudySection from '../StudySection/StudySection';
import mapStudyData from '../StudySection/mapStudyData';
import { getChapter, getChapterPdf } from '../../api/textbooks.api';
import { extractErrorMessage } from '../../api/client';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

export default function ChapterScreen({ route, navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { code, chapterNumber, title } = route.params;
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await getChapter(code, chapterNumber);
      setData(result);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, [code, chapterNumber]);

  useEffect(() => {
    navigation.setOptions({ title });
    load();
  }, [load, navigation, title]);

  const chapter = data?.chapter;
  const hasPdf = !!(chapter && (chapter.pdfUrl || (chapter.startPage && chapter.endPage)));

  // The reader takes over the whole screen, so render it only when the chapter
  // has notes pages or a PDF to show; otherwise fall back to the summary view.
  const studyData = useMemo(() => (data ? mapStudyData(data) : null), [data]);
  const hasPages = (studyData?.pages?.length || 0) > 0;
  const showReader = hasPages || hasPdf;

  // Handed to the reader, which calls it the first time the user opens the PDF.
  const loadPdfUrl = useCallback(async () => {
    try {
      const { publicUrl } = await getChapterPdf(code, chapterNumber);
      return publicUrl;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }, [code, chapterNumber]);

  const goPractice = useCallback(() => {
    if (!chapter) return;
    navigation.navigate('TestsTab', {
      screen: 'MixQuizSetup',
      params: { chapterId: chapter._id, chapterTitle: chapter.title },
    });
  }, [navigation, chapter]);

  // In reader mode the summary's inline buttons are gone, so surface Practice
  // as a header action instead (the PDF lives in the reader's Notes/PDF toggle).
  useEffect(() => {
    if (status !== 'ready' || !showReader) return;
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <Pressable onPress={goPractice} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>⚡ Practice</Text>
          </Pressable>
        </View>
      ),
    });
  }, [status, showReader, goPractice, navigation]);

  if (status === 'loading') return <LoadingState label="Loading chapter…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  if (showReader) {
    return (
      <View style={styles.reader}>
        <StudySection studyData={studyData} loadPdfUrl={hasPdf ? loadPdfUrl : undefined} />
      </View>
    );
  }

  // Fallback: chapter has no page content yet — show the summary + actions.
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.h2}>{chapter.title}</Text>
        {chapter.description ? (
          <Text style={[typography.bodyMuted, styles.description]}>{chapter.description}</Text>
        ) : null}

        <View style={styles.tagsRow}>
          {chapter.examTags?.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={[typography.bodyMuted, styles.pages]}>
          {chapter.totalPages} page{chapter.totalPages === 1 ? '' : 's'} in this chapter
        </Text>

        <Button title="Practice this chapter" onPress={goPractice} style={styles.practiceButton} />
      </ScrollView>
    </ScreenContainer>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  reader: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...Platform.select({ web: { paddingRight: spacing.sm }, default: {} }),
  },
  headerBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  headerBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  description: {
    marginTop: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.primaryMuted,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginRight: spacing.xs,
  },
  tagText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  pages: {
    marginTop: spacing.md,
  },
  practiceButton: {
    marginTop: spacing.md,
  },
});
