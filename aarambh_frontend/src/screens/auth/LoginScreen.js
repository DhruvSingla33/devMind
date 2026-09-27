import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import {
  AuthCard,
  AuthField,
  AuthDivider,
  GoogleButton,
  AuthFooterLink,
  authErrorStyle,
} from '../../components/AuthCard';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../api/client';
import { notify } from '../../utils/alert';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

function useLoginLogic(navigation) {
  const { loginWithPassword, requestGoogleSignIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithPassword(email.trim(), password);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Not wired to any button yet — Google auth ships in phase 2.
  const handleGoogleLogin = async () => {
    setIsGoogleSubmitting(true);
    try {
      const result = await requestGoogleSignIn();
      if (result?.type === 'error') {
        setError('Google sign-in was cancelled or failed.');
      }
    } catch (err) {
      notify('Google Sign-In', err.message);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    isGoogleSubmitting,
    error,
    handleLogin,
    handleGoogleLogin,
  };
}

function WebLogin({ navigation }) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    // isGoogleSubmitting,
    error,
    handleLogin,
    // handleGoogleLogin,
  } = useLoginLogic(navigation);

  return (
    <AuthCard
      title="Sign in to Aarambh"
      subtitle="Welcome back! Please sign in to continue."
      onLogoPress={() => navigation.navigate('Welcome')}
      footer={
        <AuthFooterLink
          prompt="Don't have an account?"
          actionLabel="Sign up"
          onPress={() => navigation.navigate('Signup')}
        />
      }
    >
      {/* Google sign-in ships in phase 2 — kept commented, not removed. */}
      {/* <GoogleButton onPress={handleGoogleLogin} loading={isGoogleSubmitting} /> */}
      {/* <AuthDivider /> */}

      <AuthField
        label="Email address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Enter your email address"
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureEntry
        placeholder="Enter your password"
      />

      <Pressable onPress={() => navigation.navigate('ForgotPassword')} hitSlop={8}>
        <Text style={styles.webForgotLink}>Forgot Password?</Text>
      </Pressable>

      {error ? <Text style={authErrorStyle()}>{error}</Text> : null}

      <Button title="Continue" onPress={handleLogin} loading={isSubmitting} />

      {/* OTP sign-in is off for now — kept commented, not removed. */}
      {/* <Button
        title="Use phone / email OTP instead"
        variant="ghost"
        onPress={() => navigation.navigate('Otp')}
        style={styles.webGhost}
      /> */}
    </AuthCard>
  );
}

function NativeLogin({ navigation }) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    // isGoogleSubmitting,
    error,
    handleLogin,
    // handleGoogleLogin,
  } = useLoginLogic(navigation);

  return (
    <ScreenContainer>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={typography.h2}>Welcome back</Text>
        <Text style={[typography.bodyMuted, styles.subtitle]}>
          Log in to continue your prep streak.
        </Text>

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        <Pressable onPress={() => navigation.navigate('ForgotPassword')} hitSlop={8} style={styles.forgotWrap}>
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Log in" onPress={handleLogin} loading={isSubmitting} />

        {/*
          Google + OTP sign-in are off for now (no OTP service yet, Google
          ships in phase 2) — kept commented, not removed.

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Continue with Google"
            variant="light"
            onPress={handleGoogleLogin}
            loading={isGoogleSubmitting}
          />
          <Button
            title="Use phone / email OTP instead"
            variant="ghost"
            onPress={() => navigation.navigate('Otp')}
            style={styles.spaced}
          />
        */}

        <Button
          title="New here? Create an account"
          variant="ghost"
          onPress={() => navigation.navigate('Signup')}
          style={styles.spaced}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

export default function LoginScreen({ navigation }) {
  if (Platform.OS === 'web') {
    return <WebLogin navigation={navigation} />;
  }
  return <NativeLogin navigation={navigation} />;
}

const styles = StyleSheet.create({
  webGhost: {
    marginTop: spacing.xs,
  },
  webForgotLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    marginHorizontal: spacing.sm,
  },
  spaced: {
    marginTop: spacing.sm,
  },
  forgotWrap: {
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  forgotLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
