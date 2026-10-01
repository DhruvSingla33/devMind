import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import { Chip, FilterRow, toggleValue } from '../../components/FilterChips';
import { listQuestions } from '../../api/questions.api';
import { listTextbooks } from '../../api/textbooks.api';
import { createMixQuiz, startTest } from '../../api/tests.api';
import { extractErrorMessage } from '../../api/client';
import { radius, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

// Quiz-bank builder: browse every question across all books, narrow it with
// filters, then either hand-pick questions or draw a random set from the
// filtered pool.

const PAGE_SIZE = 20;
const MAX_QUIZ = 200;

const EXAMS = ['NEET', 'JEE', 'BOARDS'];
const SUBJECTS = ['Biology', 'Physics', 'Chemistry', 'Maths'];
const CLASSES = ['XI', 'XII'];
const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];
const TYPES = [
  { value: 'all', label: 'All' },
  { value: 'pyq', label: 'PYQ only' },
  { value: 'nonpyq', label: 'Non-PYQ' },
  { value: 'hp', label: 'High probability' },
];

const EMPTY_FILTERS = {
  exams: [],
  subjects: [],
  classes: [],
  books: [],
  difficulty: [],
  type: 'all',
};

// UI filter state -> API query params (comma lists, see buildBankFilter).
const toQuery = (filters, search) => {
  const q = {};
  if (filters.exams.length) q.exam = filters.exams.join(',');
  if (filters.subjects.length) q.subjects = filters.subjects.join(',');
  if (filters.classes.length) q.classLevels = filters.classes.join(',');
  if (filters.books.length) q.textbookIds = filters.books.join(',');
  if (filters.difficulty.length) q.difficulty = filters.difficulty.join(',');
  if (filters.type === 'pyq') q.isPyq = 'true';
  if (filters.type === 'nonpyq') q.isPyq = 'false';
  if (filters.type === 'hp') q.isHighProbability = 'true';
  if (search.trim()) q.search = search.trim();
  return q;
};

