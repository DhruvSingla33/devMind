import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, spacing } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../theme/responsive';
import { useAuth } from '../../context/AuthContext';
import { getPrepLabAnalytics } from '../../api/analytics.api';
import { extractErrorMessage } from '../../api/client';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import ThemeToggle from '../../components/ThemeToggle';
import Logo from '../../components/Logo';
import LeaderboardScreen from '../leaderboard/LeaderboardScreen';
import SubscriptionScreen from '../premium/SubscriptionScreen';
import BookmarksScreen from '../bookmarks/BookmarksScreen';
import NotesListScreen from '../notes/NotesListScreen';
import NoteEditorScreen from '../notes/NoteEditorScreen';
import TestListScreen from '../tests/TestListScreen';
import TestAttemptScreen from '../tests/TestAttemptScreen';
import ProfileScreen from '../profile/ProfileScreen';
import TextbookListScreen from '../textbooks/TextbookListScreen';
import MentorListScreen from '../mentors/MentorListScreen';
import MyDoubtsScreen from '../doubts/MyDoubtsScreen';
import BatchListScreen from '../batches/BatchListScreen';
import PredictorScreen from '../predictor/PredictorScreen';
import PulseScreen from '../pulse/PulseScreen';
import HomeSection from './HomeSection';
import OverviewSection from './OverviewSection';
import AnalyticsSection from './AnalyticsSection';
import ProfileSection from './ProfileSection';
import { initials } from './dashboardUtils';

// Sidebar items. `section` items switch the in-screen view; `route` items jump
// into the rest of the app (they map onto the existing navigation stacks).
// Profile is intentionally NOT here — it opens only from the top-right chip.
const NAV = [
  { key: 'home', label: 'Home', icon: '🏠', section: 'home' },
  { key: 'analytics', label: 'Analytics', icon: '📊', section: 'analytics' },
  { key: 'practice', label: 'Practice', icon: '📝', section: 'practice' },
  { key: 'books', label: 'Study Material', icon: '📚', section: 'books' },
  { key: 'bookmarks', label: 'Bookmarks', icon: '🔖', section: 'bookmarks' },
  { key: 'notes', label: 'Notes', icon: '🗒️', section: 'notes' },
  { key: 'doubts', label: 'Ask a Doubt', icon: '💬', section: 'doubts' },
  { key: 'mentors', label: 'Mentors', icon: '🎓', section: 'mentors' },
  { key: 'batches', label: 'Batches', icon: '🏫', section: 'batches' },
  { key: 'predictor', label: 'Rank Predictor', icon: '📈', section: 'predictor' },
  { key: 'pulse', label: 'Daily Pulse', icon: '⚡', section: 'pulse' },
  { key: 'leaderboard', label: 'Leaderboard', icon: '🏆', section: 'leaderboard' },
  { key: 'aarambhplus', label: 'Aarambh+', icon: '⭐', section: 'aarambhplus' },
  { key: 'settings', label: 'Settings', icon: '⚙️', section: 'settings' },
];

// Sections that embed an existing full screen (own scroll / full-bleed layout).
const EMBEDDED_SECTIONS = [
  'leaderboard',
  'aarambhplus',
  'practice',
  'bookmarks',
  'notes',
  'settings',
  'testAttempt',
  'noteEditor',
  'books',
  'doubts',
  'mentors',
  'batches',
  'predictor',
  'pulse',
];
const FULL_BLEED = new Set(EMBEDDED_SECTIONS);
// Sections with their own in-content heading — skip the breadcrumb row for these.
const OWN_HEADING = new Set([...EMBEDDED_SECTIONS, 'profile']);
const SECTION_TITLE = { home: 'Home', analytics: 'Analytics' };

