import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from './Button';
import { pickFile, uploadFile } from '../utils/webUpload';
import { spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

export default function FilePickerButton({
  label = 'Upload file',
  accept = 'application/pdf',
  folder = 'general',
  value,
  onUploaded,
}) {
  const styles = useThemedStyles(makeStyles);
  const [status, setStatus] = useState('idle'); // idle | picking | uploading | error
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);

  const handlePress = async () => {
    setError(null);
    try {
      setStatus('picking');
      const file = await pickFile(accept);
      setFileName(file.name);
      setStatus('uploading');
      const result = await uploadFile(file, folder);
      setStatus('idle');
      onUploaded?.(result);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Button
        title={status === 'uploading' ? 'Uploading…' : label}
        variant="outline"
        loading={status === 'uploading'}
        onPress={handlePress}
      />
      {value ? (
        <Text style={styles.fileText} numberOfLines={1}>
          ✓ {fileName || 'Uploaded'} —{' '}
          <Text style={styles.link} onPress={() => window?.open?.(value, '_blank')}>
            view current file
          </Text>
        </Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const makeStyles = ({ colors, typography }) => StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  fileText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
