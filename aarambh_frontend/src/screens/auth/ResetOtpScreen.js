import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { AuthCard, AuthField, authErrorStyle } from '../../components/AuthCard';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../api/client';
import { notify } from '../../utils/alert';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/theme';

function useResetOtpLogic(navigation, target) {
  const { requestOtp } = useAuth();
  const [otpCode, setOtpCode] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState(null);

  const handleContinue = () => {
    setError(null);
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setError('Enter the 6-digit code sent to you.');
      return;
    }
    navigation.navigate('ResetPasswordOtp', { target, otpCode: otpCode.trim() });
  };

  const handleResend = async () => {
    setError(null);
    setIsResending(true);
    try {
      await requestOtp(target, 'reset_password');
      notify('OTP resent', `A new code has been sent to ${target}.`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  return { otpCode, setOtpCode, isResending, error, handleContinue, handleResend };
}

function WebResetOtp({ navigation, target }) {
  const { otpCode, setOtpCode, isResending, error, handleContinue, handleResend } = useResetOtpLogic(
    navigation,
    target
  );

  return (
    <AuthCard title="Enter OTP" subtitle={`A 6-digit code has been sent to ${target}`}>
      <AuthField
        label="6-digit code"
        value={otpCode}
        onChangeText={setOtpCode}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="123456"
      />

      {error ? <Text style={authErrorStyle()}>{error}</Text> : null}

      <Button title="Continue" onPress={handleContinue} />
      <Button title="Resend code" variant="ghost" onPress={handleResend} loading={isResending} />
    </AuthCard>
  );
}

function NativeResetOtp({ navigation, target }) {
  const { otpCode, setOtpCode, isResending, error, handleContinue, handleResend } = useResetOtpLogic(
    navigation,
    target
  );

  return (
    <ScreenContainer>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={typography.h2}>Enter OTP</Text>
        <Text style={[typography.bodyMuted, styles.subtitle]}>
          A 6-digit code has been sent to {target}
        </Text>

        <TextField
          label="6-digit code"
          value={otpCode}
          onChangeText={setOtpCode}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="123456"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Continue" onPress={handleContinue} />
        <Button
          title="Resend code"
          variant="ghost"
          onPress={handleResend}
          loading={isResending}
          style={styles.spaced}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

export default function ResetOtpScreen({ navigation, route }) {
  const target = route.params?.target ?? '';
  if (Platform.OS === 'web') {
    return <WebResetOtp navigation={navigation} target={target} />;
  }
  return <NativeResetOtp navigation={navigation} target={target} />;
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