// Child routes that some embedded screens navigate to with a bare name — valid
// only inside their own stack. We redirect those to the correct nested tab so
// the deeper flows still resolve from the dashboard.
const TEST_ROUTES = ['MixQuizSetup', 'TestAttempt', 'TestResult', 'MyAttempts'];
const MORE_ROUTES = ['NoteEditor', 'NoteDetail'];
const TEXTBOOK_ROUTES = ['TextbookDetail', 'Chapter'];
const MENTOR_ROUTES = ['MentorSlots', 'BookingConfirmation'];
const DOUBT_ROUTES = ['MyDoubts', 'AskDoubt', 'DoubtDetail'];
const BATCH_ROUTES = ['BatchDetail'];

// Wrap a navigation object so bare child-route names resolve into `tab`.
function scopedNavigation(navigation, tab, childRoutes) {
  const redirect = (name, params) => {
    if (typeof name === 'string' && childRoutes.includes(name)) {
      return navigation.navigate(tab, { screen: name, params });
    }
    return navigation.navigate(name, params);
  };
  return { ...navigation, navigate: redirect, push: redirect };
}

// Sidebar sections are in-screen state, not navigation routes, so the address
// bar would otherwise stay on /home. On web we mirror the active section into
// the URL (and read it back on load / browser back-forward) so the path tracks
// what's on screen.
const SECTION_PATH = {
  home: '/home',
  analytics: '/analytics',
  profile: '/profile',
  leaderboard: '/leaderboard',
  aarambhplus: '/aarambh-plus',
  practice: '/practice',
  bookmarks: '/bookmarks',
  notes: '/notes',
  settings: '/settings',
  testAttempt: '/practice/test',
  noteEditor: '/notes/edit',
  books: '/study-material',
  doubts: '/doubts',
  mentors: '/mentors',
  batches: '/batches',
  predictor: '/predictor',
  pulse: '/pulse',
};
const PATH_SECTION = Object.fromEntries(Object.entries(SECTION_PATH).map(([s, p]) => [p, s]));

const sectionFromUrl = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  return PATH_SECTION[window.location.pathname] || null;
};

function NavItem({ item, active, onPress, collapsed }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      style={({ hovered }) => [
        styles.navItem,
        collapsed && styles.navItemCollapsed,
        active && styles.navItemActive,
        hovered && !active && styles.navItemHover,
      ]}
    >
      <Text style={styles.navIcon}>{item.icon}</Text>
      {!collapsed && (
        <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={1}>
          {item.label}
        </Text>
      )}
    </Pressable>
  );
}

