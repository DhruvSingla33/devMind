import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radius, spacing } from '../theme/theme';

// A small, centered in-app dialog that replaces the browser's native alert.
// Self-contained styling (not theme-bound) so it looks right over any surface,
// including the dark Aarambh+ promo. Pass `emoji`, `title`, `message`, and the
// primary action label; `onClose` dismisses it.
export default function AppModal({
  visible,
  onClose,
  emoji = '🎉',
  title,
  message,
  actionLabel = 'OK',
  accent = '#E63946',
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Inner Pressable swallows taps so clicking the card doesn't dismiss. */}
        <Pressable style={styles.card} onPress={() => {}}>
          <LinearGradient
            colors={[`${accent}33`, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.glow}
          />
          <View style={[styles.emojiWrap, { backgroundColor: `${accent}22`, borderColor: `${accent}55` }]}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.action, { backgroundColor: accent }, pressed && { opacity: 0.88 }]}
          >
            <Text style={styles.actionTxt}>{actionLabel}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8,8,12,0.68)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    ...Platform.select({ web: { backdropFilter: 'blur(3px)' }, default: {} }),
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1B1C22',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  emojiWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emoji: { fontSize: 30 },
  title: { fontSize: 19, fontWeight: '800', color: '#fff', textAlign: 'center' },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    marginTop: 8,
  },
  action: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
    borderRadius: radius.pill,
    paddingVertical: 13,
    alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  actionTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
