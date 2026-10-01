import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { AuthCard, AuthField, AuthMessage } from '../../components/AuthCard';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../api/client';
import { notify } from '../../utils/alert';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

function useResetPasswordLogic(navigation, target, otpCode) {
  const { resetPassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(target, otpCode, newPassword);
      notify('Password reset', 'Your password has been reset. Please log in with your new password.');
      navigation.navigate('Login');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { newPassword, setNewPassword, confirmPassword, setConfirmPassword, isSubmitting, error, handleSubmit };
}

function WebResetPassword({ navigation, target, otpCode }) {
  const {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isSubmitting,
    error,
    handleSubmit,
  } = useResetPasswordLogic(navigation, target, otpCode);

  return (
    <AuthCard title="Reset Password" subtitle="Set a new password for your account.">
      <AuthField label="New password" value={newPassword} onChangeText={setNewPassword} secureEntry placeholder="At least 6 characters" />
      <AuthField
        label="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureEntry
        placeholder="Re-enter new password"
      />

      {error ? <AuthMessage>{error}</AuthMessage> : null}

      <Button title={isSubmitting ? 'Submitting...' : 'Submit'} onPress={handleSubmit} loading={isSubmitting} />
    </AuthCard>
  );
}

function NativeResetPassword({ navigation, target, otpCode }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isSubmitting,
    error,
    handleSubmit,
  } = useResetPasswordLogic(navigation, target, otpCode);

  return (
    <ScreenContainer>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={typography.h2}>Reset Password</Text>
        <Text style={[typography.bodyMuted, styles.subtitle]}>Set a new password for your account.</Text>

        <TextField
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="At least 6 characters"
        />
        <TextField
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Re-enter new password"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title={isSubmitting ? 'Submitting...' : 'Submit'}
          onPress={handleSubmit}
          loading={isSubmitting}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

export default function ResetPasswordScreen({ navigation, route }) {
  const target = route.params?.target ?? '';
  const otpCode = route.params?.otpCode ?? '';
  if (Platform.OS === 'web') {
    return <WebResetPassword navigation={navigation} target={target} otpCode={otpCode} />;
  }
  return <NativeResetPassword navigation={navigation} target={target} otpCode={otpCode} />;
}

const makeStyles = ({ colors }) => StyleSheet.create({
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
});
