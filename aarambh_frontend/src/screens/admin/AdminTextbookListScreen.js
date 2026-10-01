import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Grid from '../../components/Grid';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { listTextbooks } from '../../api/textbooks.api';
import { extractErrorMessage } from '../../api/client';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

export default function AdminTextbookListScreen({ navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [textbooks, setTextbooks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await listTextbooks();
      setTextbooks(data);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  if (status === 'loading') return <LoadingState label="Loading textbooks…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={load} />;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Button title="+ New textbook" onPress={() => navigation.navigate('AdminTextbookForm')} />
      </View>
      <Grid
        data={textbooks}
        keyExtractor={(item) => item._id}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<ErrorState message="No textbooks yet — create one above." />}
        renderItem={({ item }) => (
          <Card
            onPress={() =>
              navigation.navigate('AdminTextbookDetail', { code: item.code, textbookId: item._id })
            }
            style={styles.card}
          >
            <Text style={styles.icon}>{item.icon || '📚'}</Text>
            <Text style={typography.h3}>{item.title}</Text>
            <Text style={[typography.bodyMuted, styles.meta]}>
              Class {item.classLevel} · {item.subject}
            </Text>
            <Text style={[typography.caption, styles.code]}>{item.code}</Text>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const makeStyles = ({ colors, typography }) => StyleSheet.create({
  header: {
    paddingVertical: spacing.md,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  meta: {
    marginTop: 2,
  },
  code: {
    marginTop: spacing.xs,
    color: colors.textMuted,
  },
});
