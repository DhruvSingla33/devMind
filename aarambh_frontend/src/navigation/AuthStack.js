import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import PublicBookDetailScreen from '../screens/public/PublicBookDetailScreen';
import PublicChapterReaderScreen from '../screens/public/PublicChapterReaderScreen';
import headerOptions from './headerOptions';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        ...headerOptions,
        // The web variants of Login/Signup/Otp render their own full-bleed
        // dark auth card with no surrounding chrome (see AuthCard.js) — the
        // light native-stack header would clash with it. Native keeps the
        // header (back gesture, title) since those screens still use the
        // plain light layout there.
        headerShown: Platform.OS !== 'web',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log in' }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign up' }} />
      <Stack.Screen name="Otp" component={OtpScreen} options={{ title: 'OTP Sign-in' }} />
      <Stack.Screen
        name="PublicBookDetail"
        component={PublicBookDetailScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="PublicChapterReader"
        component={PublicChapterReaderScreen}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
}
