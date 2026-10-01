import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { Chip, FilterRow, toggleValue } from '../../components/FilterChips';
import { getMyBookmarks, toggleBookmark } from '../../api/bookmarks.api';
import { createMixQuiz, startTest } from '../../api/tests.api';
import { extractErrorMessage } from '../../api/client';
import { radius, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

// Revision list of saved questions: filter/search them, reveal the answer
// inline, remove ones you've mastered, and practise the filtered set as a quiz.

const EXAMS = ['NEET', 'JEE', 'BOARDS'];
const SUBJECTS = ['Biology', 'Physics', 'Chemistry', 'Maths'];
const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];
const TYPES = [
  { value: 'all', label: 'All' },
  { value: 'pyq', label: 'PYQ only' },
  { value: 'notes', label: 'With notes' },
];
const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

const EMPTY_FILTERS = { exams: [], subjects: [], books: [], difficulty: [], type: 'all' };
const MAX_QUIZ = 200;
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const matches = (bm, filters, search) => {
  const q = bm.questionId;
  const book = q.textbookId;
  if (filters.exams.length && !filters.exams.some((e) => q.examTags?.includes(e))) return false;
  if (filters.subjects.length && !filters.subjects.includes(book?.subject)) return false;
  if (filters.books.length && !filters.books.includes(book?._id)) return false;
  if (filters.difficulty.length && !filters.difficulty.includes(q.difficulty)) return false;
  if (filters.type === 'pyq' && !q.pyqYear) return false;
  if (filters.type === 'notes' && !bm.notes) return false;
  if (search) {
    const hay = `${q.questionText} ${bm.notes || ''} ${book?.title || ''}`.toLowerCase();
    if (!hay.includes(search)) return false;
  }
  return true;
};

