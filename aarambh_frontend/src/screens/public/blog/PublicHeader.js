import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Logo from '../../../components/Logo';
import Button from '../../../components/Button';
import ThemeToggle from '../../../components/ThemeToggle';
import { radius, spacing } from '../../../theme/theme';
import { useThemedStyles } from '../../../theme/ThemeContext';
import { useBreakpoint } from '../../../theme/responsive';
import { useAuth } from '../../../context/AuthContext';

// Website-style top bar for the public blog pages. Mirrors the landing page's
// navbar (WelcomeScreen) — logo, section links, theme toggle, auth buttons —
// so the blog reads as part of aarambhstudy.in instead of an isolated page
// with a bare "Blog" title.
//
// Web only: on native the blog opens inside the app's native-stack header
// (which keeps the back gesture), so this renders nothing there to avoid a
// doubled-up bar. The stacks set `headerShown: Platform.OS !== 'web'` for the
// Blog/BlogPost screens to match.

// Section links live on the landing page; tapping one takes the visitor back
// to the website home. "Blog" stays on the blog list.
const SECTION_LINKS = [
  { key: 'subjects', label: 'Subjects' },
  { key: 'features', label: 'Features' },
  { key: 'predictor', label: 'Try it' },
  { key: 'blog', label: 'Blog' },
  { key: 'faq', label: 'FAQ' },
  { key: 'contact', label: 'Contact' },
];

function NavPill({ label, active, onPress }) {
  const styles = useThemedStyles(makeStyles);
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={styles.navPill}
    >
      <Text style={[styles.navPillText, (isHovered || active) && styles.navPillTextHovered]}>
        {label}
      </Text>
      <View
        style={[styles.navPillUnderline, (isHovered || active) && styles.navPillUnderlineHovered]}
      />
    </Pressable>
  );
}

export default function PublicHeader({ activeKey = 'blog' }) {
  const navigation = useNavigation();
  const styles = useThemedStyles(makeStyles);
  const { isTablet } = useBreakpoint();
  const { isAuthenticated } = useAuth();

  // Native keeps its own stack header (back gesture + title); only the web
  // build needs this website chrome.
  if (Platform.OS !== 'web') return null;

  const goHome = () => {
    if (isAuthenticated) {
      navigation.navigate('Tabs', { screen: 'Home' });
    } else {
      navigation.navigate('Welcome');
    }
  };

  const onNavigate = (key) => {
    if (key === 'blog') {
      navigation.navigate('Blog');
      return;
    }
    // Every other link is a section of the landing page — send the visitor
    // back to the website home.
    goHome();
  };

  return (
    <View style={styles.navBar}>
      <View style={styles.navRow}>
        <Pressable onPress={goHome} style={styles.logoWrap} accessibilityRole="link">
          <Logo size="sm" />
        </Pressable>

        {isTablet ? (
          <View style={styles.navPills}>
            {SECTION_LINKS.map((link) => (
              <NavPill
                key={link.key}
                label={link.label}
                active={link.key === activeKey}
                onPress={() => onNavigate(link.key)}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.navActions}>
          <ThemeToggle style={styles.navThemeToggle} />
          {isAuthenticated ? (
            <Button
              title="Back to app"
              size={isTablet ? 'md' : 'sm'}
              onPress={goHome}
            />
          ) : (
            <>
              <Button
                title="Log in"
                variant="ghost"
                size={isTablet ? 'md' : 'sm'}
                onPress={() => navigation.navigate('Login')}
              />
              <Button
                title="Sign up"
                size={isTablet ? 'md' : 'sm'}
                onPress={() => navigation.navigate('Signup')}
                style={styles.navSignup}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const makeStyles = ({ colors }) =>
  StyleSheet.create({
    navBar: {
      zIndex: 30,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    navRow: {
      width: '100%',
      maxWidth: 1120,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      rowGap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
    },
    logoWrap: {
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    navPills: {
      flexDirection: 'row',
      gap: spacing.lg,
    },
    navPill: {
      paddingVertical: spacing.xs,
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    navPillText: {
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: 0.1,
      color: colors.textSecondary,
      ...Platform.select({
        web: { transitionProperty: 'color', transitionDuration: '150ms' },
        default: {},
      }),
    },
    navPillTextHovered: {
      color: colors.primary,
    },
    navPillUnderline: {
      height: 2,
      marginTop: 4,
      borderRadius: 1,
      width: '100%',
      backgroundColor: colors.primary,
      opacity: 0,
      ...Platform.select({
        web: { transitionProperty: 'opacity, transform', transitionDuration: '180ms' },
        default: {},
      }),
      transform: [{ scaleX: 0 }],
    },
    navPillUnderlineHovered: {
      opacity: 1,
      transform: [{ scaleX: 1 }],
    },
    navActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    navThemeToggle: {
      marginRight: spacing.xs,
    },
    navSignup: {
      minWidth: 100,
    },
  });
