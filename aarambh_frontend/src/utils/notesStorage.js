// Local, on-device notes storage (AsyncStorage). There's no notes backend yet,
// so notes live only on this device and aren't synced across devices/logins.
// Swap these functions for an API layer when a backend endpoint exists.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'aarambh:notes';

export function newNoteId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getNotes() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const notes = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(notes)) return [];
    // Most recently updated first.
    return notes.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch {
    return [];
  }
}

export async function getNote(id) {
  const notes = await getNotes();
  return notes.find((n) => n.id === id) || null;
}

async function saveAll(notes) {
  await AsyncStorage.setItem(KEY, JSON.stringify(notes));
}

// Flattens blocks to a plain-text body for list previews / backward compat.
function blocksToBody(blocks) {
  return blocks
    .map((b) => (b.type === 'bullet' ? '• ' : '') + (b.text || ''))
    .join('\n');
}

// Creates or updates a note. Pass either `blocks` (rich, per-paragraph) or a
// plain `body` string. Returns the saved note.
export async function upsertNote({ id, title = '', body = '', align = 'left', blocks = null }) {
  const notes = await getNotes();
  const now = Date.now();
  const index = id ? notes.findIndex((n) => n.id === id) : -1;

  const fields = {
    title,
    align,
    ...(blocks ? { blocks, body: blocksToBody(blocks) } : { body }),
  };

  let saved;
  if (index >= 0) {
    saved = { ...notes[index], ...fields, updatedAt: now };
    notes[index] = saved;
  } else {
    saved = { id: id || newNoteId(), ...fields, createdAt: now, updatedAt: now };
    notes.push(saved);
  }

  await saveAll(notes);
  return saved;
}

export async function deleteNote(id) {
  const notes = (await getNotes()).filter((n) => n.id !== id);
  await saveAll(notes);
  return notes;
}
