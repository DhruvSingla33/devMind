import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import LeaderboardScreen from '../screens/leaderboard/LeaderboardScreen';
import SubscriptionScreen from '../screens/premium/SubscriptionScreen';
import { useTheme } from '../theme/ThemeContext';
import { useHeaderOptions } from './headerOptions';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: '🏠',
  Leaderboard: '🏆',
  AarambhPlus: 'A',
};

// Textbooks, Tests, More and Profile aren't tabs — they're registered as
// sibling screens on the parent MainStack (pushed on top, same as Admin) and
// reached from links on Home / Profile. Keeping this Tab.Navigator to just
// the 3 screens actually shown avoids the layout/label-width issues that come
// from registering hidden tabs here.
export default function AppTabs() {
  const { colors } = useTheme();
  const headerOptions = useHeaderOptions();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerOptions,
        // Bottom tab bar is hidden: all navigation now lives in the dashboard's
        // left sidebar (Home / Analytics / Leaderboard / Aarambh+ / …).
        tabBarStyle: { display: 'none' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 18, color, fontWeight: route.name === 'AarambhPlus' ? '800' : '400' }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen
        name="AarambhPlus"
        component={SubscriptionScreen}
        options={{ title: 'Aarambh+', headerShown: false }}
      />
    </Tab.Navigator>
  );
}
