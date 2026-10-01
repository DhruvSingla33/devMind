import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

export default function SelectField({ label, value, options, onSelect, placeholder = 'Select' }) {
  const styles = useThemedStyles(makeStyles);
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={[styles.wrapper, isOpen && styles.wrapperOpen]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.anchor}>
        <Pressable style={styles.field} onPress={() => setIsOpen((prev) => !prev)}>
          <Text style={selected ? styles.value : styles.placeholder}>
            {selected ? selected.label : placeholder}
          </Text>
          <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>▾</Text>
        </Pressable>

        {isOpen ? (
          <View style={styles.panel}>
            {options.map((option) => (
              <Pressable
                key={option.value}
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                onPress={() => {
                  onSelect(option.value);
                  setIsOpen(false);
                }}
              >
                <Text style={option.value === value ? styles.optionTextSelected : styles.optionText}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const makeStyles = ({ colors, typography }) => StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  wrapperOpen: {
    zIndex: 20,
  },
  label: {
    ...typography.caption,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  anchor: {
    position: 'relative',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
  },
  placeholder: {
    ...typography.body,
    color: colors.textMuted,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 14,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  panel: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
    zIndex: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  optionPressed: {
    backgroundColor: colors.surfaceAlt,
  },
  optionText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
});
