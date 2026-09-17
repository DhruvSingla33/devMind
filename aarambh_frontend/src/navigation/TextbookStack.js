import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TextbookListScreen from '../screens/textbooks/TextbookListScreen';
import TextbookDetailScreen from '../screens/textbooks/TextbookDetailScreen';
import ChapterScreen from '../screens/textbooks/ChapterScreen';
import headerOptions from './headerOptions';

const Stack = createNativeStackNavigator();

export default function TextbookStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="TextbookList" component={TextbookListScreen} options={{ title: 'Textbooks' }} />
      <Stack.Screen name="TextbookDetail" component={TextbookDetailScreen} />
      <Stack.Screen name="Chapter" component={ChapterScreen} />
    </Stack.Navigator>
  );
}
