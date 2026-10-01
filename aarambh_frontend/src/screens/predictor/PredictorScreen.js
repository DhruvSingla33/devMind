import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { predictRank, predictColleges } from '../../api/predictor.api';
import { extractErrorMessage } from '../../api/client';
import { spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';

const CATEGORIES = ['GEN', 'OBC', 'SC', 'ST', 'EWS'];
const YEARS = [2026, 2025, 2024, 2023];
const DEFAULT_YEAR = YEARS[0];

function YearSelector({ year, onChange }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <>
      <Text style={styles.label}>NEET year</Text>
      <View style={styles.categoryRow}>
        {YEARS.map((value) => (
          <Button
            key={value}
            title={String(value)}
            variant={year === value ? 'primary' : 'outline'}
            onPress={() => onChange(value)}
            style={styles.categoryButton}
          />
        ))}
      </View>
    </>
  );
}

export default function PredictorScreen() {
  const styles = useThemedStyles(makeStyles);
  const [mode, setMode] = useState('rank');

  return (
    <ScreenContainer>
      <View style={styles.modeRow}>
        <Button
          title="Rank predictor"
          variant={mode === 'rank' ? 'primary' : 'outline'}
          onPress={() => setMode('rank')}
          style={styles.modeButton}
        />
        <Button
          title="College predictor"
          variant={mode === 'colleges' ? 'primary' : 'outline'}
          onPress={() => setMode('colleges')}
          style={styles.modeButton}
        />
      </View>

      {mode === 'rank' ? <RankPredictor /> : <CollegePredictor />}
    </ScreenContainer>
  );
}

function RankPredictor() {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [marks, setMarks] = useState('');
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    setError(null);
    setResult(null);
    setIsSubmitting(true);
    try {
      const data = await predictRank({ marks: Number(marks), year });
      setResult(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <TextField
        label="Your NEET marks (out of 720)"
        value={marks}
        onChangeText={setMarks}
        keyboardType="number-pad"
        placeholder="e.g. 620"
      />
      <YearSelector year={year} onChange={setYear} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Estimate my rank" onPress={handlePredict} loading={isSubmitting} />

      {result ? (
        <Card style={styles.resultCard}>
          <Text style={typography.bodyMuted}>Estimated rank</Text>
          <Text style={styles.bigNumber}>{result.estimatedRank?.toLocaleString('en-IN')}</Text>
          <Text style={typography.bodyMuted}>
            Likely range: {result.rankRange.min?.toLocaleString('en-IN')} –{' '}
            {result.rankRange.max?.toLocaleString('en-IN')}
          </Text>
          {result.takeaway ? <Text style={styles.takeaway}>{result.takeaway}</Text> : null}
          <Text style={[typography.caption, styles.yearNote]}>
            Based on NEET {result.year ?? year} trends
          </Text>
        </Card>
      ) : null}
    </ScrollView>
  );
}

function CollegePredictor() {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [marks, setMarks] = useState('');
  const [category, setCategory] = useState('GEN');
  const [state, setState] = useState('');
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    setError(null);
    setResult(null);
    setIsSubmitting(true);
    try {
      const data = await predictColleges({
        marks: Number(marks),
        category,
        state: state.trim() || undefined,
        year,
      });
      setResult(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <TextField
        label="Your NEET marks (out of 720)"
        value={marks}
        onChangeText={setMarks}
        keyboardType="number-pad"
        placeholder="e.g. 620"
      />

      <YearSelector year={year} onChange={setYear} />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map((value) => (
          <Button
            key={value}
            title={value}
            variant={category === value ? 'primary' : 'outline'}
            onPress={() => setCategory(value)}
            style={styles.categoryButton}
          />
        ))}
      </View>

      <TextField
        label="State (optional)"
        value={state}
        onChangeText={setState}
        placeholder="e.g. Delhi"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Find probable colleges" onPress={handlePredict} loading={isSubmitting} />

      {result ? (
        <>
          <Text style={[typography.bodyMuted, styles.summary]}>
            Estimated rank ~{result.rankPrediction.estimatedRank} · {result.probableCollegesCount}{' '}
            probable colleges
          </Text>
          {result.colleges.map((college) => (
            <Card key={college._id} style={styles.collegeCard}>
              <Text style={typography.h3}>{college.collegeName}</Text>
              <Text style={[typography.bodyMuted, styles.meta]}>
                {college.state} · {college.course} · {college.quota} quota
              </Text>
              <Text style={[typography.bodyMuted, styles.meta]}>
                Closing rank {college.closingRank} · {college.closingMarks} marks · {college.seats}{' '}
                seats
              </Text>
            </Card>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

const makeStyles = ({ colors, typography }) => StyleSheet.create({
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  modeButton: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  categoryButton: {
    minWidth: 70,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
  resultCard: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  bigNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.primary,
    marginVertical: spacing.xs,
  },
  takeaway: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    color: colors.primary,
  },
  yearNote: {
    marginTop: spacing.sm,
  },
  summary: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  collegeCard: {
    marginBottom: spacing.sm,
  },
  meta: {
    marginTop: 2,
  },
});