function QuestionRow({ question, index, selected, onToggle }) {
  const styles = useThemedStyles(makeStyles);
  const book = question.textbookId;
  const meta = [
    book?.title,
    question.pageNumber ? `p. ${question.pageNumber}` : null,
    question.difficulty ? question.difficulty[0].toUpperCase() + question.difficulty.slice(1) : null,
    question.pyqYear ? `PYQ ${question.pyqYear}` : null,
  ].filter(Boolean);

  return (
    <Pressable
      onPress={() => onToggle(question)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [styles.qCard, selected && styles.qCardActive, pressed && styles.pressed]}
    >
      <View style={[styles.checkbox, selected && styles.checkboxActive]}>
        {selected ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      <View style={styles.qBody}>
        <Text style={styles.qText} numberOfLines={3}>
          <Text style={styles.qIndex}>{index + 1}. </Text>
          {question.questionText}
        </Text>
        <Text style={styles.qMeta} numberOfLines={1}>
          {meta.join(' · ')}
        </Text>
      </View>
    </Pressable>
  );
}

export default function MixQuizSetupScreen({ route, navigation }) {
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { chapterId, chapterTitle } = route.params || {};

  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [listStatus, setListStatus] = useState('loading');
  const [loadingMore, setLoadingMore] = useState(false);

  // Selected questions keyed by id (kept across filter changes, so a user can
  // build one bank from several searches).
  const [selected, setSelected] = useState(() => new Map());
  const [randomCount, setRandomCount] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  useEffect(() => {
    listTextbooks()
      .then((data) => setBooks(Array.isArray(data) ? data : []))
      .catch(() => setBooks([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const query = useMemo(() => toQuery(filters, debouncedSearch), [filters, debouncedSearch]);

  const fetchPage = useCallback(
    async (pageToLoad) => {
      const id = ++requestId.current;
      if (pageToLoad === 1) setListStatus('loading');
      else setLoadingMore(true);
      try {
        const data = await listQuestions({ ...query, page: pageToLoad, limit: PAGE_SIZE });
        if (id !== requestId.current) return; // a newer filter change won
        const items = data?.questions || [];
        setQuestions((prev) => (pageToLoad === 1 ? items : [...prev, ...items]));
        setTotal(data?.pagination?.total ?? items.length);
        setTotalPages(data?.pagination?.totalPages ?? 1);
        setPage(pageToLoad);
        setListStatus('ready');
      } catch (err) {
        if (id !== requestId.current) return;
        setError(extractErrorMessage(err));
        setListStatus('error');
      } finally {
        if (id === requestId.current) setLoadingMore(false);
      }
    },
    [query]
  );

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  // Book chips follow the subject/class filters so the list stays short.
  const visibleBooks = useMemo(
    () =>
      books.filter(
        (b) =>
          (!filters.subjects.length || filters.subjects.includes(b.subject)) &&
          (!filters.classes.length || filters.classes.includes(b.classLevel))
      ),
    [books, filters.subjects, filters.classes]
  );

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const activeFilterCount =
    filters.exams.length +
    filters.subjects.length +
    filters.classes.length +
    filters.books.length +
    filters.difficulty.length +
    (filters.type !== 'all' ? 1 : 0);

  const toggleQuestion = useCallback((q) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(q._id)) next.delete(q._id);
      else if (next.size < MAX_QUIZ) next.set(q._id, q);
      return next;
    });
  }, []);

  const allLoadedSelected = questions.length > 0 && questions.every((q) => selected.has(q._id));
  const toggleAllLoaded = () => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (allLoadedSelected) {
        questions.forEach((q) => next.delete(q._id));
      } else {
        for (const q of questions) {
          if (next.size >= MAX_QUIZ) break;
          next.set(q._id, q);
        }
      }
      return next;
    });
  };

  const quizExam = filters.exams[0] || 'NEET';

  const launch = async (payload) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const quiz = await createMixQuiz({ exam: quizExam, ...payload });
      const session = await startTest(quiz._id);
      navigation.replace('TestAttempt', { session });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const startSelected = () =>
    launch({
      questionIds: [...selected.keys()],
      title: `My Quiz Bank (${selected.size} Qs)`,
    });

  const startRandom = () =>
    launch({
      chapterIds: chapterId ? [chapterId] : [],
      filters: query,
      questionCount: Math.min(Number(randomCount) || 30, MAX_QUIZ),
      title: chapterTitle ? `Mix Quiz · ${chapterTitle}` : undefined,
    });

  const header = (
    <View>
      <Text style={typography.h2}>Build your quiz</Text>
      <Text style={[typography.bodyMuted, styles.subtitle]}>
        {chapterTitle
          ? `Focused on: ${chapterTitle}. Random picks use this chapter.`
          : 'Browse every question across all books. Pick your own or draw a random set.'}
      </Text>

      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search questions…"
          placeholderTextColor={colors.textMuted}
          style={styles.search}
          returnKeyType="search"
        />
        <Pressable
          onPress={() => setShowFilters((v) => !v)}
          style={({ pressed }) => [styles.filterToggle, pressed && styles.pressed]}
        >
          <Text style={styles.filterToggleText}>
            {showFilters ? 'Hide filters' : 'Filters'}
            {activeFilterCount ? ` (${activeFilterCount})` : ''}
          </Text>
        </Pressable>
      </View>

      {showFilters ? (
        <View style={styles.filterPanel}>
          <FilterRow label="Exam">
            {EXAMS.map((v) => (
              <Chip key={v} label={v} active={filters.exams.includes(v)} onPress={() => setFilter('exams', toggleValue(filters.exams, v))} />
            ))}
          </FilterRow>
          <FilterRow label="Subject">
            {SUBJECTS.map((v) => (
              <Chip
                key={v}
                label={v}
                active={filters.subjects.includes(v)}
                onPress={() => setFilter('subjects', toggleValue(filters.subjects, v))}
              />
            ))}
          </FilterRow>
          <FilterRow label="Class">
            {CLASSES.map((v) => (
              <Chip
                key={v}
                label={`Class ${v}`}
                active={filters.classes.includes(v)}
                onPress={() => setFilter('classes', toggleValue(filters.classes, v))}
              />
            ))}
          </FilterRow>
          {visibleBooks.length ? (
            <FilterRow label="Book">
              {visibleBooks.map((b) => (
                <Chip
                  key={b._id}
                  label={b.title}
                  active={filters.books.includes(b._id)}
                  onPress={() => setFilter('books', toggleValue(filters.books, b._id))}
                />
              ))}
            </FilterRow>
          ) : null}
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
          <FilterRow label="Type">
            {TYPES.map((t) => (
              <Chip key={t.value} label={t.label} active={filters.type === t.value} onPress={() => setFilter('type', t.value)} />
            ))}
          </FilterRow>
          {activeFilterCount ? (
            <Pressable onPress={() => setFilters(EMPTY_FILTERS)} hitSlop={6}>
              <Text style={styles.link}>Clear all filters</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>
          {listStatus === 'loading' ? 'Loading…' : `${total} question${total === 1 ? '' : 's'}`}
        </Text>
        {questions.length ? (
          <Pressable onPress={toggleAllLoaded} hitSlop={6}>
            <Text style={styles.link}>{allLoadedSelected ? 'Unselect shown' : 'Select all shown'}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  const footer =
    listStatus !== 'ready' ? null : page < totalPages ? (
      <Button
        title={loadingMore ? 'Loading…' : 'Load more'}
        variant="outline"
        onPress={() => fetchPage(page + 1)}
        disabled={loadingMore}
        style={styles.loadMore}
      />
    ) : questions.length ? (
      <Text style={styles.endText}>That's everything for these filters.</Text>
    ) : null;

  const empty =
    listStatus === 'loading' ? (
      <ActivityIndicator color={colors.primary} style={styles.loader} />
    ) : listStatus === 'error' ? (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>Couldn't load questions.</Text>
        <Button title="Retry" variant="outline" onPress={() => fetchPage(1)} />
      </View>
    ) : (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>No questions match these filters.</Text>
      </View>
    );

  return (
    <ScreenContainer>
      <FlatList
        data={listStatus === 'loading' ? [] : questions}
        keyExtractor={(q) => q._id}
        renderItem={({ item, index }) => (
          <QuestionRow question={item} index={index} selected={selected.has(item._id)} onToggle={toggleQuestion} />
        )}
        extraData={selected}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        ListEmptyComponent={empty}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />

      <View style={styles.bottomBar}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {selected.size > 0 ? (
          <View style={styles.bottomRow}>
            <Pressable onPress={() => setSelected(new Map())} hitSlop={6}>
              <Text style={styles.link}>Clear ({selected.size})</Text>
            </Pressable>
            <Button
              title={`Start quiz · ${selected.size} selected`}
              onPress={startSelected}
              loading={isSubmitting}
              style={styles.flex}
            />
          </View>
        ) : (
          <View style={styles.bottomRow}>
            <View style={styles.countBox}>
              <Text style={styles.countLabel}>Random</Text>
              <TextInput
                value={randomCount}
                onChangeText={(t) => setRandomCount(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={3}
                style={styles.countInput}
              />
            </View>
            <Button
              title="Generate & start"
              onPress={startRandom}
              loading={isSubmitting}
              disabled={listStatus === 'ready' && total === 0}
              style={styles.flex}
            />
          </View>
        )}
        <Text style={styles.hint}>
          {selected.size > 0
            ? `Your picks are kept when you change filters (max ${MAX_QUIZ}).`
            : 'Tap questions to hand-pick them, or draw a random set from the filtered list.'}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const makeStyles = ({ colors, typography }) =>
  StyleSheet.create({
    flex: { flex: 1 },
    pressed: { opacity: 0.75 },
    listContent: { paddingBottom: spacing.lg },
    subtitle: { marginTop: spacing.xs, marginBottom: spacing.md },

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
    filterToggleText: { color: colors.textPrimary, fontWeight: '600', fontSize: 14 },

    filterPanel: {
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    link: { color: colors.primary, fontWeight: '600', fontSize: 14 },

    resultsBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    resultsText: { ...typography.caption, fontSize: 13 },

    qCard: {
      flexDirection: 'row',
      gap: spacing.sm,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    qCardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    checkmark: { color: colors.textOnDark, fontSize: 13, fontWeight: '800' },
    qBody: { flex: 1, gap: spacing.xs },
    qIndex: { color: colors.textMuted, fontWeight: '700' },
    qText: { color: colors.textPrimary, fontSize: 15, lineHeight: 21 },
    qMeta: { ...typography.caption },

    loader: { marginTop: spacing.xl },
    loadMore: { marginTop: spacing.sm },
    endText: { ...typography.caption, textAlign: 'center', marginTop: spacing.md },
    emptyBox: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
    emptyText: { ...typography.bodyMuted },

    bottomBar: {
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
      gap: spacing.xs,
    },
    bottomRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    countBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    countLabel: { color: colors.textSecondary, fontWeight: '600' },
    countInput: {
      width: 56,
      height: 44,
      textAlign: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    hint: { ...typography.caption, textAlign: 'center' },
    error: { color: colors.danger, textAlign: 'center' },
  });
