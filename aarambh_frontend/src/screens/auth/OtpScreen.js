import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { AuthCard, AuthField, AuthFooterLink, AuthMessage } from '../../components/AuthCard';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../api/client';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

function useOtpLogic() {
  const { requestOtp, confirmOtp } = useAuth();
  const [step, setStep] = useState('target'); // 'target' | 'code'
  const [target, setTarget] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const handleSendOtp = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await requestOtp(target.trim(), 'login');
      setInfo('A 6-digit code has been sent. It also prints to the backend console in dev mode.');
      setStep('code');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await confirmOtp(target.trim(), otpCode.trim(), 'login', name.trim());
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    target,
    setTarget,
    name,
    setName,
    otpCode,
    setOtpCode,
    isSubmitting,
    error,
    info,
    handleSendOtp,
    handleVerifyOtp,
  };
}

function WebOtp({ navigation }) {
  const styles = useThemedStyles(makeStyles);
  const {
    step,
    setStep,
    target,
    setTarget,
    name,
    setName,
    otpCode,
    setOtpCode,
    isSubmitting,
    error,
    info,
    handleSendOtp,
    handleVerifyOtp,
  } = useOtpLogic();

  return (
    <AuthCard
      title="Sign in with OTP"
      subtitle="Use your phone number or email — no password needed."
      onLogoPress={() => navigation.navigate('Welcome')}
      footer={
        <AuthFooterLink
          prompt="Prefer a password?"
          actionLabel="Sign in"
          onPress={() => navigation.navigate('Login')}
        />
      }
    >
      {step === 'target' ? (
        <>
          <AuthField
            label="Phone or email"
            value={target}
            onChangeText={setTarget}
            autoCapitalize="none"
            placeholder="+919876543210 or you@example.com"
          />
          {error ? <AuthMessage>{error}</AuthMessage> : null}
          <Button title="Send OTP" onPress={handleSendOtp} loading={isSubmitting} />
        </>
      ) : (
        <>
          {info ? <AuthMessage type="info">{info}</AuthMessage> : null}
          <AuthField
            label="Name (only needed for new accounts)"
            value={name}
            onChangeText={setName}
            placeholder="Jane Doe"
          />
          <AuthField
            label="6-digit code"
            value={otpCode}
            onChangeText={setOtpCode}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="123456"
          />
          {error ? <AuthMessage>{error}</AuthMessage> : null}
          <Button title="Verify & continue" onPress={handleVerifyOtp} loading={isSubmitting} />
          <Button
            title="Change phone / email"
            variant="ghost"
            onPress={() => setStep('target')}
            style={styles.webGhost}
          />
        </>
      )}
    </AuthCard>
  );
}

function NativeOtp() {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const {
    step,
    setStep,
    target,
    setTarget,
    name,
    setName,
    otpCode,
    setOtpCode,
    isSubmitting,
    error,
    info,
    handleSendOtp,
    handleVerifyOtp,
  } = useOtpLogic();

  return (
    <ScreenContainer>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={typography.h2}>Sign in with OTP</Text>
        <Text style={[typography.bodyMuted, styles.subtitle]}>
          Use your phone number or email — no password needed.
        </Text>

        {step === 'target' ? (
          <>
            <TextField
              label="Phone or email"
              value={target}
              onChangeText={setTarget}
              autoCapitalize="none"
              placeholder="+919876543210 or you@example.com"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Send OTP" onPress={handleSendOtp} loading={isSubmitting} />
          </>
        ) : (
          <>
            {info ? <Text style={styles.info}>{info}</Text> : null}
            <TextField
              label="Name (only needed for new accounts)"
              value={name}
              onChangeText={setName}
              placeholder="Jane Doe"
            />
            <TextField
              label="6-digit code"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="123456"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Verify & continue" onPress={handleVerifyOtp} loading={isSubmitting} />
            <Button
              title="Change phone / email"
              variant="ghost"
              onPress={() => setStep('target')}
              style={styles.spaced}
            />
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

export default function OtpScreen({ navigation }) {
  if (Platform.OS === 'web') {
    return <WebOtp navigation={navigation} />;
  }
  return <NativeOtp />;
}

const makeStyles = ({ colors }) => StyleSheet.create({
  webGhost: {
    marginTop: spacing.xs,
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
  info: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  spaced: {
    marginTop: spacing.sm,
  },
});
