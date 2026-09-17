import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './AppTabs';
import AdminStack from './AdminStack';

const Stack = createNativeStackNavigator();

// Authenticated shell: everyone (admins included) lands on the normal student
// tab app. Admins can push the content-management panel on top of it from the
// Profile tab; it's a separate screen rather than a tab, so the tab bar hides
// while managing content and the browser back button returns to the app.
export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={AppTabs} />
      <Stack.Screen name="Admin" component={AdminStack} />
    </Stack.Navigator>
  );
}
