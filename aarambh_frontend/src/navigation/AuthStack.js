import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetOtpScreen from '../screens/auth/ResetOtpScreen';
// Registered below as "ResetPasswordOtp" (not "ResetPassword") — MainStack
// already has an authenticated "ResetPassword" screen (old→new password,
// reached from Profile) and the two must not share a route name.
import ResetPasswordOtpScreen from '../screens/auth/ResetPasswordScreen';
// OTP sign-in is off for now (no OTP service yet) — kept commented, not removed.
// import OtpScreen from '../screens/auth/OtpScreen';
import PublicBookDetailScreen from '../screens/public/PublicBookDetailScreen';
import PublicChapterReaderScreen from '../screens/public/PublicChapterReaderScreen';
import { useHeaderOptions } from './headerOptions';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  const headerOptions = useHeaderOptions();
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
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: 'Forgot password' }}
      />
      <Stack.Screen name="ResetOtp" component={ResetOtpScreen} options={{ title: 'Enter OTP' }} />
      <Stack.Screen
        name="ResetPasswordOtp"
        component={ResetPasswordOtpScreen}
        options={{ title: 'Reset password' }}
      />
      {/* OTP sign-in is off for now — kept commented, not removed. */}
      {/* <Stack.Screen name="Otp" component={OtpScreen} options={{ title: 'OTP Sign-in' }} /> */}
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
