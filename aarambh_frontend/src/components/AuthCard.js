import React, { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { radius, spacing } from '../theme/theme';

// A deliberately dark, floating-card auth layout — used only by the web
// variant of Login/Signup/Otp. It intentionally does NOT use the app's
// shared (light) theme tokens from src/theme/colors.js: this is a one-off
// visual treatment for the auth flow, not a new global theme, so its colors
// are local to this file rather than touching colors.js.
const DARK = {
  page: '#0B0B0D',
  card: '#18181B',
  border: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.08)',
  text: '#F5F5F7',
  textMuted: '#9A9AA4',
  inputBg: 'rgba(255,255,255,0.04)',
  inputBorder: 'rgba(255,255,255,0.14)',
  primary: '#E63946',
};

export function AuthCard({ title, subtitle, children, footer, onLogoPress }) {
  const logo = (
    <View style={styles.logo}>
      <Text style={styles.logoMark}>आ</Text>
    </View>
  );

  return (
    <View style={styles.page}>
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
    </View>
  );
}

export function AuthField({ label, secureEntry, style, ...inputProps }) {
  const [isHidden, setIsHidden] = useState(!!secureEntry);

  return (
    <View style={[fieldStyles.wrapper, style]}>
      {label ? <Text style={fieldStyles.label}>{label}</Text> : null}
      <View style={fieldStyles.inputRow}>
        <TextInput
          placeholderTextColor={DARK.textMuted}
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
        <ActivityIndicator color={DARK.text} />
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
  return { color: '#FF6B74', marginBottom: spacing.md, textAlign: 'center' };
}

export function authInfoStyle() {
  return { color: DARK.textMuted, marginBottom: spacing.md, textAlign: 'center' };
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: DARK.page,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: DARK.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DARK.border,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    overflow: 'hidden',
  },
  logoPressable: {
    alignSelf: 'center',
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  logo: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoMark: {
    fontSize: 26,
    fontWeight: '800',
    color: DARK.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: DARK.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: DARK.textMuted,
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
    borderTopColor: DARK.divider,
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
    color: DARK.text,
    marginBottom: spacing.xs,
  },
  inputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: DARK.inputBg,
    borderWidth: 1,
    borderColor: DARK.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
    color: DARK.text,
  },
  toggle: {
    position: 'absolute',
    right: spacing.sm,
  },
  toggleIcon: {
    fontSize: 16,
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
    backgroundColor: DARK.divider,
  },
  label: {
    color: DARK.textMuted,
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
    borderColor: DARK.inputBorder,
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
    color: DARK.text,
  },
});

const footerStyles = StyleSheet.create({
  text: {
    fontSize: 14,
    color: DARK.textMuted,
  },
  link: {
    color: DARK.primary,
    fontWeight: '700',
  },
});
