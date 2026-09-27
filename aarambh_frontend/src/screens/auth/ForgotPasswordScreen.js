import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { AuthCard, AuthField, AuthFooterLink, authErrorStyle } from '../../components/AuthCard';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../api/client';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

function useForgotPasswordLogic(navigation) {
  const { requestOtp } = useAuth();
  const [target, setTarget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    if (!target.trim()) {
      setError('Enter your email or mobile number.');
      return;
    }
    setIsSubmitting(true);
    try {
      await requestOtp(target.trim(), 'reset_password');
      navigation.navigate('ResetOtp', { target: target.trim() });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { target, setTarget, isSubmitting, error, handleSubmit };
}

function WebForgotPassword({ navigation }) {
  const { target, setTarget, isSubmitting, error, handleSubmit } = useForgotPasswordLogic(navigation);

  return (
    <AuthCard
      title="Forgot Password?"
      subtitle="Don't worry! It happens. Please enter the email or mobile number associated with your account."
      onLogoPress={() => navigation.navigate('Welcome')}
      footer={
        <AuthFooterLink
          prompt="Remembered it?"
          actionLabel="Sign in"
          onPress={() => navigation.navigate('Login')}
        />
      }
    >
      <AuthField
        label="Email ID / Mobile number"
        value={target}
        onChangeText={setTarget}
        autoCapitalize="none"
        placeholder="you@example.com or 9876543210"
      />

      {error ? <Text style={authErrorStyle()}>{error}</Text> : null}

      <Button title="Submit" onPress={handleSubmit} loading={isSubmitting} />
    </AuthCard>
  );
}

function NativeForgotPassword({ navigation }) {
  const { target, setTarget, isSubmitting, error, handleSubmit } = useForgotPasswordLogic(navigation);

  return (
    <ScreenContainer>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={typography.h2}>Forgot Password?</Text>
        <Text style={[typography.bodyMuted, styles.subtitle]}>
          Don't worry! It happens. Please enter the email or mobile number associated with your
          account.
        </Text>

        <TextField
          label="Email ID / Mobile number"
          value={target}
          onChangeText={setTarget}
          autoCapitalize="none"
          placeholder="you@example.com or 9876543210"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Submit" onPress={handleSubmit} loading={isSubmitting} />
        <Button
          title="Back to log in"
          variant="ghost"
          onPress={() => navigation.navigate('Login')}
          style={styles.spaced}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

export default function ForgotPasswordScreen({ navigation }) {
  if (Platform.OS === 'web') {
    return <WebForgotPassword navigation={navigation} />;
  }
  return <NativeForgotPassword navigation={navigation} />;
}

const styles = StyleSheet.create({
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
  spaced: {
    marginTop: spacing.sm,
  },
});
