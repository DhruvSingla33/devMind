import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import TextbookStack from './TextbookStack';
import TestStack from './TestStack';
import MoreStack from './MoreStack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import colors from '../theme/colors';
import headerOptions from './headerOptions';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: '🏠',
  TextbooksTab: '📚',
  TestsTab: '📝',
  MoreTab: '🧭',
  Profile: '👤',
};

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerOptions,
        tabBarStyle: { backgroundColor: colors.backgroundElevated, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 18, color }}>{TAB_ICONS[route.name]}</Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="TextbooksTab" component={TextbookStack} options={{ headerShown: false, title: 'Textbooks' }} />
      <Tab.Screen name="TestsTab" component={TestStack} options={{ headerShown: false, title: 'Tests' }} />
      <Tab.Screen name="MoreTab" component={MoreStack} options={{ headerShown: false, title: 'More' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
