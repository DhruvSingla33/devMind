import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { radius, shadow, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../theme/responsive';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../api/client';
import { notify } from '../../utils/alert';
import TextField from '../../components/TextField';
import SelectField from '../../components/SelectField';
import Button from '../../components/Button';
import { SectionCard, Pill } from './DashboardUI';
import { CHART, initials } from './dashboardUtils';

const CLASS_OPTIONS = [
  { value: '11th', label: 'Class 11' },
  { value: '12th', label: 'Class 12' },
  { value: 'dropper', label: 'Dropper' },
];

function classLabel(level) {
  const o = CLASS_OPTIONS.find((c) => c.value === level);
  return o ? o.label : 'Not set';
}

function targetYearFallback(level) {
  const y = new Date().getFullYear();
  const l = String(level || '').toLowerCase();
  if (l.includes('12')) return y + 1;
  if (l.includes('11')) return y + 2;
  return y;
}

function monthYear(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

// Decorative mountain range along the bottom of the hero card.
function Mountains({ color }) {
  return (
    <Svg width="100%" height="72" viewBox="0 0 400 72" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
      <Path d="M0 72 L70 30 L130 60 L210 18 L280 55 L340 32 L400 60 L400 72 Z" fill={color} opacity={0.5} />
      <Path d="M0 72 L50 50 L120 66 L190 42 L260 66 L330 48 L400 70 L400 72 Z" fill={color} opacity={0.8} />
    </Svg>
  );
}

function InfoField({ icon, label, value, styles }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Text style={{ fontSize: 15 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileSection({ user, onBack }) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { width } = useBreakpoint();
  const { updateProfile } = useAuth();
  const twoCol = width >= 900;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  const view = useMemo(() => {
    const classText = classLabel(user?.classLevel);
    return {
      name: user?.name || 'Student',
      email: user?.email || '—',
      phone: user?.phone ? (String(user.phone).startsWith('+') ? user.phone : `+91 ${user.phone}`) : '—',
      verified: !!user?.isEmailVerified,
      classText,
      targetExam: user?.targetExam || 'NEET / JEE',
      targetYear: user?.targetYear ? String(user.targetYear) : String(targetYearFallback(user?.classLevel)),
      institute: user?.institute || 'Not set',
      prepSince: monthYear(user?.createdAt),
    };
  }, [user]);

  const openEdit = () => {
    setForm({
      name: user?.name || '',
      phone: user?.phone ? String(user.phone) : '',
      classLevel: user?.classLevel || '12th',
      targetExam: user?.targetExam || '',
      targetYear: user?.targetYear ? String(user.targetYear) : '',
      institute: user?.institute || '',
    });
    setEditing(true);
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        classLevel: form.classLevel,
        targetExam: form.targetExam.trim(),
        institute: form.institute.trim(),
        targetYear: form.targetYear ? Number(form.targetYear) : null,
      };
      await updateProfile(payload);
      setEditing(false);
      notify('Profile updated', 'Your details have been saved.');
    } catch (e) {
      notify('Could not save', extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const heroColors = isDark ? ['#1E2A52', '#141E3A'] : ['#2E3E7A', '#1F2C5C'];
  const rightDetails = [
    { icon: '🎯', label: 'Target Exam', value: view.targetExam },
    { icon: '📅', label: 'Target Year', value: view.targetYear },
    { icon: '🎓', label: 'Current Class', value: view.classText },
    { icon: '🏛️', label: 'Institute / School', value: view.institute },
  ];

  // Back exits the edit form to the profile view first; only from the view does
  // it leave the profile section entirely.
  const handleBack = () => {
    if (editing) {
      setEditing(false);
      return;
    }
    onBack?.();
  };

  return (
    <View style={{ gap: spacing.md }}>
      {/* Heading with back arrow */}
      <View style={styles.headRow}>
        {(onBack || editing) ? (
          <Pressable onPress={handleBack} hitSlop={8} style={styles.backBtn} accessibilityLabel="Back">
            <Text style={{ fontSize: 20, color: colors.textSecondary }}>←</Text>
          </Pressable>
        ) : null}
        <View>
          <Text style={styles.pageTitle}>My Profile</Text>
          <Text style={styles.pageSub}>View and manage your personal and academic details</Text>
        </View>
      </View>

      {editing ? (
        /* ----------------------------- EDIT FORM ----------------------------- */
        <SectionCard title="Edit Profile" icon="✎">
          <View style={[styles.formGrid, !twoCol && { flexDirection: 'column' }]}>
            <View style={styles.formCol}>
              <TextField
                label="Full Name"
                value={form.name}
                onChangeText={(t) => setField('name', t)}
                placeholder="Your name"
              />
              <TextField
                label="Mobile Number"
                value={form.phone}
                onChangeText={(t) => setField('phone', t)}
                placeholder="10-digit mobile"
                keyboardType="phone-pad"
                maxLength={10}
              />
              <SelectField
                label="Current Class"
                value={form.classLevel}
                options={CLASS_OPTIONS}
                onSelect={(v) => setField('classLevel', v)}
              />
            </View>
            <View style={styles.formCol}>
              <TextField
                label="Target Exam"
                value={form.targetExam}
                onChangeText={(t) => setField('targetExam', t)}
                placeholder="e.g. JEE Main + Advanced"
              />
              <TextField
                label="Target Year"
                value={form.targetYear}
                onChangeText={(t) => setField('targetYear', t.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 2027"
                keyboardType="number-pad"
                maxLength={4}
              />
              <TextField
                label="Institute / School"
                value={form.institute}
                onChangeText={(t) => setField('institute', t)}
                placeholder="e.g. Allen Career Institute"
              />
            </View>
          </View>
          <View style={styles.formActions}>
            <Button title="Cancel" variant="outline" onPress={() => setEditing(false)} style={{ minWidth: 120 }} />
            <Button title="Save Changes" onPress={save} loading={saving} style={{ minWidth: 150 }} />
          </View>
        </SectionCard>
      ) : (
        <>
          {/* ------------------------------ HERO ------------------------------ */}
          <LinearGradient colors={heroColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <Mountains color={isDark ? '#0E1630' : '#16224A'} />

            <Pressable onPress={openEdit} style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.85 }]}>
              <Text style={styles.editBtnTxt}>✎  Edit Profile</Text>
            </Pressable>

            <View style={[styles.heroInner, !twoCol && { flexDirection: 'column', gap: spacing.lg }]}>
              <View style={[styles.identity, twoCol && { flex: 1.4 }]}>
                <View style={styles.avatarWrap}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarTxt}>{initials(view.name)}</Text>
                  </View>
                  <View style={styles.camBadge}>
                    <Text style={{ fontSize: 10 }}>📷</Text>
                  </View>
                </View>
                <View style={{ flex: 1, gap: 7 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{view.name}</Text>
                    {view.verified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedTick}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.heroMuted}>✉️  {view.email}</Text>
                  <Text style={styles.heroMuted}>📞  {view.phone}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 4 }}>
                    <Pill label="JEE Aspirant" color={CHART.green} />
                  </View>
                </View>
              </View>

              <View style={[styles.heroRight, twoCol && { flex: 1 }]}>
                {rightDetails.map((d) => (
                  <View key={d.label} style={styles.heroDetail}>
                    <View style={styles.heroDetailIcon}>
                      <Text style={{ fontSize: 14 }}>{d.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.heroDetailLabel}>{d.label}</Text>
                      <Text style={styles.heroDetailValue}>{d.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>

          {/* ----------------------- ACADEMIC INFORMATION ---------------------- */}
          <SectionCard
            title="Academic Information"
            icon="🎓"
            right={
              <Pressable onPress={openEdit} style={({ pressed }) => [styles.smallEdit, pressed && { opacity: 0.85 }]}>
                <Text style={styles.smallEditTxt}>✎ Edit</Text>
              </Pressable>
            }
          >
            <View style={[styles.infoGrid, !twoCol && { flexDirection: 'column' }]}>
              <View style={styles.infoCol}>
                <InfoField icon="🎯" label="Target Exam" value={view.targetExam} styles={styles} />
                <InfoField icon="🎓" label="Current Class" value={view.classText} styles={styles} />
                <InfoField icon="🏛️" label="Institute / School" value={view.institute} styles={styles} />
              </View>
              <View style={styles.infoCol}>
                <InfoField icon="📅" label="Target Year" value={view.targetYear} styles={styles} />
                <InfoField icon="🗓️" label="Preparation Since" value={view.prepSince} styles={styles} />
              </View>
            </View>
          </SectionCard>
        </>
      )}
    </View>
  );
}

const makeStyles = ({ colors }) =>
  StyleSheet.create({
    headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    backBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    pageTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
    pageSub: { fontSize: 13.5, color: colors.textSecondary, marginTop: 4 },

    hero: { borderRadius: radius.lg, padding: spacing.lg, overflow: 'hidden', ...shadow.card },
    heroInner: { flexDirection: 'row', gap: spacing.xl, zIndex: 1 },
    identity: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
    avatarWrap: { position: 'relative' },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: '#6C7BF0',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarTxt: { color: '#fff', fontSize: 28, fontWeight: '800' },
    camBadge: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: '#1C2444',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    name: { fontSize: 22, fontWeight: '800', color: '#fff' },
    verifiedBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: CHART.blue,
      alignItems: 'center',
      justifyContent: 'center',
    },
    verifiedTick: { color: '#fff', fontSize: 11, fontWeight: '900' },
    heroMuted: { color: 'rgba(255,255,255,0.80)', fontSize: 13.5 },

    heroRight: { gap: 14 },
    editBtn: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.md,
      zIndex: 2,
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)',
      borderRadius: radius.pill,
      paddingVertical: 8,
      paddingHorizontal: 16,
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    editBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
    heroDetail: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    heroDetailIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 1.5,
      borderColor: 'rgba(120,220,210,0.6)',
      backgroundColor: 'rgba(34,184,166,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroDetailLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 11.5 },
    heroDetailValue: { color: '#fff', fontSize: 13.5, fontWeight: '700', marginTop: 1 },

    smallEdit: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      paddingVertical: 5,
      paddingHorizontal: 12,
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    smallEditTxt: { color: colors.primary, fontWeight: '700', fontSize: 12.5 },

    infoGrid: { flexDirection: 'row', gap: spacing.xl },
    infoCol: { flex: 1, gap: spacing.md },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    infoIcon: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: colors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoLabel: { fontSize: 12, color: colors.textMuted },
    infoValue: { fontSize: 14.5, color: colors.textPrimary, fontWeight: '700', marginTop: 2 },

    formGrid: { flexDirection: 'row', gap: spacing.xl },
    formCol: { flex: 1, gap: spacing.sm },
    formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md, marginTop: spacing.md },
  });
