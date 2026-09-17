import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LoadingState from '../../components/LoadingState';
import { getNote, upsertNote, deleteNote } from '../../utils/notesStorage';
import { confirmAsync } from '../../utils/alert';
import colors from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/theme';

// Paper page geometry.
const PAGE_HEIGHT = 1000;
const SHEET_MAX_WIDTH = 820;
const H_PAD = 56;
const V_PAD = 56;

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Parse inline markdown (**bold**, *italic*) into styled runs for preview.
function parseInline(text) {
  const runs = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) runs.push({ text: text.slice(last, m.index) });
    if (m[2] != null) runs.push({ text: m[2], bold: true });
    else runs.push({ text: m[3], italic: true });
    last = re.lastIndex;
  }
  if (last < text.length) runs.push({ text: text.slice(last) });
  if (runs.length === 0) runs.push({ text: '' });
  return runs;
}

// Turn a saved note into editable blocks (migrates old plain-text notes).
function noteToBlocks(note) {
  if (Array.isArray(note?.blocks) && note.blocks.length) {
    return note.blocks.map((b) => ({
      id: b.id || uid(),
      type: b.type || 'paragraph',
      text: b.text || '',
      align: b.align || 'left',
    }));
  }
  const align = note?.align || 'left';
  const lines = (note?.body || '').split('\n');
  const blocks = lines.map((line) => {
    if (line.startsWith('• ')) return { id: uid(), type: 'bullet', text: line.slice(2), align };
    const numMatch = line.match(/^(\d+)\.\s(.*)$/);
    if (numMatch) return { id: uid(), type: 'number', text: numMatch[2], align };
    return { id: uid(), type: 'paragraph', text: line, align };
  });
  return blocks.length ? blocks : [{ id: uid(), type: 'paragraph', text: '', align: 'left' }];
}

// --- Toolbar icons ---
function AlignIcon({ type, color }) {
  const self = type === 'center' ? 'center' : type === 'right' ? 'flex-end' : 'flex-start';
  return (
    <View style={styles.iconBox}>
      {[16, 11, 16].map((w, i) => (
        <View key={i} style={{ height: 2, borderRadius: 1, backgroundColor: color, width: w, alignSelf: self }} />
      ))}
    </View>
  );
}

function ToolButton({ active, onPress, children }) {
  return (
    <Pressable onPress={onPress} style={[styles.tool, active && styles.toolActive]} accessibilityRole="button">
      {children}
    </Pressable>
  );
}

