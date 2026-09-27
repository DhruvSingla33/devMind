import React, { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import colors, { isDarkTheme } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/theme';
import Logo from './Logo';

// colors.background is a light *grey* (#F3F4F7, by design — it's the shared
// page canvas everywhere else, kept a shade off colors.surface so cards lift
// off it). That reads fine on Home where lots of colored content sits on it,
// but on this mostly-empty auth backdrop it just reads as "grey", not white.
// Auth pages default to pure white instead; dark mode is untouched.
const pageBackground = isDarkTheme ? colors.background : colors.white;

// The floating-card auth layout used by the web variant of Login/Signup/etc.
// Uses the app's shared theme tokens (colors.js) so it follows the same
// light/dark toggle as the rest of the app — it used to hardcode a
// permanent dark palette here, which is why it never picked up light mode.

export function AuthCard({ title, subtitle, children, footer, onLogoPress }) {
  const logo = <Logo size="md" align="column" />;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        {onLogoPress ? (
          <Pressable onPress={onLogoPress} hitSlop={8} style={styles.logoPressable}>
            {logo}
          </Pressable>
        ) : (
          logo
        )}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        <View style={styles.body}>{children}</View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </ScrollView>
  );
}

export function AuthField({ label, secureEntry, style, ...inputProps }) {
  const [isHidden, setIsHidden] = useState(!!secureEntry);

  return (
    <View style={[fieldStyles.wrapper, style]}>
      {label ? <Text style={fieldStyles.label}>{label}</Text> : null}
      <View style={fieldStyles.inputRow}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={fieldStyles.input}
          secureTextEntry={secureEntry ? isHidden : false}
          {...inputProps}
        />
        {secureEntry ? (
          <Pressable
            onPress={() => setIsHidden((prev) => !prev)}
            hitSlop={8}
            style={fieldStyles.toggle}
          >
            <Text style={fieldStyles.toggleIcon}>{isHidden ? '👁' : '🙈'}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function AuthSelect({ label, value, options, onSelect, placeholder = 'Select', style }) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={[fieldStyles.wrapper, style, isOpen && selectStyles.wrapperOpen]}>
      {label ? <Text style={fieldStyles.label}>{label}</Text> : null}
      <View style={selectStyles.anchor}>
        <Pressable style={selectStyles.field} onPress={() => setIsOpen((prev) => !prev)}>
          <Text style={selected ? selectStyles.value : selectStyles.placeholder}>
            {selected ? selected.label : placeholder}
          </Text>
          <Text style={[selectStyles.chevron, isOpen && selectStyles.chevronOpen]}>▾</Text>
        </Pressable>

        {isOpen ? (
          <View style={selectStyles.panel}>
            {options.map((option) => (
              <Pressable
                key={option.value}
                style={({ pressed }) => [selectStyles.option, pressed && selectStyles.optionPressed]}
                onPress={() => {
                  onSelect(option.value);
                  setIsOpen(false);
                }}
              >
                <Text
                  style={option.value === value ? selectStyles.optionTextSelected : selectStyles.optionText}
                >
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

export function AuthDivider({ label = 'or' }) {
  return (
    <View style={dividerStyles.row}>
      <View style={dividerStyles.line} />
      <Text style={dividerStyles.label}>{label}</Text>
      <View style={dividerStyles.line} />
    </View>
  );
}

export function GoogleButton({ title = 'Continue with Google', onPress, loading, disabled }) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        googleStyles.button,
        isDisabled && googleStyles.disabled,
        pressed && !isDisabled && googleStyles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} />
      ) : (
        <>
          <Text style={googleStyles.g}>G</Text>
          <Text style={googleStyles.text}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function AuthFooterLink({ prompt, actionLabel, onPress }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text style={footerStyles.text}>
        {prompt} <Text style={footerStyles.link}>{actionLabel}</Text>
      </Text>
    </Pressable>
  );
}

export function authErrorStyle() {
  return { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' };
}

export function authInfoStyle() {
  return { color: colors.textMuted, marginBottom: spacing.md, textAlign: 'center' };
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: pageBackground,
  },
  page: {
    flexGrow: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    overflow: 'hidden',
    ...shadow.card,
  },
  logoPressable: {
    alignSelf: 'center',
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  body: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  footer: {
    marginHorizontal: -spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});

const fieldStyles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
    color: colors.textPrimary,
  },
  toggle: {
    position: 'absolute',
    right: spacing.sm,
  },
  toggleIcon: {
    fontSize: 16,
  },
});

const selectStyles = StyleSheet.create({
  wrapperOpen: {
    zIndex: 20,
  },
  anchor: {
    position: 'relative',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  value: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  placeholder: {
    fontSize: 15,
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
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
  },
  optionPressed: {
    backgroundColor: colors.surfaceAlt,
  },
  optionText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '700',
  },
});

const dividerStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginHorizontal: spacing.sm,
  },
});

const googleStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    marginBottom: spacing.md,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
  g: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4285F4',
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

const footerStyles = StyleSheet.create({
  text: {
    fontSize: 14,
    color: colors.textMuted,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
});