function BookmarkCard({ bookmark, onRemove, removing }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [open, setOpen] = useState(false);
  const q = bookmark.questionId;
  const book = q.textbookId;

  const difficultyColor =
    { easy: colors.success, medium: colors.warning, hard: colors.danger }[q.difficulty] || colors.textMuted;
  const saved = new Date(bookmark.createdAt);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.flex}>
          <Text style={styles.bookLine} numberOfLines={1}>
            {book?.subject ? `${book.subject} · ` : ''}
            {book?.title || 'Question'}
            {q.pageNumber ? ` · p. ${q.pageNumber}` : ''}
          </Text>
          <View style={styles.tagsRow}>
            {q.difficulty ? (
              <View style={[styles.tag, { borderColor: difficultyColor }]}>
                <View style={[styles.dot, { backgroundColor: difficultyColor }]} />
                <Text style={[styles.tagText, { color: difficultyColor }]}>{q.difficulty}</Text>
              </View>
            ) : null}
            {q.examTags?.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {q.pyqYear ? (
              <View style={[styles.tag, styles.pyqTag]}>
                <Text style={[styles.tagText, styles.pyqText]}>PYQ {q.pyqYear}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <Pressable
          onPress={() => onRemove(bookmark)}
          disabled={removing}
          hitSlop={8}
          accessibilityLabel="Remove bookmark"
          style={({ pressed }) => [styles.starBtn, (pressed || removing) && styles.pressed]}
        >
          <Text style={styles.star}>★</Text>
        </Pressable>
      </View>

      <Text style={styles.qText}>{q.questionText}</Text>

      {bookmark.notes ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>📝 {bookmark.notes}</Text>
        </View>
      ) : null}

      {open ? (
        <View style={styles.answerBox}>
          {q.options?.map((opt, i) => {
            const correct = i === q.correctOptionIndex;
            return (
              <View key={i} style={[styles.option, correct && styles.optionCorrect]}>
                <Text style={[styles.optionLetter, correct && styles.optionLetterCorrect]}>
                  {OPTION_LETTERS[i]}
                </Text>
                <Text style={[styles.optionText, correct && styles.optionTextCorrect]}>{opt.text}</Text>
                {correct ? <Text style={styles.tick}>✓</Text> : null}
              </View>
            );
          })}
          {q.explanation ? (
            <Text style={styles.explanation}>
              <Text style={styles.explanationLabel}>Why: </Text>
              {q.explanation}
            </Text>
          ) : null}
          {q.ncertRefPage ? <Text style={styles.ref}>📖 {q.ncertRefPage}</Text> : null}
        </View>
      ) : null}

      <View style={styles.cardFooter}>
        <Text style={styles.savedText}>
          Saved {saved.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
        </Text>
        <Pressable onPress={() => setOpen((v) => !v)} hitSlop={6}>
          <Text style={styles.link}>{open ? 'Hide answer' : 'Show answer'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function BookmarksScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [bookmarks, setBookmarks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getMyBookmarks();
      setBookmarks((Array.isArray(data) ? data : []).filter((b) => b.questionId));
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Book chips only list books you actually have bookmarks from.
  const books = useMemo(() => {
    const map = new Map();
    bookmarks.forEach((b) => {
      const book = b.questionId.textbookId;
      if (book?._id && (!filters.subjects.length || filters.subjects.includes(book.subject))) {
        map.set(book._id, book);
      }
    });
    return [...map.values()];
  }, [bookmarks, filters.subjects]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = bookmarks.filter((b) => matches(b, filters, term));
    return sort === 'oldest' ? [...list].reverse() : list;
  }, [bookmarks, filters, search, sort]);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const activeFilterCount =
    filters.exams.length +
    filters.subjects.length +
    filters.books.length +
    filters.difficulty.length +
    (filters.type !== 'all' ? 1 : 0);

  const remove = async (bookmark) => {
    setActionError(null);
    setRemovingId(bookmark._id);
    // Optimistic: hide now, restore if the request fails.
    setBookmarks((prev) => prev.filter((b) => b._id !== bookmark._id));
    try {
      await toggleBookmark({ questionId: bookmark.questionId._id });
    } catch (err) {
      setBookmarks((prev) => [bookmark, ...prev]);
      setActionError(extractErrorMessage(err));
    } finally {
      setRemovingId(null);
    }
  };

  const practise = async () => {
    setActionError(null);
    setIsStarting(true);
    try {
      const ids = visible.slice(0, MAX_QUIZ).map((b) => b.questionId._id);
      const quiz = await createMixQuiz({
        questionIds: ids,
        exam: filters.exams[0] || 'NEET',
        title: `Bookmarks revision (${ids.length} Qs)`,
      });
      const session = await startTest(quiz._id);
      navigation.navigate('TestsTab', { screen: 'TestAttempt', params: { session } });
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setIsStarting(false);
    }
  };

  if (status === 'loading') return <LoadingState label="Loading your bookmarks…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  if (bookmarks.length === 0) {
    return (
      <ScreenContainer>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>☆</Text>
          <Text style={typography.h2}>No bookmarks yet</Text>
          <Text style={[typography.bodyMuted, styles.center]}>
            Tap the ☆ on a question while practising to save it here for revision.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const subjectCounts = SUBJECTS.map((s) => ({
    subject: s,
    count: bookmarks.filter((b) => b.questionId.textbookId?.subject === s).length,
  })).filter((s) => s.count);

  const header = (
    <View style={styles.header}>
      <View style={styles.hero}>
        <View style={styles.flex}>
          <Text style={typography.h2}>Saved for revision</Text>
          <Text style={[typography.bodyMuted, styles.heroSub]}>
            {bookmarks.length} question{bookmarks.length === 1 ? '' : 's'}
            {subjectCounts.length ? ' · ' + subjectCounts.map((s) => `${s.count} ${s.subject}`).join(' · ') : ''}
          </Text>
        </View>
        <Button
          title={
            visible.length === bookmarks.length
              ? `▶ Practise all (${Math.min(visible.length, MAX_QUIZ)})`
              : `▶ Practise ${Math.min(visible.length, MAX_QUIZ)} filtered`
          }
          onPress={practise}
          loading={isStarting}
          disabled={visible.length === 0}
        />
      </View>

      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search bookmarks, notes, books…"
          placeholderTextColor={colors.textMuted}
          style={styles.search}
        />
        <Pressable
          onPress={() => setShowFilters((v) => !v)}
          style={({ pressed }) => [styles.filterToggle, activeFilterCount > 0 && styles.filterToggleOn, pressed && styles.pressed]}
        >
          <Text style={[styles.filterToggleText, activeFilterCount > 0 && styles.filterToggleTextOn]}>
            ⚙ Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
          </Text>
        </Pressable>
      </View>

      {showFilters ? (
        <View style={styles.filterPanel}>
          <FilterRow label="Subject">
            {SUBJECTS.map((v) => (
              <Chip key={v} label={v} active={filters.subjects.includes(v)} onPress={() => setFilter('subjects', toggleValue(filters.subjects, v))} />
            ))}
          </FilterRow>
          {books.length ? (
            <FilterRow label="Book">
              {books.map((b) => (
                <Chip key={b._id} label={b.title} active={filters.books.includes(b._id)} onPress={() => setFilter('books', toggleValue(filters.books, b._id))} />
              ))}
            </FilterRow>
          ) : null}
          <FilterRow label="Exam">
            {EXAMS.map((v) => (
              <Chip key={v} label={v} active={filters.exams.includes(v)} onPress={() => setFilter('exams', toggleValue(filters.exams, v))} />
            ))}
          </FilterRow>
          <FilterRow label="Difficulty">
            {DIFFICULTIES.map((d) => (
              <Chip
                key={d.value}
                label={d.label}
                active={filters.difficulty.includes(d.value)}
                onPress={() => setFilter('difficulty', toggleValue(filters.difficulty, d.value))}
              />
            ))}
          </FilterRow>
          <FilterRow label="Show">
            {TYPES.map((t) => (
              <Chip key={t.value} label={t.label} active={filters.type === t.value} onPress={() => setFilter('type', t.value)} />
            ))}
          </FilterRow>
          <FilterRow label="Sort">
            {SORTS.map((s) => (
              <Chip key={s.value} label={s.label} active={sort === s.value} onPress={() => setSort(s.value)} />
            ))}
          </FilterRow>
          {activeFilterCount ? (
            <Pressable onPress={() => setFilters(EMPTY_FILTERS)} hitSlop={6}>
              <Text style={styles.link}>Clear all filters</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
      <Text style={styles.resultsText}>
        Showing {visible.length} of {bookmarks.length}
      </Text>
    </View>
  );

  return (
    <ScreenContainer>
      <Grid
        data={visible}
        keyExtractor={(item) => item._id}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={typography.bodyMuted}>No bookmarks match these filters.</Text>
            <Button
              title="Clear filters"
              variant="outline"
              onPress={() => {
                setFilters(EMPTY_FILTERS);
                setSearch('');
              }}
            />
          </View>
        }
        renderItem={({ item }) => (
          <BookmarkCard bookmark={item} onRemove={remove} removing={removingId === item._id} />
        )}
      />
    </ScreenContainer>
  );
}

const makeStyles = ({ colors, typography }) =>
  StyleSheet.create({
    flex: { flex: 1 },
    center: { textAlign: 'center' },
    pressed: { opacity: 0.6 },
    list: { paddingTop: spacing.md, paddingBottom: spacing.xl },
    link: { color: colors.primary, fontWeight: '600', fontSize: 14 },
    error: { color: colors.danger, marginBottom: spacing.sm },

    header: { marginBottom: spacing.sm },
    hero: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    heroSub: { marginTop: spacing.xs },

    searchRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
    search: {
      flex: 1,
      height: 44,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      color: colors.textPrimary,
      fontSize: 15,
    },
    filterToggle: {
      height: 44,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    filterToggleOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
    filterToggleText: { color: colors.textPrimary, fontWeight: '600', fontSize: 14 },
    filterToggleTextOn: { color: colors.primary },
    filterPanel: {
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    resultsText: { ...typography.caption, fontSize: 13, marginBottom: spacing.xs },

    card: {
      marginBottom: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.sm,
    },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    bookLine: { ...typography.caption, marginBottom: spacing.xs },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    dot: { width: 6, height: 6, borderRadius: 3 },
    tagText: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    pyqTag: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
    pyqText: { color: colors.primary },
    starBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    star: { color: colors.primary, fontSize: 18, lineHeight: 20 },

    qText: { color: colors.textPrimary, fontSize: 16, lineHeight: 23, fontWeight: '500' },
    noteBox: {
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
      borderLeftWidth: 3,
      borderLeftColor: colors.warning,
    },
    noteText: { color: colors.textSecondary, fontSize: 14 },

    answerBox: { gap: spacing.xs },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionCorrect: { borderColor: colors.success, backgroundColor: colors.successSoft },
    optionLetter: { width: 18, color: colors.textMuted, fontWeight: '700' },
    optionLetterCorrect: { color: colors.success },
    optionText: { flex: 1, color: colors.textPrimary, fontSize: 14 },
    optionTextCorrect: { fontWeight: '600' },
    tick: { color: colors.success, fontWeight: '800' },
    explanation: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: spacing.xs },
    explanationLabel: { color: colors.textPrimary, fontWeight: '700' },
    ref: { ...typography.caption },

    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingTop: spacing.sm,
    },
    savedText: { ...typography.caption },

    emptyWrap: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
    emptyIcon: { fontSize: 48, color: colors.textMuted },
  });
