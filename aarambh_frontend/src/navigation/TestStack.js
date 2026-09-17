import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TestListScreen from '../screens/tests/TestListScreen';
import MixQuizSetupScreen from '../screens/tests/MixQuizSetupScreen';
import TestAttemptScreen from '../screens/tests/TestAttemptScreen';
import TestResultScreen from '../screens/tests/TestResultScreen';
import MyAttemptsScreen from '../screens/tests/MyAttemptsScreen';
import headerOptions from './headerOptions';

const Stack = createNativeStackNavigator();

export default function TestStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="TestList" component={TestListScreen} options={{ title: 'Tests' }} />
      <Stack.Screen
        name="MixQuizSetup"
        component={MixQuizSetupScreen}
        options={{ title: 'Mix Quiz' }}
      />
      <Stack.Screen
        name="TestAttempt"
        component={TestAttemptScreen}
        options={{ title: 'Test in progress', headerBackVisible: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="TestResult"
        component={TestResultScreen}
        options={{ title: 'Result', headerBackVisible: false }}
      />
      <Stack.Screen
        name="MyAttempts"
        component={MyAttemptsScreen}
        options={{ title: 'My Attempts' }}
      />
    </Stack.Navigator>
  );
}
