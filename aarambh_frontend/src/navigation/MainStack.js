import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './AppTabs';
import AdminStack from './AdminStack';
import TextbookStack from './TextbookStack';
import TestStack from './TestStack';
import MoreStack from './MoreStack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ResetPasswordScreen from '../screens/profile/ResetPasswordScreen';
import { useHeaderOptions } from './headerOptions';

const Stack = createNativeStackNavigator();

// Authenticated shell: everyone (admins included) lands on the normal student
// tab app (Home / Leaderboard / Aarambh+ — see AppTabs). Textbooks, Tests,
// More and Profile aren't tabs; like Admin they're pushed on top from links
// inside Home/Profile — `navigation.navigate('TextbooksTab', ...)` calls
// made from inside the Tab.Navigator bubble up and resolve here, the same
// way `navigate('Admin')` already did before this screen existed.
export default function MainStack() {
  const headerOptions = useHeaderOptions();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={AppTabs} />
      <Stack.Screen name="Admin" component={AdminStack} />
      <Stack.Screen name="TextbooksTab" component={TextbookStack} />
      <Stack.Screen name="TestsTab" component={TestStack} />
      <Stack.Screen name="MoreTab" component={MoreStack} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ ...headerOptions, headerShown: true, title: 'Profile' }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ ...headerOptions, headerShown: true, title: 'Reset password' }}
      />
    </Stack.Navigator>
  );
}