function TopBar({ user, styles, colors, onProfile, onToggleSidebar }) {
  return (
    <View style={styles.topBar}>
      {onToggleSidebar ? (
        <Pressable onPress={onToggleSidebar} hitSlop={8} style={styles.hamburger} accessibilityLabel="Toggle sidebar">
          <Text style={{ fontSize: 18, color: colors.textSecondary }}>☰</Text>
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }} />
      <ThemeToggle style={{ marginRight: spacing.md }} />
      <Pressable style={styles.bell} hitSlop={8}>
        <Text style={{ fontSize: 16 }}>🔔</Text>
      </Pressable>
      <Pressable
        onPress={onProfile}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        style={({ hovered, pressed }) => [
          styles.userChip,
          hovered && styles.userChipHover,
          pressed && { opacity: 0.85 },
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{initials(user?.name)}</Text>
        </View>
        <Text style={styles.userName} numberOfLines={1}>
          {user?.name ? user.name.split(' ')[0] : 'Student'}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>▾</Text>
      </Pressable>
    </View>
  );
}

// Slide-in navigation drawer for narrow (mobile) screens. Mirrors the wide
// sidebar's nav items but presents them as a full-height left panel with a
// profile header and theme toggle, opened from the top-bar hamburger.
const DRAWER_W = Math.min(300, Math.round(Dimensions.get('window').width * 0.82));

function MobileDrawer({ visible, onClose, user, activeSection, onNav, onProfile }) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const slide = useRef(new Animated.Value(-DRAWER_W)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(slide, { toValue: -DRAWER_W, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(({ finished }) => finished && setMounted(false));
    }
  }, [visible, mounted, slide, fade]);

  if (!mounted) return null;

  const pick = (item) => {
    onNav(item);
    onClose();
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.drawerRoot}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.drawerScrim, { opacity: fade }]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close menu" />
        </Animated.View>
        <Animated.View style={[styles.drawerPanel, { width: DRAWER_W, transform: [{ translateX: slide }] }]}>
          <View style={styles.drawerBrand}>
            <Logo size="sm" />
          </View>
          <Pressable
            onPress={() => {
              onProfile();
              onClose();
            }}
            style={({ pressed }) => [styles.drawerProfile, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="View profile"
          >
            <View style={styles.drawerAvatar}>
              <Text style={styles.drawerAvatarTxt}>{initials(user?.name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.drawerHi} numberOfLines={1}>
                Hi, {user?.name ? user.name.split(' ')[0] : 'Student'}
              </Text>
              <Text style={styles.drawerViewProfile}>View Profile</Text>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 16 }}>›</Text>
          </Pressable>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.drawerNavList}
            showsVerticalScrollIndicator={false}
          >
            {NAV.map((item) => (
              <NavItem
                key={item.key}
                item={item}
                active={item.section === activeSection}
                onPress={() => pick(item)}
              />
            ))}
          </ScrollView>
          <View style={styles.drawerThemeRow}>
            <Text style={styles.drawerThemeLabel}>App Theme</Text>
            <ThemeToggle />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function DashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { width } = useBreakpoint();
  const { user } = useAuth();

  const wide = width >= 900; // fixed sidebar on wide screens (where the design lives)
  const [section, setSection] = useState(() => sectionFromUrl() || 'home');
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [attemptSession, setAttemptSession] = useState(null);
  const [noteEditorId, setNoteEditorId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPrepLabAnalytics();
      setData(res);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Mirror the active section into the browser URL (web only).
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const path = SECTION_PATH[section];
    if (path && window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, [section]);

  // Keep section in sync with browser back/forward.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;
    const onPop = () => {
      const s = PATH_SECTION[window.location.pathname];
      if (s) setSection(s);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const goProfile = useCallback(() => setSection('profile'), []);

  // Home feature cards → open the matching in-dashboard section.
  const handleFeature = useCallback((target) => {
    const TARGET_SECTION = {
      practice: 'practice',
      bookmarks: 'bookmarks',
      textbooks: 'books',
      mentors: 'mentors',
      doubts: 'doubts',
      batches: 'batches',
      predictor: 'predictor',
      pulse: 'pulse',
      notes: 'notes',
      leaderboard: 'leaderboard',
      analytics: 'analytics',
    };
    const next = TARGET_SECTION[target];
    if (next) setSection(next);
  }, []);

  // Practice's "Start test" launches the attempt INSIDE the dashboard (sidebar
  // stays). Other test routes (mix-quiz setup, result) push onto their stack.
  const practiceNavigation = useMemo(
    () => ({
      ...navigation,
      navigate: (name, params) => {
        if (name === 'TestAttempt') {
          setAttemptSession(params?.session || null);
          setSection('testAttempt');
          return undefined;
        }
        if (TEST_ROUTES.includes(name)) {
          return navigation.navigate('TestsTab', { screen: name, params });
        }
        return navigation.navigate(name, params);
      },
    }),
    [navigation]
  );

  // Notes' "New Note" / note tap opens the editor INSIDE the dashboard so Save
  // returns to the Notes list (not Home).
  const notesNavigation = useMemo(
    () => ({
      ...navigation,
      navigate: (name, params) => {
        if (name === 'NoteEditor') {
          setNoteEditorId(params?.id ?? null);
          setSection('noteEditor');
          return undefined;
        }
        if (MORE_ROUTES.includes(name)) {
          return navigation.navigate('MoreTab', { screen: name, params });
        }
        return navigation.navigate(name, params);
      },
    }),
    [navigation]
  );

  const handleNav = useCallback(
    (item) => {
      if (item.section) {
        setSection(item.section);
        return;
      }
      if (item.route) {
        try {
          navigation.navigate(...item.route);
        } catch (e) {
          // Route may live under a different parent on some builds — ignore.
        }
      }
    },
    [navigation]
  );

  const sidebarCollapsed = wide && collapsed;
  // The in-dashboard test attempt belongs under Practice for nav highlighting.
  const navActiveSection =
    section === 'testAttempt' ? 'practice' : section === 'noteEditor' ? 'notes' : section;

  const Sidebar = (
    <View style={[styles.sidebar, sidebarCollapsed && styles.sidebarCollapsed, !wide && styles.sidebarNarrow]}>
      <View style={[styles.brandRow, !wide && { marginBottom: 0 }]}>
        {!sidebarCollapsed && (
          <View style={{ flex: 1 }}>
            <Logo size="sm" />
          </View>
        )}
        {wide && (
          <Pressable onPress={() => setCollapsed((c) => !c)} hitSlop={8} style={styles.collapseBtn} accessibilityLabel="Collapse sidebar">
            <Text style={{ fontSize: 16, color: colors.textSecondary }}>{sidebarCollapsed ? '»' : '«'}</Text>
          </Pressable>
        )}
      </View>
      <ScrollView
        style={wide ? { flex: 1 } : undefined}
        contentContainerStyle={[styles.navList, !wide && styles.navListNarrow]}
        horizontal={!wide}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {NAV.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            collapsed={sidebarCollapsed}
            active={item.section === navActiveSection}
            onPress={() => handleNav(item)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderBody = () => {
    if (section === 'profile') {
      return <ProfileSection user={user} onBack={() => setSection('home')} />;
    }
    if (section === 'leaderboard') return <LeaderboardScreen />;
    if (section === 'aarambhplus') return <SubscriptionScreen />;
    if (section === 'practice') {
      return <TestListScreen navigation={practiceNavigation} />;
    }
    if (section === 'testAttempt') {
      return (
        <TestAttemptScreen
          session={attemptSession}
          onBack={() => setSection('practice')}
          onFinish={(result) => {
            setSection('practice');
            try {
              navigation.navigate('TestsTab', { screen: 'TestResult', params: { result } });
            } catch (e) {
              // ignore — result route unavailable on this build
            }
          }}
        />
      );
    }
    if (section === 'bookmarks') return <BookmarksScreen navigation={navigation} />;
    if (section === 'notes') {
      return <NotesListScreen navigation={notesNavigation} />;
    }
    if (section === 'noteEditor') {
      return <NoteEditorScreen noteId={noteEditorId} onClose={() => setSection('notes')} />;
    }
    if (section === 'settings') return <ProfileScreen navigation={navigation} />;
    if (section === 'books') {
      return <TextbookListScreen navigation={scopedNavigation(navigation, 'TextbooksTab', TEXTBOOK_ROUTES)} />;
    }
    if (section === 'doubts') {
      return <MyDoubtsScreen navigation={scopedNavigation(navigation, 'MoreTab', DOUBT_ROUTES)} />;
    }
    if (section === 'mentors') {
      return <MentorListScreen navigation={scopedNavigation(navigation, 'MoreTab', MENTOR_ROUTES)} />;
    }
    if (section === 'batches') {
      return <BatchListScreen navigation={scopedNavigation(navigation, 'MoreTab', BATCH_ROUTES)} />;
    }
    if (section === 'predictor') return <PredictorScreen />;
    if (section === 'pulse') return <PulseScreen />;
    if (section === 'home') {
      return <HomeSection user={user} data={data} onFeature={handleFeature} />;
    }
    if (loading) return <LoadingState label="Loading your analytics…" />;
    if (error) return <ErrorState message={error} onRetry={load} />;
    // Analytics: the performance overview + the detailed analytics below it.
    return (
      <View style={{ gap: spacing.md }}>
        <OverviewSection data={data} user={user} showGreeting={false} onViewFocus={() => {}} />
        <AnalyticsSection data={data} onStartPractice={() => setSection('practice')} />
      </View>
    );
  };

  let content;
  if (FULL_BLEED.has(section)) {
    content = <View style={{ flex: 1 }}>{renderBody()}</View>;
  } else if (section !== 'profile' && section !== 'home' && (loading || error)) {
    content = renderBody();
  } else {
    content = (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {renderBody()}
      </ScrollView>
    );
  }

  // Wide: fixed left sidebar + content column. Narrow: brand + top bar, a
  // horizontal nav rail, then the content stacked underneath.
  if (wide) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.rowLayout}>
          {Sidebar}
          <View style={styles.main}>
            <TopBar user={user} styles={styles} colors={colors} onProfile={goProfile} />
            {!OWN_HEADING.has(section) && (
              <View style={styles.sectionHeadRow}>
                <Text style={styles.sectionHeadTitle}>{SECTION_TITLE[section] || ''}</Text>
              </View>
            )}
            {content}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.narrowTop}>
        <Pressable
          onPress={() => setDrawerOpen(true)}
          hitSlop={8}
          style={styles.hamburger}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
        >
          <Text style={{ fontSize: 22, color: colors.textSecondary }}>☰</Text>
        </Pressable>
        <Logo size="sm" />
        <View style={{ flex: 1 }} />
        <Pressable style={styles.bell} hitSlop={8}>
          <Text style={{ fontSize: 15 }}>🔔</Text>
        </Pressable>
        <Pressable
          onPress={goProfile}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          style={({ pressed }) => [styles.avatar, { marginLeft: spacing.sm }, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.avatarTxt}>{initials(user?.name)}</Text>
        </Pressable>
      </View>
      {content}
      <MobileDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        activeSection={navActiveSection}
        onNav={handleNav}
        onProfile={goProfile}
      />
    </View>
  );
}

const SIDEBAR_W = 220;
const SIDEBAR_COLLAPSED_W = 68;

const makeStyles = ({ colors }) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    rowLayout: { flex: 1, flexDirection: 'row' },

    sidebar: {
      width: SIDEBAR_W,
      backgroundColor: colors.backgroundElevated,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
    },
    sidebarCollapsed: { width: SIDEBAR_COLLAPSED_W, paddingHorizontal: spacing.sm, alignItems: 'center' },
    sidebarNarrow: { width: '100%' },
    brandRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, marginBottom: spacing.xl },
    collapseBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceAlt,
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    navList: { gap: 6, alignSelf: 'stretch' },
    navListNarrow: { flexDirection: 'row', gap: 8 },

    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 11,
      paddingHorizontal: 14,
      borderRadius: radius.md,
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    navItemCollapsed: { paddingHorizontal: 0, justifyContent: 'center', gap: 0 },
    navItemActive: { backgroundColor: colors.primary },
    navItemHover: { backgroundColor: colors.surfaceAlt },
    navIcon: { fontSize: 16 },
    navLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    navLabelActive: { color: '#fff' },

    main: { flex: 1 },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    hamburger: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    bell: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    userChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    userChipHover: Platform.select({ web: { backgroundColor: colors.border }, default: {} }),
    avatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarTxt: { color: '#fff', fontWeight: '800', fontSize: 11 },
    userName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, maxWidth: 90 },

    sectionHeadRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
    sectionHeadTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },

    scrollContent: { padding: spacing.lg, gap: spacing.md },

    narrowTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    railWrap: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
    rail: { paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, gap: 6 },

    // Mobile slide-in drawer
    drawerRoot: { flex: 1, flexDirection: 'row' },
    drawerScrim: { backgroundColor: 'rgba(8,8,12,0.5)' },
    drawerPanel: {
      backgroundColor: colors.backgroundElevated,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      paddingTop: Platform.OS === 'web' ? spacing.lg : spacing.xl,
      paddingBottom: spacing.md,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 24,
      shadowOffset: { width: 4, height: 0 },
      elevation: 16,
    },
    drawerBrand: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
    drawerProfile: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceAlt,
      ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
    },
    drawerAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    drawerAvatarTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
    drawerHi: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
    drawerViewProfile: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
    drawerNavList: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, gap: 4 },
    drawerThemeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: spacing.md,
      marginTop: spacing.sm,
      paddingTop: spacing.md,
      paddingHorizontal: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    drawerThemeLabel: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  });
