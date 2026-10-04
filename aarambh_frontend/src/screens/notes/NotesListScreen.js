import React, { useCallback, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import LoadingState from '../../components/LoadingState';
import { getNotes } from '../../utils/notesStorage';
import { radius, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

function previewText(note) {
  const body = (note.body || '').trim();
  if (body) return body.replace(/\s+/g, ' ');
  return 'No additional text';
}

function displayTitle(note) {
  const title = (note.title || '').trim();
  if (title) return title;
  const firstLine = (note.body || '').trim().split('\n')[0];
  return firstLine || 'Untitled note';
}

function formatDate(ts) {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function NotesListScreen({ navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [notes, setNotes] = useState(null);

  const load = useCallback(() => {
    let active = true;
    getNotes().then((data) => {
      if (active) setNotes(data);
    });
    return () => {
      active = false;
    };
  }, []);

  // Reload every time the screen regains focus (e.g. returning from the editor).
  useFocusEffect(load);

  // A "＋ New" action in the header.
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <Pressable
            onPress={() => navigation.navigate('NoteEditor', {})}
            style={styles.headerBtn}
          >
            <Text style={styles.headerBtnText}>＋ New</Text>
          </Pressable>
        ),
      });
    }, [navigation])
  );

  if (notes === null) return <LoadingState label="Loading notes…" />;

  if (notes.length === 0) {
    return (
      <ScreenContainer>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={typography.h3}>No notes yet</Text>
          <Text style={[typography.bodyMuted, styles.emptyText]}>
            Jot down anything — formulas, reminders, quick summaries.
          </Text>
          <Pressable
            onPress={() => navigation.navigate('NoteEditor', {})}
            style={styles.newButton}
          >
            <Text style={styles.newButtonText}>＋ Create your first note</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View>
              <Text style={typography.h3}>My Notes</Text>
              <Text style={[typography.caption, { marginTop: 2 }]}>
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </Text>
            </View>
            <Pressable onPress={() => navigation.navigate('NoteEditor', {})} style={styles.newNoteBtn}>
              <Text style={styles.newNoteBtnText}>＋ New Note</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Card
            onPress={() => navigation.navigate('NoteEditor', { id: item.id })}
            style={styles.card}
          >
            <Text style={typography.h3} numberOfLines={1}>
              {displayTitle(item)}
            </Text>
            <Text style={[typography.bodyMuted, styles.preview]} numberOfLines={2}>
              {previewText(item)}
            </Text>
            <Text style={styles.meta}>{formatDate(item.updatedAt)}</Text>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const makeStyles = ({ colors, typography }) => StyleSheet.create({
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  newNoteBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  newNoteBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    marginBottom: spacing.md,
  },
  preview: {
    marginTop: spacing.xs,
  },
  meta: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
  headerBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  headerBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  newButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  newButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
