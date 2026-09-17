import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text } from 'react-native';
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

function useSignupLogic() {
  const { signup, requestGoogleSignIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSignup = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signup(name.trim(), email.trim(), password);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

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
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    isGoogleSubmitting,
    error,
    handleSignup,
    handleGoogleSignup,
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
      <GoogleButton onPress={handleGoogleSignup} loading={isGoogleSubmitting} />
      <AuthDivider />

      <AuthField label="Full name" value={name} onChangeText={setName} placeholder="Jane Doe" />
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

      {error ? <Text style={authErrorStyle()}>{error}</Text> : null}

      <Button title="Continue" onPress={handleSignup} loading={isSubmitting} />
    </AuthCard>
  );
}

function NativeSignup({ navigation }) {
  const { name, setName, email, setEmail, password, setPassword, isSubmitting, error, handleSignup } =
    useSignupLogic();

  return (
    <ScreenContainer>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={typography.h2}>Create your account</Text>
        <Text style={[typography.bodyMuted, styles.subtitle]}>
          Start practicing high-probability NCERT questions today.
        </Text>

        <TextField label="Full name" value={name} onChangeText={setName} placeholder="Jane Doe" />
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
