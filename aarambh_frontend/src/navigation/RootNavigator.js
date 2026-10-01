import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import LoadingState from '../components/LoadingState';
import { makeNavigationTheme } from './navigationTheme';
import linking from './linking';

export default function RootNavigator() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const { colors, isDark } = useTheme();
  const navigationTheme = makeNavigationTheme(colors, isDark);

  if (isBootstrapping) {
    return <LoadingState label="Preparing Aarambh…" />;
  }

  // Everyone signs into the same student app (MainStack). Admins reach the
  // content-management panel from the Profile tab — it's pushed on top, not a
  // separate root — so they can see exactly what a normal user sees.
  return (
    <NavigationContainer theme={navigationTheme} linking={linking}>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
