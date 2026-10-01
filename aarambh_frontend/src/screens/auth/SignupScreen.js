import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import SelectField from '../../components/SelectField';
import Button from '../../components/Button';
import {
  AuthCard,
  AuthField,
  AuthSelect,
  AuthDivider,
  GoogleButton,
  AuthFooterLink,
  AuthMessage,
} from '../../components/AuthCard';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../api/client';
import { notify } from '../../utils/alert';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

const CLASS_OPTIONS = [
  { label: '11th', value: '11th' },
  { label: '12th', value: '12th' },
  { label: 'Dropper', value: 'dropper' },
];

function useSignupLogic() {
  const { signup } = useAuth();
  // requestGoogleSignIn kept on useAuth for the phase-2 Google signup button below.
  const { requestGoogleSignIn } = useAuth();
  const [name, setName] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSignup = async () => {
    setError(null);
    if (!name.trim() || !classLevel || !mobile.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setIsSubmitting(true);
    try {
      await signup(name.trim(), email.trim(), mobile.trim(), classLevel, password);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Not wired to any button yet — Google auth ships in phase 2.
  const handleGoogleSignup = async () => {
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
    name,
    setName,
    classLevel,
    setClassLevel,
    mobile,
    setMobile,
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    isGoogleSubmitting,
    error,
    handleSignup,
    handleGoogleSignup,
  };
}

function WebSignup({ navigation }) {
  const styles = useThemedStyles(makeStyles);
  const {
    name,
    setName,
    classLevel,
    setClassLevel,
    mobile,
    setMobile,
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    // isGoogleSubmitting,
    error,
    handleSignup,
    // handleGoogleSignup,
  } = useSignupLogic();

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start practicing high-probability NCERT questions today."
      onLogoPress={() => navigation.navigate('Welcome')}
      footer={
        <AuthFooterLink
          prompt="Already have an account?"
          actionLabel="Sign in"
          onPress={() => navigation.navigate('Login')}
        />
      }
    >
      {/* Google sign-up ships in phase 2 — kept commented, not removed. */}
      {/* <GoogleButton onPress={handleGoogleSignup} loading={isGoogleSubmitting} /> */}
      {/* <AuthDivider /> */}

      <AuthField label="Full name" value={name} onChangeText={setName} placeholder="Jane Doe" />
      <AuthSelect
        label="Class"
        value={classLevel}
        onSelect={setClassLevel}
        options={CLASS_OPTIONS}
        placeholder="Select your class"
      />
      <AuthField
        label="Mobile number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
        maxLength={10}
        placeholder="9876543210"
      />
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
        placeholder="At least 6 characters"
      />

      {error ? <AuthMessage>{error}</AuthMessage> : null}

      <Button title="Continue" onPress={handleSignup} loading={isSubmitting} />

      <Text style={styles.webTerms}>
        By signing up, you agree to our Terms & Conditions and Privacy Policy.
      </Text>
    </AuthCard>
  );
}

function NativeSignup({ navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const {
    name,
    setName,
    classLevel,
    setClassLevel,
    mobile,
    setMobile,
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    error,
    handleSignup,
  } = useSignupLogic();

  return (
    <ScreenContainer>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={typography.h2}>Create your account</Text>
        <Text style={[typography.bodyMuted, styles.subtitle]}>
          Start practicing high-probability NCERT questions today.
        </Text>

        <TextField label="Full name" value={name} onChangeText={setName} placeholder="Jane Doe" />
        <SelectField
          label="Class"
          value={classLevel}
          onSelect={setClassLevel}
          options={CLASS_OPTIONS}
          placeholder="Select your class"
        />
        <TextField
          label="Mobile number"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          maxLength={10}
          placeholder="9876543210"
        />
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
          placeholder="At least 6 characters"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Create account" onPress={handleSignup} loading={isSubmitting} />

        <Text style={styles.terms}>
          By signing up, you agree to our Terms & Conditions and Privacy Policy.
        </Text>

        <Button
          title="Already have an account? Log in"
          variant="ghost"
          onPress={() => navigation.navigate('Login')}
          style={styles.spaced}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

export default function SignupScreen({ navigation }) {
  if (Platform.OS === 'web') {
    return <WebSignup navigation={navigation} />;
  }
  return <NativeSignup navigation={navigation} />;
}

const makeStyles = ({ colors, typography }) => StyleSheet.create({
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
  terms: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  webTerms: {
    fontSize: 12,
    color: '#9A9AA4',
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
