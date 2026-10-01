import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../api/client';
import { notify } from '../../utils/alert';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

export default function ResetPasswordScreen({ navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { changePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    if (!oldPassword) {
      setError('Enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      await changePassword(oldPassword, newPassword);
      notify('Password updated', 'Your password has been changed successfully.');
      navigation.goBack();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer maxWidth={520}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={typography.h2}>Reset password</Text>
        <Text style={[typography.bodyMuted, styles.subtitle]}>
          Enter your current password and choose a new one.
        </Text>

        <TextField
          label="Current password"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
          placeholder="••••••••"
        />
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