export default function NoteEditorScreen({ route, navigation }) {
  const routeId = route.params?.id || null;

  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([{ id: uid(), type: 'paragraph', text: '', align: 'left' }]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(!!routeId);
  const [heights, setHeights] = useState({});
  const [sheetHeight, setSheetHeight] = useState(PAGE_HEIGHT);

  const idRef = useRef(routeId);
  const titleRef = useRef('');
  const blocksRef = useRef(blocks);
  const dirtyRef = useRef(false);
  const selRef = useRef({ start: 0, end: 0 });
  const inputRefs = useRef({});
  const pendingFocusId = useRef(null);
  const saveTimer = useRef(null);
  titleRef.current = title;
  blocksRef.current = blocks;

  const pageCount = Math.max(1, Math.ceil(sheetHeight / PAGE_HEIGHT));
  const focusedBlock = blocks[focusedIndex] || blocks[0];

  // --- Load ---
  useEffect(() => {
    if (!routeId) return;
    let active = true;
    getNote(routeId).then((note) => {
      if (!active) return;
      if (note) {
        setTitle(note.title || '');
        setBlocks(noteToBlocks(note));
        idRef.current = note.id;
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [routeId]);

  // --- Save (local-first; single access point so a backend adapter can be
  // slotted in later without touching this screen) ---
  const persist = useCallback(async () => {
    const hasText =
      titleRef.current.trim() || blocksRef.current.some((b) => b.text.trim());
    if (!idRef.current && !hasText) return null;
    const saved = await upsertNote({
      id: idRef.current,
      title: titleRef.current,
      blocks: blocksRef.current,
    });
    idRef.current = saved.id;
    dirtyRef.current = false;
    return saved;
  }, []);

  const scheduleSave = useCallback(() => {
    dirtyRef.current = true;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(), 800);
  }, [persist]);

  // Flush on unmount.
  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (dirtyRef.current) persist();
    },
    [persist]
  );

  // --- Block mutations ---
  const commit = useCallback(
    (next) => {
      blocksRef.current = next;
      setBlocks(next);
      scheduleSave();
    },
    [scheduleSave]
  );

  const updateBlockText = (i, text) => {
    const next = [...blocksRef.current];
    next[i] = { ...next[i], text };
    commit(next);
  };

  const setFocusedAlign = (align) => {
    const i = focusedIndex;
    const next = [...blocksRef.current];
    if (!next[i]) return;
    next[i] = { ...next[i], align };
    commit(next);
  };

  const toggleFocusedType = (type) => {
    const i = focusedIndex;
    const next = [...blocksRef.current];
    if (!next[i]) return;
    next[i] = { ...next[i], type: next[i].type === type ? 'paragraph' : type };
    commit(next);
  };

  // Wrap the current selection in the focused block with a markdown marker.
  const wrapSelection = (marker) => {
    const i = focusedIndex;
    const b = blocksRef.current[i];
    if (!b) return;
    const { start, end } = selRef.current;
    const s = Math.min(start, end);
    const e = Math.max(start, end);
    const t = b.text;
    const wrapped =
      s !== e
        ? t.slice(0, s) + marker + t.slice(s, e) + marker + t.slice(e)
        : t.slice(0, s) + marker + marker + t.slice(s);
    updateBlockText(i, wrapped);
  };

  const splitBlock = (i) => {
    const cur = blocksRef.current[i];
    const caret = selRef.current.start ?? cur.text.length;
    // Empty list item + Enter → exit the list.
    if (cur.text === '' && cur.type !== 'paragraph') {
      const next = [...blocksRef.current];
      next[i] = { ...cur, type: 'paragraph' };
      commit(next);
      return;
    }
    const before = cur.text.slice(0, caret);
    const after = cur.text.slice(caret);
    const child = { id: uid(), type: cur.type, text: after, align: cur.align };
    const next = [...blocksRef.current];
    next[i] = { ...cur, text: before };
    next.splice(i + 1, 0, child);
    pendingFocusId.current = child.id;
    setFocusedIndex(i + 1);
    commit(next);
  };

  const mergeBlock = (i) => {
    if (i <= 0) return;
    const prev = blocksRef.current[i - 1];
    const cur = blocksRef.current[i];
    const next = [...blocksRef.current];
    next[i - 1] = { ...prev, text: prev.text + cur.text };
    next.splice(i, 1);
    pendingFocusId.current = prev.id;
    setFocusedIndex(i - 1);
    commit(next);
  };

  const handleKey = (e, i) => {
    const key = e?.nativeEvent?.key;
    if (key === 'Enter') {
      if (e.preventDefault) e.preventDefault();
      splitBlock(i);
    } else if (key === 'Backspace') {
      const { start, end } = selRef.current;
      if (start === 0 && end === 0 && i > 0) {
        if (e.preventDefault) e.preventDefault();
        mergeBlock(i);
      }
    }
  };

  // Focus a freshly created/merged block.
  useEffect(() => {
    const id = pendingFocusId.current;
    if (id && inputRefs.current[id]) {
      inputRefs.current[id].focus();
      pendingFocusId.current = null;
    }
  }, [blocks]);

  const handleDelete = useCallback(async () => {
    const ok = await confirmAsync('Delete note', 'This note will be permanently removed.', 'Delete');
    if (!ok) return;
    dirtyRef.current = false;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (idRef.current) await deleteNote(idRef.current);
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      title: routeId ? 'Edit note' : 'New note',
      headerRight: () => (
        <Pressable
          onPress={async () => {
            await persist();
            navigation.goBack();
          }}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBtnText}>Save</Text>
        </Pressable>
      ),
    });
  }, [navigation, routeId, persist]);

  if (loading) return <LoadingState label="Loading note…" />;

  // Precompute list markers (numbers reset on non-number blocks).
  let counter = 0;
  const markers = blocks.map((b) => {
    if (b.type === 'bullet') {
      counter = 0;
      return '•';
    }
    if (b.type === 'number') {
      counter += 1;
      return `${counter}.`;
    }
    counter = 0;
    return null;
  });

  const iconColor = (activeFor) => (focusedBlock?.align === activeFor ? colors.primary : colors.textSecondary);

  const breaks = [];
  for (let i = 1; i < pageCount; i += 1) {
    breaks.push(
      <View key={i} style={[styles.pageBreak, { top: i * PAGE_HEIGHT }]} pointerEvents="none">
        <View style={styles.pageBreakLine} />
        <Text style={styles.pageBreakLabel}>Page {i + 1}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.canvas} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarRow}>
          <ToolButton active={focusedBlock?.align === 'left'} onPress={() => setFocusedAlign('left')}>
            <AlignIcon type="left" color={iconColor('left')} />
          </ToolButton>
          <ToolButton active={focusedBlock?.align === 'center'} onPress={() => setFocusedAlign('center')}>
            <AlignIcon type="center" color={iconColor('center')} />
          </ToolButton>
          <ToolButton active={focusedBlock?.align === 'right'} onPress={() => setFocusedAlign('right')}>
            <AlignIcon type="right" color={iconColor('right')} />
          </ToolButton>

          <View style={styles.toolbarDivider} />

          <ToolButton active={focusedBlock?.type === 'bullet'} onPress={() => toggleFocusedType('bullet')}>
            <Text style={styles.toolGlyph}>•</Text>
          </ToolButton>
          <ToolButton active={focusedBlock?.type === 'number'} onPress={() => toggleFocusedType('number')}>
            <Text style={styles.toolGlyphSmall}>1.</Text>
          </ToolButton>

          <View style={styles.toolbarDivider} />

          <ToolButton onPress={() => wrapSelection('**')}>
            <Text style={[styles.toolGlyph, { fontWeight: '800' }]}>B</Text>
          </ToolButton>
          <ToolButton onPress={() => wrapSelection('*')}>
            <Text style={[styles.toolGlyph, { fontStyle: 'italic' }]}>I</Text>
          </ToolButton>
        </ScrollView>

        <Pressable onPress={() => setPreview((p) => !p)} style={styles.previewToggle}>
          <Text style={styles.previewToggleText}>{preview ? '✎ Edit' : '👁 Preview'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.sheet} onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}>
          {breaks}

          {preview ? (
            <>
              {title ? <Text style={styles.previewTitle}>{title}</Text> : null}
              {title ? <View style={styles.divider} /> : null}
              {blocks.map((b, i) => (
                <Text key={b.id} style={[styles.previewText, { textAlign: b.align }]}>
                  {markers[i] ? <Text style={styles.marker}>{markers[i]} </Text> : null}
                  {parseInline(b.text).map((run, k) => (
                    <Text
                      key={k}
                      style={{
                        fontWeight: run.bold ? '700' : '400',
                        fontStyle: run.italic ? 'italic' : 'normal',
                      }}
                    >
                      {run.text}
                    </Text>
                  ))}
                </Text>
              ))}
            </>
          ) : (
            <>
              <TextInput
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  scheduleSave();
                }}
                placeholder="Title"
                placeholderTextColor={colors.textMuted}
                style={styles.titleInput}
              />
              <View style={styles.divider} />

              {blocks.map((b, i) => (
                <View key={b.id} style={styles.blockRow}>
                  {markers[i] != null ? <Text style={styles.marker}>{markers[i]}</Text> : null}
                  <TextInput
                    ref={(r) => {
                      inputRefs.current[b.id] = r;
                    }}
                    value={b.text}
                    multiline
                    onFocus={() => setFocusedIndex(i)}
                    onSelectionChange={(e) => {
                      selRef.current = e.nativeEvent.selection;
                    }}
                    onChangeText={(t) => updateBlockText(i, t)}
                    onKeyPress={(e) => handleKey(e, i)}
                    onContentSizeChange={(e) =>
                      setHeights((h) => ({ ...h, [b.id]: e.nativeEvent.contentSize.height }))
                    }
                    placeholder={i === 0 ? 'Start typing…' : ''}
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.blockInput,
                      { textAlign: b.align, height: Math.max(26, heights[b.id] || 0) },
                    ]}
                  />
                </View>
              ))}
            </>
          )}
        </View>

        {idRef.current ? (
          <Pressable onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>Delete note</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <View style={styles.pageBadge} pointerEvents="none">
        <Text style={styles.pageBadgeText}>
          {pageCount} {pageCount === 1 ? 'page' : 'pages'}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: colors.backgroundElevated },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  toolbarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  toolbarDivider: {
    width: StyleSheet.hairlineWidth,
    height: 22,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  tool: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: 6,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  toolActive: { backgroundColor: colors.primaryMuted },
  toolGlyph: { fontSize: 16, color: colors.textSecondary, fontWeight: '700' },
  toolGlyphSmall: { fontSize: 13, color: colors.textSecondary, fontWeight: '700' },
  iconBox: { width: 18, gap: 3, alignItems: 'stretch' },
  previewToggle: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryMuted,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  previewToggleText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  scrollContent: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.md },
  sheet: {
    width: '100%',
    maxWidth: SHEET_MAX_WIDTH,
    minHeight: PAGE_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: H_PAD,
    paddingVertical: V_PAD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 6,
  },
  pageBreak: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center' },
  pageBreakLine: { flex: 1, borderTopWidth: 1, borderStyle: 'dashed', borderColor: colors.border },
  pageBreakLabel: { ...typography.caption, color: colors.textMuted, paddingHorizontal: spacing.sm },
  titleInput: {
    ...typography.h2,
    paddingVertical: spacing.sm,
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.md },
  blockRow: { flexDirection: 'row', alignItems: 'flex-start' },
  marker: {
    ...typography.body,
    lineHeight: 26,
    minWidth: 24,
    color: colors.textSecondary,
  },
  blockInput: {
    ...typography.body,
    flex: 1,
    lineHeight: 26,
    paddingVertical: 0,
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  previewTitle: { ...typography.h2, paddingVertical: spacing.sm },
  previewText: { ...typography.body, lineHeight: 26, marginBottom: spacing.xs },
  deleteBtn: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  deleteText: { color: colors.danger, fontWeight: '700', fontSize: 14 },
  pageBadge: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: colors.overlay,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  pageBadgeText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  headerBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  headerBtnText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});
